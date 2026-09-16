# PAIMANA — System Architecture & Data Flow
### For any AI agent or developer reading this to understand the codebase

---

## Input → Output Summary

| Input | What it is | Output |
|:---|:---|:---|
| `data/pdfs/*.pdf` | Official MoSPI PAIMANA Flash Reports | `data/raw/*.csv` (one per month) |
| `data/raw/*.csv` | Monthly project snapshots | `data/processed/full_panel.parquet` |
| `full_panel.parquet` | Multi-month labelled panel | `*.joblib` trained ML models |
| `*.joblib` + `full_panel.parquet` | Models + latest-month snapshot | `latest_snapshot.json`, `portfolio_kpis.json` |
| `latest_snapshot.json` | Scored project data | REST API responses to frontend |

---

## Pipeline Stage 1 — PDF Extraction (`src/pdf_extracter.py`)

**Input:** Official Government PDF (e.g., `FlashReport_July_2026.pdf`)  
**Output:** `data/raw/July2026.csv`

### What it does
The PDFs contain "Table 6: All Ongoing Projects" — a multi-page, multi-column table with project-level data. Standard CSV-export tools fail because:
- The "Project Name / Agency / Code" block is a visually stacked column (3 logical rows in 1 PDF column)
- State can span 8 lines (multi-state projects like North-East Gas Grid)
- Sector and Ministry headers float between rows

The extractor uses **word-level coordinate extraction** (pdfplumber) rather than text parsing. It:
1. Finds Table 6 by scanning for the header text across pages
2. Uses horizontal x-coordinate bands to assign each word to its column
3. Uses sl.no row anchor positions to cluster words to their project record
4. Parses cost/date columns: top value = original, bracketed value = revised

### Known edge case
Projects whose name runs across two PDF rows (Sl.No boundary) get recovered via overflow propagation. Example: "North East Gas Grid" (code 701346) whose name text appeared in the row above in earlier PDF layouts.

### Output columns
```
sl_no, project_name, agency, project_code, legacy_ocms_code, pmgid,
state, approval_date, start_date, target_doc, revised_doc,
original_cost_cr, revised_cost_cr, cumulative_expenditure_cr,
physical_progress_pct, ministry, sector, report_month
```

---

## Pipeline Stage 2 — Data Loading (`src/data_loader.py`)

**Input:** All `data/raw/*.csv` files  
**Output:** Cleaned, unified `pd.DataFrame`

### What it does
- Reads all monthly CSVs and concatenates them
- `clean_numeric()`: strips commas, dashes; returns `np.nan` for invalid values
- `parse_mmyyyy()`: converts "07/2026" → `pd.Timestamp(2026, 7, 1)`
- Deduplicates on `(project_code, report_month_dt)`, keeping the last record
- Sorts by `(project_code, report_month_dt)` for time-series operations

---

## Pipeline Stage 3 — Feature Engineering (`src/features.py`)

**Input:** Cleaned panel  
**Output:** Panel with ~15 new derived KPI columns

### Snapshot Features (per row, no time-series needed)

| Feature | Formula | Meaning |
|:---|:---|:---|
| `planned_duration_m` | `month_diff(start_date, target_doc)` | Originally planned project length in months |
| `age_m` | `month_diff(start_date, report_month_dt)` | How many months since project started |
| `elapsed_frac` | `age_m / planned_duration_m`, clipped 0–10 | What fraction of planned duration has elapsed |
| `expected_progress_pct` | `elapsed_frac × 100`, clipped 0–100 | Where physical progress *should* be linearly |
| `progress_gap` | `physical_progress_pct − expected_progress_pct` | Negative = behind schedule |
| `cost_overrun_ratio_so_far` | `(revised_cost − original_cost) / original_cost` | 0 = no overrun, 0.5 = 50% overrun |
| `expenditure_util_pct` | `100 × expenditure / revised_cost`, clipped 0–500 | How much of the revised budget is spent |
| `spend_vs_progress_gap` | `expenditure_util_pct − physical_progress_pct` | Positive = spending faster than progress |
| `doc_slip_months_so_far` | `month_diff(target_doc, revised_doc)` | Total months of official schedule delay |
| `doc_already_slipped` | `1 if doc_slip > 0 else 0` | Binary: has schedule already slipped? |

### Velocity Features (time-series, require ≥ 2 monthly snapshots)

| Feature | Formula | Meaning |
|:---|:---|:---|
| `progress_velocity` | `(progress − progress[−window]) / window` | Progress change per month over last N months |
| `cost_revision_count_cum` | Cumulative count of upward cost revisions | How many times has budget been escalated? |
| `doc_revision_count_cum` | Cumulative count of DOC pushes | How many times has deadline been extended? |
| `agency_avg_overrun` | Mean `cost_overrun_ratio_so_far` across all projects of same agency | Agency-level track record |

### Risk Score Computation

A domain-calibrated composite index using bounded normalization (not global min-max, which caused all projects to cluster at 0 with outliers distorting the scale):

```python
cost_risk     = clip(cost_overrun_ratio, 0, 0.50) / 0.50      # 50% overrun = score 1.0
schedule_risk = clip(doc_slip_months, 0, 36) / 36             # 3 years delay = score 1.0
progress_risk = clip(-progress_gap, 0, 40) / 40              # 40% behind = score 1.0
spend_risk    = clip(spend_vs_progress_gap, 0, 40) / 40      # 40pt excess spend = score 1.0
revision_risk = clip(cost_revisions + doc_revisions, 0, 3)/3  # 3+ revisions = score 1.0

risk_score = 100 × (0.30×cost + 0.25×schedule + 0.20×progress + 0.15×spend + 0.10×revision)
```

Bands: **0–25 = Low**, **25–50 = Medium**, **50–75 = High**, **75–100 = Critical**

### Primary Risk Driver
For each project, the weighted component scores are compared and the highest is labeled `primary_risk_driver`. This is used for explainability in the dashboard without needing SHAP.

---

## Pipeline Stage 4 — Label Engineering (`src/labels.py`)

**Input:** Panel with features  
**Output:** Two binary label columns for supervised learning

Both labels look `horizon` months into the future per project:

| Label | Definition | Class balance (4 months) |
|:---|:---|:---|
| `cost_revised_up_label` | Did revised_cost_cr increase by >0.1% in the next month? | 76 positive / 5,362 negative |
| `schedule_slipped_label` | Did revised_doc get pushed further in the next month? | 928 positive / 3,576 negative |

Rows at the latest month of each project have no future data → labeled `NaN` → dropped at training time (not zero-filled — zero-fill would create false negatives).

---

## Pipeline Stage 5 — Model Training (`src/model_train.py`)

See `docs/ML_DESIGN.md` for full reasoning. Summary:

- Drops `NaN` labels, replaces `inf` with `NaN`, uses `SimpleImputer(median)` for remaining NaN features
- Trains 2 models per target: **Logistic Regression** (statistical baseline) + **Gradient Boosting** (ML)
- Wraps each in `sklearn.pipeline.Pipeline` (imputer → scaler → classifier)
- Evaluates on **ROC-AUC** and **PR-AUC** (precision-recall AUC, better for imbalanced classes)
- Saves both models as `.joblib` files

---

## Pipeline Stage 6 — Backend Export (`src/export_for_backend.py`)

- Loads `full_panel.parquet` and takes the **last available month** per project (`groupby.tail(1)`)
- Loads both trained Gradient Boosting models
- Runs `.predict_proba()` for each project → `cost_revised_up_risk_pct`, `schedule_slipped_risk_pct`
- Writes `latest_snapshot.json` (one record per project) and `portfolio_kpis.json` (aggregate stats)

---

## Backend API (`backend/server.js`)

Node.js + Express. Reads JSON files into memory on startup for sub-millisecond responses.

| Endpoint | Method | Purpose |
|:---|:---|:---|
| `/api/health` | GET | Status, loaded count |
| `/api/kpis` | GET | Portfolio totals, risk distribution, driver breakdown |
| `/api/filters` | GET | All unique ministries, states, risk bands, drivers |
| `/api/alerts` | GET | Top High/Critical projects sorted by risk score |
| `/api/projects` | GET | Paginated, filterable, searchable project list |
| `/api/projects/:code` | GET | Single project with analytics + AI assessment text |
| `/api/benchmarks/ministries` | GET | Ministry-level overrun and delay rankings |
| `/api/reload` | POST | Hot-reload JSON data without restarting server |

### Query Parameters for `/api/projects`
```
?search=NHAI           → filter by name, code, or agency substring
?risk_band=Critical,High
?ministry=Ministry of Railways
?state=Bihar
?driver=Cost Escalation
?sort_by=risk_score&order=desc
?page=2&limit=20
?limit=all             → returns all 2059 projects
```

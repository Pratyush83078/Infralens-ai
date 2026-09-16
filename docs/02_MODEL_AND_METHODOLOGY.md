# 02 — Machine Learning Model & Methodology
### PAIMANA AI: Target Variables, Features, Algorithms & Evaluation Metrics

---

## 1. Confirmed Target Variables ($y$)

The predictive engine frames early warning as **two supervised binary classification tasks**:

| Target Variable | Question Answered | Definition & Threshold | Code Reference |
| :--- | :--- | :--- | :--- |
| **`cost_revised_up_label`** | *Will the project's official cost jump next month?* | $1$ if `revised_cost_future` $> 1.001 \times$ `revised_cost_cr`, else $0$. | [`src/labels.py:L10-L12`](../src/labels.py#L10-L12) |
| **`schedule_slipped_label`** | *Will the completion deadline get pushed next month?* | $1$ if `revised_doc_future` $>$ `revised_doc`, else $0$. | [`src/labels.py:L13-L15`](../src/labels.py#L13-L15) |

*Note: The latest monthly snapshot has unknown future values and is assigned `NaN`, automatically excluded from training data and reserved for live prediction export.*

---

## 2. Input Features ($X$) & CUF Field Mapping

**CUF (Common Upload Format)** is the standardized data entry form prescribed by MoSPI for Table 6 of the Monthly Flash Report. The model extracts raw CUF fields and engineers **13 dynamic features**:

```
┌────────────────────────────────────────────────────────┐
│               RAW CUF / TABLE 6 COLUMNS                │
├────────────────────────────────────────────────────────┤
│ • original_cost_cr         • revised_cost_cr           │
│ • cumulative_expenditure_cr • physical_progress_pct     │
│ • start_date               • target_doc (original DOC) │
│ • revised_doc              • agency                    │
│ • report_month_dt                                      │
└───────────────────────────┬────────────────────────────┘
                            │ Feature Engineering (src/features.py)
                            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       THE 13 MODEL FEATURES (X)                            │
├───────────────────────────┬────────────────────────────────────────────────┤
│ 1. original_cost_cr       │ Direct initial sanctioned budget in ₹ Crores.  │
│ 2. planned_duration_m     │ Planned duration: month_diff(start, target).   │
│ 3. age_m                  │ Months since project inception.                │
│ 4. elapsed_frac           │ age_m / planned_duration_m.                    │
│ 5. progress_gap           │ physical_progress_pct - expected_progress_pct. │
│ 6. expenditure_util_pct   │ cumulative_expenditure / revised_cost * 100.   │
│ 7. spend_vs_progress_gap  │ expenditure_util_pct - physical_progress_pct.  │
│ 8. doc_already_slipped    │ Binary flag (1 if delay > 0 months, else 0).   │
│ 9. doc_slip_months_so_far │ Calendar delay months: month_diff(target, rev).│
│ 10. progress_velocity     │ 3-month trailing rolling progress change %.    │
│ 11. cost_revision_count   │ Cumulative historical upward budget revisions. │
│ 12. doc_revision_count    │ Cumulative historical deadline push revisions. │
│ 13. agency_avg_overrun    │ Historical average overrun ratio of the agency.│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pure Mathematics vs Machine Learning

| Component | Category | How It Is Computed | File & Line Reference |
| :--- | :--- | :--- | :--- |
| **`cost_overrun_ratio_so_far`** | Pure Math | `(revised_cost - original_cost) / original_cost` | [`src/features.py:L24-L26`](../src/features.py#L24-L26) |
| **`doc_slip_months_so_far`** | Pure Math | Calendar months between `target_doc` and `revised_doc` | [`src/features.py:L36-L38`](../src/features.py#L36-L38) |
| **`progress_gap`** | Pure Math | `physical_progress_pct - expected_progress_pct` | [`src/features.py:L20`](../src/features.py#L20) |
| **`spend_vs_progress_gap`** | Pure Math | `expenditure_util_pct - physical_progress_pct` | [`src/features.py:L32-L34`](../src/features.py#L32-L34) |
| **`risk_score` (0–100)** | Pure Math (Rule Engine) | `0.30*cost + 0.25*slip + 0.20*progress + 0.15*spend + 0.10*revisions` | [`src/features.py:L81-L88`](../src/features.py#L81-L88) |
| **`risk_band`** | Pure Math (Binning) | Threshold cuts: `Low (0–24)`, `Medium (25–49)`, `High (50–74)`, `Critical (75–100)` | [`src/features.py:L90-L94`](../src/features.py#L90-L94) |
| **`primary_risk_driver`** | Pure Math (Max Index) | `risk_matrix.idxmax(axis=1)` from 5 risk components | [`src/features.py:L97-L104`](../src/features.py#L97-L104) |
| **`cost_revised_up_risk_pct`** | **AI / Machine Learning** | Probability from trained `GradientBoostingClassifier` | [`src/model_train.py:L39-L44`](../src/model_train.py#L39-L44) |
| **`schedule_slipped_risk_pct`**| **AI / Machine Learning** | Probability from trained `GradientBoostingClassifier` | [`src/model_train.py:L39-L44`](../src/model_train.py#L39-L44) |

---

## 4. Algorithms Evaluated & Training Pipelines

Defined in [`src/model_train.py:L29-L45`](../src/model_train.py#L29-L45):

### Model 1: `LogisticRegression` (Conventional Statistical Baseline)
- **Pipeline**: `SimpleImputer(strategy="median")` $\to$ `StandardScaler()` $\to$ `LogisticRegression(class_weight="balanced", random_state=42)`
- **Role**: Serves as the required statistical baseline to satisfy SIH Outcome (e).

### Model 2: `GradientBoostingClassifier` (Ensemble ML Champion)
- **Pipeline**: `SimpleImputer(strategy="median")` $\to$ `GradientBoostingClassifier(random_state=42)`
- **Role**: Production model. Sequentially trains shallow decision trees to capture complex non-linear combinations (e.g. stalled progress velocity + severe expenditure divergence).

---

## 5. Evaluation Metrics & The Accuracy Trap

> [!WARNING]
> **Why Accuracy % is a Trap for Cost Overruns**:
> Across 5,438 training records, only **76 records (1.4%)** had a cost revision next month. A naive model predicting `0` every single time achieves **98.6% accuracy**, but fails to catch a single project failure.

We evaluate using **ROC-AUC** (discrimination ability across thresholds) and **PR-AUC** (precision-recall for rare events):

| Prediction Task | Metric | Baseline (`LogisticRegression`) | Champion (`GradientBoosting`) | Interpretation |
| :--- | :--- | :---: | :---: | :--- |
| **Cost Overrun Early Warning** | **ROC-AUC** | **0.886** | **0.883** | Strong separation (> 0.85). |
| (`cost_revised_up_label`, 1.4% pos) | **PR-AUC** | 0.081 | **0.082** | **~6× lift** over random baseline (0.014). |
| **Schedule Slippage Early Warning** | **ROC-AUC** | 0.771 | **0.802** | Gradient Boosting dominates significantly. |
| (`schedule_slipped_label`, 20.6% pos)| **PR-AUC** | 0.375 | **0.482** | **2.3× lift** over random baseline (0.206). |

---

## 6. Explainability Layer & SHAP Roadmap

1. **Deterministic Driver Attribution (Live Today)**:
   [`src/features.py:L97-L104`](../src/features.py#L97-L104) decomposes distress into:
   - `Cost Escalation`
   - `Schedule Delay`
   - `Slow Physical Progress`
   - `Excessive Expenditure`
   - `Repeated Revisions`
2. **Automated Plain-English AI Narrative**:
   [`backend/server.js:L255-L271`](../backend/server.js#L255-L271) dynamically synthesizes plain-language directives for ministers:
   > *"CRITICAL INTERVENTION REQUIRED: Driven primarily by Cost Escalation. The project exhibits a delay of 34 months with cost escalation of 63.3%."*
3. **SHAP Integration (Phase 2 Roadmap)**:
   Integration of `shap.TreeExplainer(model)` to compute exact game-theoretic Shapley values per project for granular waterfall contribution plots.

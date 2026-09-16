# Feature Roadmap — Done vs To-Do
### What's built, what's missing, and what to add next

---

## ✅ Already Built (MVP — Working Today)

### Data Pipeline
| Feature | File | Status |
|:---|:---|:---:|
| PDF → CSV extraction (all 4 months) | `src/pdf_extracter.py` | ✅ Done |
| Multi-page, multi-column table parsing | `src/pdf_extracter.py` | ✅ Done |
| Name overflow / multi-state row recovery | `src/pdf_extracter.py` | ✅ Done |
| Date parsing MM/YYYY → Timestamp | `src/data_loader.py` | ✅ Done |
| Duplicate row deduplication | `src/data_loader.py` | ✅ Done |
| One-command pipeline runner | `src/run_all.py` | ✅ Done |

### Feature Engineering
| Feature | File | Status |
|:---|:---|:---:|
| `cost_overrun_ratio_so_far` | `features.py` | ✅ Done |
| `doc_slip_months_so_far` | `features.py` | ✅ Done |
| `progress_gap` (actual vs expected progress) | `features.py` | ✅ Done |
| `expenditure_util_pct` | `features.py` | ✅ Done |
| `spend_vs_progress_gap` | `features.py` | ✅ Done |
| `elapsed_frac` | `features.py` | ✅ Done |
| `doc_already_slipped` (binary) | `features.py` | ✅ Done |
| `agency_avg_overrun` (track record) | `features.py` | ✅ Done |
| Progress velocity (month-over-month) | `features.py` | ✅ Done |
| Cost revision count (cumulative) | `features.py` | ✅ Done |
| Ministry/state sector dummies | `pipeline.py` | ✅ Done |

### Risk Scoring (Rules-Based)
| Feature | File | Status |
|:---|:---|:---:|
| Composite risk score 0–100 | `features.py` | ✅ Done |
| 4 risk bands (Low/Medium/High/Critical) | `features.py` | ✅ Done |
| Primary risk driver attribution | `features.py` | ✅ Done |

### ML Models (scikit-learn)
| Feature | File | Status |
|:---|:---|:---:|
| Cost overrun early warning (Logistic Regression baseline) | `model_train.py` | ✅ Done |
| Cost overrun early warning (Gradient Boosting) | `model_train.py` | ✅ Done |
| Schedule slip early warning (Logistic Regression baseline) | `model_train.py` | ✅ Done |
| Schedule slip early warning (Gradient Boosting) | `model_train.py` | ✅ Done |
| ROC-AUC + PR-AUC evaluation | `model_train.py` | ✅ Done |
| ML vs Statistical model comparison (SIH outcome b) | `model_train.py` | ✅ Done |

### Backend API (Node.js)
| Endpoint | Status |
|:---|:---:|
| `GET /api/health` | ✅ Done |
| `GET /api/kpis` — portfolio summary | ✅ Done |
| `GET /api/filters` — unique values for dropdowns | ✅ Done |
| `GET /api/alerts` — top High/Critical projects | ✅ Done |
| `GET /api/projects` — paginated, filtered, searched list | ✅ Done |
| `GET /api/projects/:code` — single project + AI narrative | ✅ Done |
| `GET /api/projects/:code/peers` — peer benchmarking | ✅ Done |
| `GET /api/benchmarks/ministries` — ministry rankings | ✅ Done |
| `POST /api/reload` — hot reload after re-training | ✅ Done |

### Documentation
| Doc | Status |
|:---|:---:|
| `docs/README.md` | ✅ Done |
| `docs/ARCHITECTURE.md` | ✅ Done |
| `docs/ML_DESIGN.md` | ✅ Done |
| `docs/FEATURES_COVERAGE.md` (SIH a–i checklist) | ✅ Done |
| `docs/PROJECT_JOURNEY_EXAMPLE.md` | ✅ Done |
| `docs/WHAT_ML_ACTUALLY_DOES.md` | ✅ Done |

---

## 🔴 Missing — Must Add Before SIH Demo

### Frontend Dashboard (SIH Outcome g — 0% complete)
| Screen | What it shows | Priority |
|:---|:---|:---:|
| KPI Header Cards | Total projects, Critical count, total cost, avg overrun | 🔴 P0 |
| Risk Distribution Chart | Donut: Low/Medium/High/Critical | 🔴 P0 |
| Early Warning Feed | Top 10 Critical projects with risk score | 🔴 P0 |
| Project Explorer Table | Filterable, searchable, sortable table | 🔴 P0 |
| Project Detail Modal | Full breakdown + ML predictions + AI narrative | 🔴 P0 |
| Peer Comparison Panel | "Similar projects in same state" visual | 🟡 P1 |
| Ministry Benchmark Chart | Bar chart: overrun by ministry | 🟡 P1 |
| Model Accuracy Panel | Show ROC-AUC numbers, model vs baseline comparison | 🟡 P1 |

---

## 🟡 Should Add — Significantly Improves Score

### SHAP Explainability (replaces rule-based driver attribution)
| Feature | Effort | Impact |
|:---|:---:|:---:|
| `pip install shap` | 5 min | Low |
| `shap.TreeExplainer(gradient_boosting_model)` | 2 hours | **HIGH** — actual ML feature attribution |
| Per-project SHAP force plot (show top 3 features) | 1 hour | High |
| Store top SHAP feature per project in JSON | 30 min | High |

> With SHAP, `primary_risk_driver` becomes truly ML-driven, not a formula. This is a major credibility upgrade.

### Overrun Magnitude Prediction (currently only probability, not ₹ amount)
| Feature | Effort | Impact |
|:---|:---:|:---:|
| `GradientBoostingRegressor` to predict ₹Cr increase | 3 hours | High |
| `QuantileRegressor` for uncertainty range (₹X–₹Y Cr) | 2 hours | High |
| Add `predicted_cost_escalation_cr` to JSON export | 1 hour | High |

### More Historical Data
| Action | Impact |
|:---|:---:|
| Add Oct–Mar 2025–26 PAIMANA PDFs (6 more months) | ML models see 3× more events → better accuracy |
| OCMS historical data (pre-2025) | Potentially 10+ years → major improvement |
> Each additional month adds ~2,000 rows and more "cost revision" events for the rare class.
> Currently only 76 cost revision events. Even 6 more months could double this.

### XGBoost Upgrade (drop-in replacement)
| Step | Effort |
|:---|:---:|
| `pip install xgboost lightgbm` | 5 min |
| Replace `GradientBoostingClassifier` → `XGBClassifier` | 30 min |
| Add `scale_pos_weight` for class imbalance | 10 min |
| Add to SIH comparison table (Logistic vs GBM vs XGB) | 20 min |

---

## 🔵 Phase 2 — Post-Hackathon / Nice to Have

### LLM Integration (SIH Outcome h)
| Feature | How |
|:---|:---|
| Natural language risk briefing per project | Gemini API (free tier) — stuff JSON into prompt |
| "Why is this project risky?" Q&A | RAG over `latest_snapshot.json` |
| Ministry-level summary generation | Weekly automated report in natural language |

> Effort: ~1–2 days. Requires Gemini API key (free at ai.google.dev).

### Survival Analysis (Cox Proportional Hazards)
| Feature | How | Library |
|:---|:---|:---|
| "Time until first cost revision" prediction | Cox PH model on months-since-start | `lifelines` |
| "Probability project completes on time" | Kaplan-Meier curve | `lifelines` |

> Effort: 2–3 days. Requires more historical data to be meaningful.

### Real-Time Data Pipeline
| Feature | How |
|:---|:---|
| Auto-detect new PDF on PAIMANA portal | Scheduled scraper (Puppeteer or Python requests) |
| Trigger `run_all.py` automatically | cron job or GitHub Actions |
| Push updated JSON to backend | `POST /api/reload` |

---

## Priority Order for SIH

```
TODAY:      Build frontend dashboard (P0 — judges will interact with this)
TOMORROW:   Add SHAP explainability (biggest ML credibility gain)
DAY 3:      Add magnitude regression (predict ₹Cr, not just probability)
DAY 4:      Add more PDFs (historical data), XGBoost comparison
DAY 5:      LLM narrative (Gemini API), polish dashboard
```

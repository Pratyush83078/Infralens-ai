# PAIMANA — ML Design Document
### Model Selection, Trade-offs, Evaluation, and Roadmap

---

## The Core ML Task

We have **two supervised binary classification problems**:

1. **Cost Overrun Early Warning**: Given this project's current state, will the government formally revise its cost upward in the next month?
2. **Schedule Slip Early Warning**: Given this project's current state, will the revised completion date get pushed further in the next month?

Both are trained on 4 months of data (April–July 2026), producing a panel of ~7,497 rows.

---

## Why Scikit-Learn? (Honest Answer)

### What we used
- `LogisticRegression` (statistical baseline)
- `GradientBoostingClassifier` from scikit-learn

### Why not XGBoost / LightGBM / CatBoost right now?

| Reason | Explanation |
|:---|:---|
| **Zero extra dependency** | scikit-learn is already installed. XGBoost/LightGBM require `pip install xgboost lightgbm`. For a hackathon MVP running on a judge's machine, fewer dependencies = fewer failures. |
| **Data volume doesn't justify it yet** | We have ~3,200 usable training rows for cost overrun after dropping NaN labels. XGBoost's advantage over GBM comes at scale (100K+ rows). The gap here is negligible. |
| **SIH scoring explicitly wants comparison** | The problem statement says compare AI/ML vs conventional statistics. `LogisticRegression` (conventional) vs `GradientBoostingClassifier` (ML) satisfies this requirement cleanly. |
| **`HistGradientBoostingClassifier` handles NaN natively** | We switched to this for the pipeline variant — it's faster than standard GBM and handles missing values without a separate imputer. |

### When to upgrade (post-MVP)
- Add `xgboost` and `lightgbm` to `requirements.txt`
- Replace `GradientBoostingClassifier` with `xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')`
- Add `SHAP` for proper per-project feature attribution (replaces the current weighted-score `primary_risk_driver`)

---

## Does Our Approach Satisfy the SIH Table?

The SIH problem suggests this ideal model lineup:

| Task | Suggested Best | Our Current | Gap |
|:---|:---|:---|:---|
| Cost overrun probability | XGBoost/LightGBM/CatBoost | GradientBoostingClassifier | Minor — same family, smaller version |
| Schedule slip probability | Same | Same | Minor |
| Overrun magnitude (₹ or %) | Gradient Boosting Regressor or quantile regression | ❌ Not yet implemented | Medium |
| Time-to-delay (survival analysis) | Cox Proportional Hazards | ❌ Not yet implemented | High |
| Baseline for comparison | Logistic Regression | ✅ LogisticRegression | Complete |
| Explainability | SHAP values | ⚠️ Weighted score proxy (`primary_risk_driver`) | Partial |

### Verdict: MVP is solid. Two gaps to close before final submission.

---

## Current Evaluation Results (4 Months Data)

### Cost Overrun Early Warning
- Training rows: 5,438 (after NaN drop)
- Class balance: 76 positive (1.4%) vs 5,362 negative (98.6%) → heavily imbalanced

| Model | ROC-AUC | PR-AUC |
|:---|---:|---:|
| Logistic Regression | **0.886** | 0.081 |
| Gradient Boosting | **0.883** | 0.082 |

**Interpretation:** Both models are statistically strong (AUC > 0.85). PR-AUC is low because the class is rare (1.4%). This is expected and honest — cost revisions happen infrequently. As more months are added, the model will see more positive examples and PR-AUC will improve.

### Schedule Slip Early Warning
- Training rows: 4,504 (after NaN drop)
- Class balance: 928 positive (20.6%) vs 3,576 negative — more balanced

| Model | ROC-AUC | PR-AUC |
|:---|---:|---:|
| Logistic Regression | 0.771 | 0.375 |
| **Gradient Boosting** | **0.802** | **0.482** |

**Interpretation:** Gradient Boosting clearly outperforms Logistic Regression here. The PR-AUC of 0.48 vs a naive baseline of ~0.21 (class prevalence) represents a 2.3× lift, which is meaningful.

---

## Class Imbalance Strategy

The cost overrun model has only 76 positive examples in 4 months. Strategies used:

1. **`class_weight="balanced"`** in Logistic Regression: automatically up-weights positive examples
2. **`SimpleImputer(strategy="median")`**: fills missing velocity features without losing rows
3. **PR-AUC as primary metric**: more informative than accuracy for rare events
4. **Recommended next step**: use `scale_pos_weight` in XGBoost or SMOTE oversampling to explicitly handle the imbalance

---

## Feature Importance (Current Proxy Method)

We don't have SHAP yet. Instead, `primary_risk_driver` is computed as the **weighted component with the highest score** in the risk formula:

```
Cost Escalation     = weight 0.30 × cost_risk_component
Schedule Delay      = weight 0.25 × schedule_risk_component
Slow Physical Progress = weight 0.20 × progress_risk_component
Excessive Expenditure  = weight 0.15 × spend_risk_component
Repeated Revisions     = weight 0.10 × revision_risk_component
```

This is **interpretable, auditable, and backed by domain knowledge**. It is NOT a ML feature importance — it is a rules-based attribution.

**Why this is defensible at SIH**: It produces explainable outputs judges can verify manually. "Project X is Critical because cost has escalated 427% above original" is more convincing than a black-box SHAP value.

---

## Roadmap: From MVP to Production

### Phase 1 (Current — Done)
- [x] PDF → CSV extraction
- [x] Feature engineering (13 features)
- [x] Binary classification: cost overrun + schedule slip
- [x] Composite risk scoring (0–100)
- [x] Primary risk driver attribution (rules-based)
- [x] REST API backend
- [x] Model comparison: statistical vs ML

### Phase 2 (Next Priority)
- [ ] **Magnitude prediction**: `GradientBoostingRegressor` to predict *how much* cost will increase (₹Cr)
- [ ] **SHAP integration**: `pip install shap` → `shap.TreeExplainer(model)` → per-project feature importance
- [ ] **More data**: download 12–24 months of historical PAIMANA / OCMS data; more data = sharper models
- [ ] **XGBoost upgrade**: drop-in replacement with better handling of categorical features

### Phase 3 (Post-Hackathon)
- [ ] **Survival Analysis**: Cox PH model for "time until first cost revision" using `lifelines` library
- [ ] **Quantile Regression**: predict a *range* (₹X Cr to ₹Y Cr) instead of a point estimate
- [ ] **LLM Integration** (SIH outcome h): plug project data into a Gemini/OpenAI prompt for natural language risk briefings
- [ ] **Real-time pipeline**: scheduled daily job pulling fresh data from PAIMANA API

---

## Why This Is Better Than a Simple Dashboard

Most existing project monitoring tools are **descriptive** — they show you what happened. This system is **predictive**:

| Capability | Simple Reporting | This System |
|:---|:---|:---|
| Shows current cost overrun | ✅ | ✅ |
| Shows historical delays | ✅ | ✅ |
| Predicts *future* cost revision probability | ❌ | ✅ |
| Predicts *future* schedule slip probability | ❌ | ✅ |
| Ranks projects by forward-looking risk | ❌ | ✅ |
| Explains *why* each project is at risk | ❌ | ✅ (driver attribution) |
| Benchmarks agencies and ministries | ❌ | ✅ |
| Quantifies the model's own accuracy | ❌ | ✅ (ROC-AUC, PR-AUC) |

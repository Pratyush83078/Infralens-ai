# 04 — Real-World Project Journey Example
### Tracing a Project: Raw MoSPI PDF → Data Cleaner → ML Engine → Live Early Warning

---

## The Case Study: Integrated Anandpur Barrage Project, Odisha
- **Project Code**: `603945`
- **Agency**: `Water Resources-OR`
- **Ministry**: `Department of Water Resources, River Development & GR`
- **Location**: Odisha

---

## Step 1: Raw MoSPI PDF Flash Report (Table 6)
In the official monthly PDF publication, project 603945 appears across wrapped table rows:

```
Sl | Project Name / Agency / Code          | State  | Approval | Start  | Target DOC | Revised DOC | Original Cost | Revised Cost | Expenditure | Progress
---|---------------------------------------|--------|----------|--------|------------|-------------|---------------|--------------|-------------|--------
47 | Integrated Anandpur Barrage Project   | Odisha | 02/2004  | 04/2004| 07/2010    | 01/2017     | 567.03        | 2990.05      | 2810.10     | 62.85%
   | (Water Resources-OR)                  |        |          |        |            |             |
   | 603945                                |        |          |        |            |             |
```
*Extracted via `src/pdf_extracter.py` using word-coordinate horizontal clustering.*

---

## Step 2: Cleaned & Structured Data (`data_loader.py`)

```csv
project_code,project_name,agency,state,ministry,start_date,target_doc,revised_doc,original_cost_cr,revised_cost_cr,cumulative_expenditure_cr,physical_progress_pct,report_month
603945,Integrated Anandpur Barrage Project,(Water Resources-OR),Odisha,Department of Water Resources,04/2004,07/2010,01/2017,567.03,2990.05,2810.10,62.85,July2026
```

---

## Step 3: Feature Engineering (`features.py`)

```python
planned_duration_m     = month_diff("04/2004", "07/2010") = 75 months
age_m                  = month_diff("04/2004", "07/2026") = 267 months (22+ years elapsed)
elapsed_frac           = 267 / 75 = 3.56
expected_progress_pct  = min(3.56 × 100, 100) = 100%  (should have completed)
progress_gap           = 62.85 − 100 = −37.15%       (37% behind target progress)

cost_overrun_ratio     = (2990.05 − 567.03) / 567.03 = 4.273 → +427.3% cost overrun
expenditure_util_pct   = (2810.10 / 2990.05) × 100 = 94.0%
spend_vs_progress_gap  = 94.0 − 62.85 = +31.15 pts   (spending far outpaces physical assets)

doc_slip_months        = month_diff("07/2010", "01/2017") = 78 months (6.5 years overdue)
doc_already_slipped    = 1
```

---

## Step 4: Rule-Based Risk Score & Primary Driver

Normalized using bounded domain caps:
```python
cost_risk     = clip(4.273, 0, 0.50) / 0.50  = 1.000  (maxed out — 427% overrun)
schedule_risk = clip(78, 0, 36) / 36          = 1.000  (maxed out — 78m > 36m cap)
progress_risk = clip(37.15, 0, 40) / 40       = 0.929  (37% behind expected curve)
spend_risk    = clip(31.15, 0, 40) / 40       = 0.779  (spending 31pts ahead of progress)
revision_risk = clip(0, 0, 3) / 3             = 0.000

risk_score = 100 × (0.30×1.00 + 0.25×1.00 + 0.20×0.929 + 0.15×0.779 + 0.10×0.0)
           = 85.2 / 100  ──►  Risk Band: CRITICAL (Score ≥ 75)

primary_risk_driver = "Cost Escalation"
```

---

## Step 5: Machine Learning Early-Warning Prediction

The trained `GradientBoostingClassifier` evaluates the 13 dynamic signals:
- `cost_revised_up_risk_pct` = **0.8%** (Budget is 94% exhausted; further upward revision is improbable at this stage).
- `schedule_slipped_risk_pct` = **1.7%** (DOC has stabilized near completion).

> [!TIP]
> **Crucial Insight for Judges**: High Risk Score $\neq$ High ML Risk Percentage.
> - The **Risk Score (85.2)** captures **historical damage** (427% overrun already happened).
> - The **ML Model (0.8%)** predicts **future change in the next 30 days**. Because this project is 94% spent and near completion, further escalation next month is unlikely. Both engines work together to tell the full truth!

---

## Step 6: Peer Cohort Comparison (`GET /api/projects/603945/peers`)

```json
{
  "project_code": "603945",
  "this_project": { "cost_overrun_pct": 427.3, "schedule_delay_months": 78, "risk_score": 85.2 },
  "peer_group": {
    "count": 3,
    "ministry": "Department of Water Resources, River Development & GR",
    "state": "Odisha",
    "avg_cost_overrun_pct": 239.0,
    "avg_schedule_delay_months": 77.2,
    "avg_risk_score": 72.1
  },
  "peer_insight": "This project's overrun (+427.3%) is 188.3% higher than similar Water Resources projects in Odisha."
}
```

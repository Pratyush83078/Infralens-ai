# What the ML Model Actually Does — Cleared Up
### The honest distinction: what is hardcoded vs what is ML

---

## Question 1: Are there really 2000+ unique projects, or repeating?

**2,059 unique projects. But they appear multiple times — one row per month per project.**

```
Total rows in full_panel.parquet : 7,497
Unique project codes             : 2,059
Months we have data for          : April2026, May2026, June2026, July2026

Breakdown:
  Projects appearing in 4 months : 1,650  (most projects)
  Projects appearing in 3 months :   152
  Projects appearing in 2 months :   184
  Projects appearing in 1 month  :    73  (new projects or late additions)
```

So project 705368 (Araria-Supaul road) has **4 rows** in the panel — one for each month.
The same physical project, but its data at different points in time.

### Why keep all 4 rows? Why not just use the latest?

Because **the ML model learns from change over time.**

Look at project 705368 across its 4 months:

| Month | Revised Cost | Slip (m) | Progress | cost_label | sched_label |
|:---|---:|---:|---:|:---:|:---:|
| April2026 | ₹2,514 Cr | 34 | 46.7% | **0** (no revision next month) | 0 |
| May2026   | ₹2,514 Cr | 34 | 46.9% | **0** (no revision next month) | 0 |
| June2026  | ₹2,514 Cr | 34 | 46.9% | **1** (YES — cost WILL go up!) | 0 |
| July2026  | ₹2,621 Cr | 34 | 40.0% | **NaN** (future unknown)       | NaN |

The June row is the **teaching moment**: the model sees the June state (stagnant progress,
same cost for 3 months) and learns that this pattern predicts a cost revision in July.
The July row confirms: revised cost jumped from ₹2,514 → ₹2,621 Cr.

**This is exactly how the ML model learns to predict.** It reads patterns from the past to predict the future.

---

## Question 2: What does the ML model actually do?

There are **TWO completely separate systems** running in this project. Most people confuse them.

### System A — Rules-Based Formula (NOT Machine Learning)

These outputs are computed by **hardcoded arithmetic** in `features.py`:

```
risk_score           ← weighted formula of 5 components (you wrote the formula)
risk_band            ← if risk_score > 75: "Critical" etc
primary_risk_driver  ← whichever component scored highest in the formula
progress_gap         ← physical_progress - expected_progress  (pure math)
cost_overrun_ratio   ← (revised_cost - original_cost) / original_cost  (pure math)
```

These are **transparent, auditable, domain-expert rules.** A minister can verify them
by hand. No ML involved whatsoever.

### System B — Actual Machine Learning (scikit-learn Gradient Boosting)

These outputs are predicted by a **trained statistical model** in `model_train.py`:

```
cost_revised_up_risk_pct      ← "Will cost be formally revised upward next month?"
schedule_slipped_risk_pct     ← "Will the completion deadline get pushed next month?"
```

The model was trained on 5,438 rows of historical data where we KNOW what happened next.
It learned relationships like:
- "When progress has been stuck at the same % for 2 consecutive months AND elapsed_frac > 2.0,
  a cost revision follows 4% of the time (vs baseline 1.4%)"
- "When doc_slip_months > 30 AND spend_vs_progress_gap > 20, schedule slips again 45% of the time"

These are **NOT hardcoded**. The model discovered them from data.

---

## Question 3: How is the ML model trained? Step by step.

```
STEP 1: Build the panel (7,497 rows × ~15 feature columns)
        Each row = one project snapshot at one point in time

STEP 2: Create labels (labels.py)
        For each project, look 1 month ahead:
        → Did revised_cost_cr INCREASE next month?  → cost_revised_up_label (0 or 1)
        → Did revised_doc get pushed?               → schedule_slipped_label (0 or 1)

        The July rows get label = NaN (no future data yet)

STEP 3: Drop NaN-labelled rows (latest month), keep the rest
        Training data: 5,438 rows for cost model, 4,504 rows for schedule model

STEP 4: Train model
        scikit-learn Pipeline:
          [SimpleImputer] → fills missing velocity features with median
          [StandardScaler] → normalizes all features to same scale
          [GradientBoostingClassifier] → learns the non-linear patterns

        The model sees: features at month T → label at month T+1
        It tries to find the combination of features that best predicts the label

STEP 5: Evaluate
        Hold out 20% of rows as test set
        Report ROC-AUC (0.886 for cost, 0.802 for schedule)

STEP 6: Export (export_for_backend.py)
        Load the July rows (2,059 projects, labels = NaN)
        Run model.predict_proba() on each
        → This is the FUTURE prediction for August 2026
        → These predictions go into latest_snapshot.json
```

---

## Question 4: Is Peer Comparison ML?

**No. And that's correct.**

Peer comparison is just a GROUP AVERAGE:

```javascript
// backend/server.js
const peers = allProjects.filter(p =>
  p.ministry === thisProject.ministry &&
  p.state === thisProject.state
);

const peerAvgOverrun = average(peers, 'cost_overrun_ratio_so_far');
```

This is the same as a SQL `GROUP BY ministry, state`. It doesn't need ML.
ML would be overkill here — and would be harder to explain to judges.

**The peer comparison answers**: "How does this project compare to similar ones RIGHT NOW?"
**The ML model answers**: "What will CHANGE for this project NEXT MONTH?"

These are different questions. Both are valuable. Neither replaces the other.

---

## Summary: What does what

| Output field | How computed | Why |
|:---|:---|:---|
| `cost_overrun_ratio_so_far` | (revised-original)/original | Pure math from PDF data |
| `doc_slip_months_so_far` | date arithmetic | Pure math from PDF data |
| `progress_gap` | progress - expected | Pure math |
| `risk_score` | Weighted formula (5 components) | Domain expert rules, auditable |
| `risk_band` | if/else on risk_score | Rules |
| `primary_risk_driver` | Which formula component won | Rules |
| `cost_revised_up_risk_pct` | **ML model prediction** | Gradient Boosting, trained on 5,438 rows |
| `schedule_slipped_risk_pct` | **ML model prediction** | Gradient Boosting, trained on 4,504 rows |
| `peer_insight` | Group average + comparison | Arithmetic |

The ML model is the **early warning engine**. The rules are the **current state engine**.
Together they answer two different questions:
- Rules: "Where does this project stand today?" (descriptive)
- ML: "What is about to happen to this project?" (predictive)

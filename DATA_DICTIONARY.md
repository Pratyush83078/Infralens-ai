# Paimana — Data Dictionary

> Every metric, field, and computed value you see in the web app, explained in plain language.

---

## Contents

1. [Portfolio-Level KPIs (Dashboard Header Tiles)](#1-portfolio-level-kpis)
2. [Risk Band Classification](#2-risk-band-classification)
3. [Primary Risk Drivers](#3-primary-risk-drivers)
4. [Project-Level Fields (Projects Table & Drawer)](#4-project-level-fields)
5. [Financial Metrics](#5-financial-metrics)
6. [Schedule & Progress Metrics](#6-schedule--progress-metrics)
7. [ML Predictive Signals](#7-ml-predictive-signals)
8. [Composite Risk Score Breakdown](#8-composite-risk-score-breakdown)
9. [Ministry Benchmark Fields](#9-ministry-benchmark-fields)
10. [Peer Comparison Fields](#10-peer-comparison-fields)
11. [Design System Color Semantics](#11-design-system-color-semantics)

---

## 1. Portfolio-Level KPIs

These appear as the four bento tiles on the **Dashboard** page.

| Label | Field | What It Means |
|---|---|---|
| **Tracked Portfolio** | `total_projects` | Total number of central sector infrastructure projects in the MoSPI dataset. Only projects with a sanctioned cost ≥ ₹150 Cr are included. Currently **2,059 projects**. |
| **Flagged Projects** | `risk_band_counts.High + risk_band_counts.Critical` | Sum of High and Critical risk-band projects — the ones requiring immediate ministerial attention. Sub-label breaks it down as "X Critical · Y High". |
| **Sanctioned Capital** | `total_revised_cost_cr` | Total current sanctioned budget across all projects after any revisions, in ₹ Crore. The sub-label shows the original baseline: `total_original_cost_cr`. |
| **Net Cost Overrun** | `total_cost_overrun_cr` | Aggregate capital escalation = revised total minus original total, in ₹ Cr. The sub-label shows the overrun as a portfolio-wide percentage. |

---

## 2. Risk Band Classification

Each project is classified into one of four **risk bands** using a composite 0–100 score (see §8).

| Band | Score Range | Colour | What It Means |
|---|---|---|---|
| 🔴 **Critical** | ≥ 75 | Red `#CD4239` | Extreme multi-factor failure — severe cost escalation AND schedule delay AND slow progress. Requires immediate executive intervention. |
| 🟠 **High** | 50–74 | Orange `#e06a14` | Significant risk in at least one major dimension. Project is compounding without intervention. |
| 🟡 **Medium** | 25–49 | Amber `#c49206` | Moderate stress — elevated overrun or delay but still recoverable. Monitor closely. |
| 🟢 **Low** | 0–24 | Teal `#2c8c66` | Project is broadly on track. Risk factors are within acceptable bounds. |

The **Risk Band Distribution** donut chart on the Dashboard shows count and portfolio percentage per band.

---

## 3. Primary Risk Drivers

Each project is assigned exactly **one** primary risk driver — the single most dominant factor pushing it into a higher risk band.

| Driver | What It Means |
|---|---|
| **Cost Escalation** | The revised cost has grown significantly relative to the original sanctioned amount. Overrun ratio is the dominant signal. |
| **Schedule Delay** | The project's date of completion (DOC) has slipped by a large number of months compared to the original timeline. |
| **Slow Physical Progress** | Physical progress (% construction/work done) is far behind the expected progress curve given time elapsed. |
| **Excessive Expenditure** | Cumulative expenditure has consumed a disproportionately high share of the revised cost relative to physical progress — money is being spent faster than work is being done. |
| **Repeated Revisions** | The project has undergone multiple cost or schedule revisions, signalling chronic planning failure. |

The **Primary Escalation Drivers** bar chart on the Dashboard ranks these by project count across the whole portfolio.

---

## 4. Project-Level Fields

These appear in the **Projects table** (all columns) and the **Project Drawer** (detail panel).

### Identity

| Field | API Key | What It Means |
|---|---|---|
| **Project Name** | `project_name` | Official name of the project as registered in MoSPI's CPMS. |
| **Project Code** | `project_code` | Unique alphanumeric identifier (e.g. `#A1234`). Used as the primary key for fetching individual project data. |
| **Ministry** | `ministry` | The Central Government ministry responsible for the project (e.g. "Ministry of Road Transport & Highways"). |
| **Agency** | `agency` | Implementing agency — the department, PSU, or body directly executing the work. |
| **State** | `state` | Indian state where the project is located. MoSPI sometimes encodes state with pagination artefacts ("Page 2") which the app strips using `cleanState()`. |

---

## 5. Financial Metrics

| Label | API Key | What It Means |
|---|---|---|
| **Original Sanction** | `original_cost_cr` | The budget approved at project initiation (₹ Crore). Baseline for measuring cost escalation. |
| **Revised Cost** | `revised_cost_cr` | Current sanctioned budget after all revisions. If this exceeds the original, the project has had cost escalations. |
| **Cost Overrun (₹)** | `revised_cost_cr − original_cost_cr` | Absolute escalation in Crore. Displayed in the Drawer as "Financial Snapshot". |
| **Cost Overrun (%)** | `cost_overrun_ratio_so_far` | `(revised − original) / original`. Stored as a decimal (e.g. `0.35` = 35% overrun). In the table it's shown as `+35.0%`. A value > 40% triggers red colouring. |
| **Cumulative Expenditure** | `cumulative_expenditure_cr` | Total money spent on the project to date (₹ Cr). |
| **% Utilized** | Derived | `cumulative_expenditure_cr / revised_cost_cr`. Shows how much of the current budget has been drawn. High utilization + low physical progress signals the **Excessive Expenditure** driver. |

### Number Formatting (`fmtCr`)

| Value Range | Display Format | Example |
|---|---|---|
| `< 1,000 Cr` | `₹ NNN Cr` | `₹ 450 Cr` |
| `≥ 1,000 Cr` | `₹ N.NN K Cr` | `₹ 4.32 K Cr` |
| `≥ 1,00,000 Cr` | `₹ N.NN L Cr` | `₹ 4.32 L Cr` |

---

## 6. Schedule & Progress Metrics

| Label | API Key | What It Means |
|---|---|---|
| **Physical Progress** | `physical_progress_pct` | Percentage of construction / work physically completed as reported to MoSPI. Range 0–100. |
| **Schedule Delay (months)** | `doc_slip_months_so_far` | How many months the current Date of Completion (DOC) has slipped vs the original DOC. A value of `0` = on schedule. Values > 24 months turn red in the table. |
| **Progress Gap** | `progress_gap` | `expected_progress − actual_progress`. Negative means the project is behind the expected S-curve at this point in time. Values below −10% trigger red colouring. |
| **Years Behind DOC** | Derived | `doc_slip_months_so_far / 12`. Shown in the Drawer schedule panel (e.g. "~3.2 yrs behind DOC"). |

---

## 7. ML Predictive Signals

The app exposes two machine-learning probabilities per project, computed by a **Gradient Boosting Classifier** trained on 7,497 monthly MoSPI records.

| Signal | API Key | What It Means | Model Performance |
|---|---|---|---|
| **Cost↑ ML Risk** | `cost_revised_up_risk_pct` | Probability (%) that this project's revised cost will increase **next month**. A high value means the model has detected compounding patterns similar to historical cost-revision events. | ROC-AUC **0.886** |
| **Sched↑ ML Risk** | `schedule_slipped_risk_pct` | Probability (%) that this project's DOC will slip further **next month**. | ROC-AUC **0.802** |

### Risk Thresholds in the UI

| Signal | Threshold | Colour | Meaning |
|---|---|---|---|
| Cost↑ | ≥ 10% | 🔴 Red | High likelihood of cost revision next month |
| Cost↑ | 5–9.9% | 🟠 Orange | Elevated probability — monitor |
| Cost↑ | < 5% | 🟢 Mint | Low probability window |
| Sched↑ | ≥ 20% | 🔴 Red | High likelihood of schedule slip next month |
| Sched↑ | 10–19.9% | 🟠 Orange | Elevated probability |
| Sched↑ | < 10% | 🟢 Mint | Low probability window |

---

## 8. Composite Risk Score Breakdown

The **Risk Score** (0–100) is a weighted composite of five sub-scores visible in the Project Drawer's "Composite Risk Architecture" section.

| Component | Max Weight | Input Field | Formula |
|---|---|---|---|
| **Cost Escalation** | 30 pts | `cost_overrun_ratio_so_far` | `min(overrun_ratio / 0.50, 1) × 30` — maxes out at 50% overrun |
| **Schedule Delay** | 25 pts | `doc_slip_months_so_far` | `min(slip_months / 36, 1) × 25` — maxes out at 3 years of delay |
| **Slow Progress** | 20 pts | `progress_gap` | `min(max(-gap, 0) / 40, 1) × 20` — only penalises negative gap |
| **Excess Spend** | 15 pts | `expenditure / revised_cost` vs `physical_progress_pct` | Spend-to-progress imbalance capped at 30 percentage-point divergence |
| **Revision Penalty** | 10 pts | Fixed | Every project carries a baseline 10pt revision exposure |

The circular gauge in the Drawer shows the **total score out of 100** with the risk-band colour (red/orange/amber/teal). The five horizontal bars show each component's contribution.

---

## 9. Ministry Benchmark Fields

These appear on the **Benchmarks** page, aggregated per ministry across all its projects.

| Field | API Key | What It Means |
|---|---|---|
| **Projects Tracked** | `project_count` / `total_projects` | Number of MoSPI-registered projects under this ministry. |
| **Avg Risk Score** | `avg_risk_score` | Mean composite risk score. > 40 shows red in the table, > 30 shows orange. |
| **Critical Count** | `critical_count` | Projects in the Critical band (score ≥ 75). |
| **High Count** | `high_count` | Projects in the High band (score 50–74). |
| **Total Cost Overrun** | `total_cost_overrun_cr` | Sum of all cost escalation across the ministry's portfolio (₹ Cr). Primary sort key on the leaderboard. |
| **Avg Schedule Delay** | `avg_delay_months` | Mean schedule slip in months across the ministry's projects. |

The three highlight cards at the top of Benchmarks show:
- **Highest Budget Overrun** — ministry with largest `total_cost_overrun_cr`
- **Highest Avg Risk Score** — ministry with worst average project health
- **Largest Infrastructure Volume** — ministry managing the most projects

---

## 10. Peer Comparison Fields

When you open a project in the Drawer, the app fetches a **peer cohort** — projects in the same state — via `/api/projects/{code}/peers`.

| Field | API Key | What It Means |
|---|---|---|
| **Peer Group Count** | `peers.peer_group.count` | How many other projects in the same state form the comparison cohort. |
| **This Project: Cost Overrun %** | `peers.this_project.cost_overrun_pct` | This project's overrun as %, for direct comparison to cohort. |
| **Cohort Avg Cost Overrun %** | `peers.peer_group.avg_cost_overrun_pct` | Average overrun across all peers. If "this" is much higher, it's a state-level outlier. |
| **This Project: Delay** | `peers.this_project.schedule_delay_months` | This project's delay in months. |
| **Cohort Avg Delay** | `peers.peer_group.avg_schedule_delay_months` | Mean delay in months across the state cohort. |
| **This Project: Risk Score** | `peers.this_project.risk_score` | This project's composite score. |
| **Cohort Avg Risk Score** | `peers.peer_group.avg_risk_score` | Average score across peers. |
| **Peer Insight** | `peers.peer_insight` | Generated text summarising how this project compares to its cohort. Shown as a blue callout box in the Drawer. |

---

## 11. Design System Color Semantics

The app uses a **Soft Neo-Brutalist** palette. Here's exactly what each colour token means in context.

| CSS Token | Hex | Used For |
|---|---|---|
| `--neo-red` | `#CD4239` | Critical risk fills, cost overrun labels, urgent chip backgrounds |
| `--risk-critical` | `#630909` | Critical risk text colour (darker, for readability on light bg) |
| `--risk-critical-bg` | `#FDECEA` | Soft red background for probability chips in the Critical range |
| `--neo-orange` | `#FF9900` | High risk fills, elevated ML probability |
| `--risk-high` | `#CF6306` | High risk text colour |
| `--risk-high-bg` | `#FEF0E6` | Soft orange chip background |
| `--neo-yellow` | `#F6E752` | Active nav tab, primary action buttons, "attention" state |
| `--risk-medium` | `#D4AC0D` | Medium risk text |
| `--risk-medium-bg` | `#FEF8E6` | Medium risk chip background |
| `--neo-mint` | `#22C55E` | Low risk, "on schedule", good ML signal — positive indicator |
| `--risk-low` | `#025E73` | Low risk text colour (dark teal) |
| `--risk-low-bg` | `#E6F4F8` | Soft teal chip background |
| `--neo-cobalt` | `#006EFF` | Chart bars, data accent, secondary interactive elements |
| `--surface-cream` | `#FCF5E5` | Metric row backgrounds, hover areas, ML model note |
| `--ink` | `#000000` | Primary body text — full black on cream canvas |
| `--ink-secondary` | `#2A2A2A` | Secondary labels, subtitles, muted metadata |
| `--shadow-hard` | `4px 4px 0 #000` | Neo-brutalist "lifted" shadow — no blur, hard offset |
| `--shadow-lift` | `6px 6px 0 #000` | Extended shadow on card hover (lift animation) |

---

## Data Source

All data originates from **MoSPI's Central Project Monitoring System (CPMS)** — a Government of India database tracking central sector infrastructure projects (≥ ₹150 Crore) across all ministries.

| Detail | Value |
|---|---|
| Flash ingestion date | July 2026 |
| ML training set size | 7,497 monthly project-snapshots |
| Projects in current slice | 2,059 |
| Backend API base | `http://localhost:5001/api` |

---

*Generated for the Paimana Infrastructure Risk Intelligence Platform.*

# PAIMANA Dashboard — Frontend Design Specification
### What to build, screen by screen, with real data backing each design decision

---

## Will Adding Future Features Break the JSON Structure?

**No. JSON structure is additive.** New features = new fields appended to existing records.

```
CURRENT JSON RECORD (today):
  project_code, project_name, agency, state, ministry, report_month_dt,
  original_cost_cr, revised_cost_cr, cumulative_expenditure_cr,
  physical_progress_pct, cost_overrun_ratio_so_far, doc_slip_months_so_far,
  progress_gap, risk_score, risk_band, primary_risk_driver,
  cost_revised_up_risk_pct, schedule_slipped_risk_pct

AFTER ADDING SHAP (new field, won't break):
  + shap_top_feature, shap_top_value

AFTER ADDING MAGNITUDE REGRESSION (new field, won't break):
  + predicted_cost_escalation_cr

AFTER ADDING LLM (new field, won't break):
  + ai_narrative_text
```

Frontend only reads what it needs. Adding new fields never breaks existing consumers.

---

## What We Can Show TODAY (All Data Available)

### Portfolio Level (`/api/kpis` + `/api/benchmarks/ministries`)
| Data Point | Value (Real) | UI Element |
|:---|:---|:---|
| Total ongoing projects | **2,059** | KPI card |
| Total original cost | **₹39.08 lakh Cr** | KPI card |
| Total revised cost | **₹43.20 lakh Cr** | KPI card |
| Total cost overrun | **₹5.63 lakh Cr** | KPI card (red) |
| Total expenditure | **₹20.40 lakh Cr** | KPI card |
| Projects — Low risk | **1,044 (50.7%)** | Donut chart segment |
| Projects — Medium risk | **831 (40.3%)** | Donut chart segment |
| Projects — High risk | **171 (8.3%)** | Donut chart segment |
| Projects — Critical risk | **13 (0.6%)** | Donut chart segment |
| Top risk driver: Slow Progress | **918 projects** | Driver breakdown bar |
| Top risk driver: Schedule Delay | **750 projects** | Driver breakdown bar |
| Top risk driver: Cost Escalation | **319 projects** | Driver breakdown bar |

### Ministry Level (`/api/benchmarks/ministries`)
| Ministry | Projects | Critical | Overrun (₹Cr) |
|:---|:---|:---|:---|
| Ministry of Railways | 261 | 6 | ₹1,89,627 Cr |
| Water Resources | 48 | 5 | ₹1,03,734 Cr |
| Petroleum & Gas | 113 | 0 | ₹72,869 Cr |
| Ministry of Power | 104 | 2 | ₹56,467 Cr |
| MoRTH (Roads) | 1,161 | 0 | ₹24,408 Cr |

### Project Level (`/api/projects/:code`)
Full record: all 20 fields + overrun ₹Cr + delay months + AI narrative text

### Peer Level (`/api/projects/:code/peers`)
Same ministry+state projects with group averages and comparison text

---

## Screen Architecture — 5 Pages / Views

```
┌─────────────────────────────────────────────────────────┐
│  NAV: PAIMANA AI  |  Dashboard  Projects  Benchmarks  About │
└─────────────────────────────────────────────────────────┘

Page 1: Dashboard (/)          ← Main landing page
Page 2: Projects (/projects)   ← Explorer table
Page 3: Benchmarks (/bench)    ← Ministry/State rankings
Page 4: About (/about)         ← How this works
Page 5: Modal/Drawer           ← Project deep-dive (overlaid on any page)
```

---

## Page 1 — Dashboard (Main Landing)

### Section A — KPI Header Strip (4 cards across top)

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🏗️ 2,059          │ │ ⚠️ 184 Flagged    │ │ 💰 ₹43.2L Cr     │ │ 📈 ₹5.6L Cr      │
│ Total Projects   │ │ High + Critical  │ │ Revised Portfolio│ │ Total Overrun    │
│                  │ │ need attention   │ │ Cost             │ │ +14.4% over orig │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

API: `GET /api/kpis`
Numbers: 2059 projects, 184 flagged (171 High + 13 Critical), ₹43.20L Cr revised, ₹5.63L Cr overrun

### Section B — Risk Distribution (2-column layout)

LEFT: Donut chart — 4 segments
```
  Critical  13  (0.6%)   ← bright red
  High     171  (8.3%)   ← orange
  Medium   831 (40.3%)   ← yellow
  Low    1,044 (50.7%)   ← green
```

RIGHT: Primary Risk Driver — horizontal bar chart
```
  Slow Physical Progress  ████████████████████  918
  Schedule Delay          ████████████████      750
  Cost Escalation         ████████              319
  Excessive Expenditure   ██                     51
  Repeated Revisions      █                      21
```

API: `GET /api/kpis` → `risk_band_counts`, `primary_risk_drivers`

### Section C — Early Warning Feed (Critical projects list)

Table of Top 13 Critical projects (all of them since there are only 13):

```
┌────────────────────────────┬────────┬──────────┬─────────────┬──────────┬────────────┐
│ Project                    │ Risk   │ Overrun  │ Delay       │ Cost↑ ML │ Sched↑ ML  │
│                            │ Score  │          │             │ Prob     │ Prob        │
├────────────────────────────┼────────┼──────────┼─────────────┼──────────┼────────────┤
│ Araria-Supaul 92km         │ 🔴91.9 │ +63.3%   │ 34 months   │ 1.7%     │ 6.8%       │
│ Anandpur Barrage           │ 🔴85.2 │ +427.3%  │ 78 months   │ 0.8%     │ 1.7%       │
│ Trivandrum-Kanyakumari     │ 🔴85.2 │ +164.3%  │ 39 months   │ 4.0%     │ 3.8%       │
│ ...                        │ ...    │ ...      │ ...         │ ...      │ ...        │
└────────────────────────────┴────────┴──────────┴─────────────┴──────────┴────────────┘
```

Click any row → opens Project Detail Modal

API: `GET /api/alerts`

### Section D — Ministry Overrun Leaderboard (bar chart)

Horizontal bar chart, sorted by total cost overrun ₹Cr:
```
Railways       ████████████████████ ₹1,89,627 Cr  (6 Critical, 44 High)
Water Res      ████████████         ₹1,03,734 Cr  (5 Critical, 19 High)
Petroleum      ████████             ₹72,869 Cr    (0 Critical, 10 High)
Power          ██████               ₹56,467 Cr    (2 Critical, 8 High)
Roads          ████                 ₹24,408 Cr    (0 Critical, 77 High)
```

API: `GET /api/benchmarks/ministries`

### Section E — Live Model Performance Banner

Small strip showing model credibility:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Model Performance  |  Cost Overrun: ROC-AUC 0.886  |  Schedule Slip: ROC-AUC 0.802  │
│ Trained on 7,497 project-month records · 2,059 active projects tracked  │
└─────────────────────────────────────────────────────────────────────────┘
```

(Hardcoded from model_train.py output — update after retraining)

---

## Page 2 — Project Explorer (/projects)

### Filter Bar (top)
Dropdowns + search: `Risk Band` | `Ministry` | `State` | `Primary Driver` | `Search by name/code`

API: `GET /api/filters` → populates dropdown options

### Sortable Table
```
Columns:
  Code | Project Name | State | Ministry | Risk Score ▼ | Overrun % | Delay (m) | Cost↑ Prob | Sched↑ Prob | Band

Default sort: risk_score descending
Pagination: 20 per page
```

API: `GET /api/projects?risk_band=Critical,High&sort_by=risk_score&order=desc&page=1&limit=20`

### Click → Project Detail Drawer (slides in from right)

---

## Page 2b — Project Detail Drawer (modal/panel, overlay)

Opened when user clicks any project row.

### Header
```
┌─────────────────────────────────────────────────────┐
│  🔴 CRITICAL  Araria-Supaul 92 km          [× Close]│
│  Code: 705368 | Ministry of Railways | Bihar        │
│  Agency: (NHAI-EE)                                  │
└─────────────────────────────────────────────────────┘
```

### Section 1 — Financial Snapshot (3 metric blocks)
```
Original Cost   Revised Cost   Expenditure
₹1,605 Cr   →  ₹2,621 Cr     ₹2,140.8 Cr
              +₹1,016 Cr      81.7% utilized
              (+63.3%)
```

### Section 2 — Risk Score Breakdown (gauge + component bars)

Large gauge: **91.9 / 100** (red needle)

5 component bars:
```
Cost Escalation     ████████████████████  30.0/30  (63% overrun, max score)
Schedule Delay      █████████████████     22.4/25  (34 months)
Slow Progress       █████████████         16.9/20  (progress gap: -33%)
Excess Expenditure  ████████               8.7/15  (spend > progress)
Repeated Revisions  ██                     1.5/10
                                    Total: 79.5 → Risk Score: 91.9
```

### Section 3 — ML Early Warning (2 probability meters)

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  💸 Cost Escalation Prob    │  │  ⏰ Schedule Slip Prob       │
│                             │  │                             │
│         1.7%                │  │         6.8%                │
│  ▓░░░░░░░░░░░░░░░░░░░░░░░│  │  ▓▓░░░░░░░░░░░░░░░░░░░░░░│  │
│  Low risk of further        │  │  Moderate risk of          │
│  cost revision next month   │  │  deadline extension        │
└─────────────────────────────┘  └─────────────────────────────┘
```

### Section 4 — Schedule Timeline

Visual timeline:
```
Start        Target DOC     Revised DOC    Today
Apr 2016  → Mar 2021      → Jan 2024     [Jul 2026]
              ↑                ↑
              0 months    +34 months
              (original)   (slipped)
```

### Section 5 — Peer Comparison

From `/api/projects/:code/peers`:
```
📊 vs Similar Bihar Railway Projects (64 peers)
                     This Project    Peer Average
Cost Overrun:        +63.3%          +9.3%      ← WAY above peers
Delay:               34 months       29.7 months
Risk Score:          91.9            ~32.0

⚠️ "This project's overrun is 54% above the 64-project peer average 
    in Bihar under Ministry of Railways — significant outlier."
```

### Section 6 — AI Assessment (text)

From `/api/projects/:code` → `assessment` field:
```
"CRITICAL INTERVENTION REQUIRED: This project is in the highest risk band with
a score of 91.9/100, driven primarily by Cost Escalation. The project has experienced
a 63.3% cost overrun (₹1,016 Cr above original). Schedule has slipped by 34 months.
Physical progress at 40.0% is 33% below expected target. The ML model assigns a 6.8%
probability of further schedule extension next month."
```

---

## Page 3 — Benchmarks (/benchmarks)

### Tab 1: Ministry Rankings

Table sorted by total cost overrun ₹Cr:
```
Ministry                | Projects | Avg Risk | Critical | High | Overrun ₹Cr
Ministry of Railways    |   261    |   32.0   |    6     |  44  | ₹1,89,627 Cr
Water Resources         |    48    |   48.9   |    5     |  19  | ₹1,03,734 Cr
Petroleum & Gas         |   113    |   22.7   |    0     |  10  | ₹72,869 Cr
...
```

### Tab 2: State Rankings

Table sorted by project count + avg risk:
```
State          | Projects | Avg Risk | Top Risk Band
Maharashtra    |   177    |   25.5   | Medium (60%)
Uttar Pradesh  |   141    |   21.1   | Low (58%)
Gujarat        |   105    |   25.9   | Medium (55%)
Karnataka      |    99    |   30.0   | Medium (50%)
Bihar          |    99    |   29.8   | Medium (48%)
```

### Tab 3: Top Overrun Projects (cross-sector)

Table: projects sorted by `cost_overrun_ratio_so_far` descending. Answers: "which single project wasted the most money?"

---

## Page 4 — About (/about)

This page explains the system to judges and policymakers. Keep it simple, visual, informative.

### Section 1 — The Problem (why this exists)

```
"India's ₹43 lakh crore infrastructure portfolio has a ₹5.6 lakh crore overrun problem.
 The existing PAIMANA system tells you what happened. This system tells you what is about to happen."
```

3 icon cards:
- 📊 Descriptive → Predictive → Prescriptive
- 1,981 projects tracked monthly
- 4 months of data, 2 ML models, 9 API endpoints

### Section 2 — How It Works (3-step visual flow)

```
[ PDF Flash Report ] → [ AI Extraction + Feature Engineering ] → [ ML Early Warning ]
    Monthly from           13 KPIs computed per project            2 risk probabilities
    MoSPI PAIMANA          Risk Score 0-100                       per project per month
    portal                 Risk Band + Driver
```

### Section 3 — The Two Systems Explained (plain English)

**Rules Engine** (always-on):
> "Computes current state. Answers: 'Where is this project today?' Mathematically exact, 
> auditable, matches government data to the rupee."

**ML Early Warning** (predictive):
> "Trained on 7,497 historical project-month records. Answers: 'What will change next month?'
> Gradient Boosting Classifier. Cost prediction AUC: 0.886. Schedule prediction AUC: 0.802.
> Compared against Logistic Regression baseline as required by SIH 26103."

### Section 4 — Model Accuracy (transparency for judges)

Small table:
```
Model                    | Task              | ROC-AUC | PR-AUC | Baseline
Gradient Boosting (ML)   | Cost escalation   |  0.886  |  0.082 | 0.014 (class freq)
Logistic Regression (Stat)| Cost escalation  |  0.883  |  0.081 |
Gradient Boosting (ML)   | Schedule slip     |  0.802  |  0.482 | 0.206
Logistic Regression (Stat)| Schedule slip    |  0.771  |  0.375 |
```

Note: "ROC-AUC > 0.8 means the model ranks risky projects ahead of safe ones 80%+ of the time."

### Section 5 — Tech Stack (for judges)

```
Data:        Official MoSPI PAIMANA Flash Reports (PDF)
Extraction:  Python + pdfplumber (open-source)
ML:          scikit-learn — Gradient Boosting + Logistic Regression
Backend:     Node.js + Express
Frontend:    React + Recharts / Vite
All tools:   100% open-source (SIH requirement met)
```

### Section 6 — SIH 26103 Compliance Checklist

Quick table showing outcomes a–i with green ticks

---

## Implementation Order (Build in This Sequence)

```
1. index.html + global CSS (dark theme, color tokens, typography)
2. Nav bar + routing skeleton
3. Page 1 Section A: KPI Cards (simplest, most impressive first)
4. Page 1 Section B: Risk donut + driver bars (Recharts)
5. Page 1 Section C: Alert feed table
6. Page 1 Section D: Ministry bar chart
7. Page 2: Projects table with filters + pagination
8. Project detail drawer/modal
9. Page 3: Benchmarks tabs
10. Page 4: About page
```

---

## Color System (Consistent Risk Colours Throughout)

```css
--critical:  #ef4444   /* Red   — scores 75-100 */
--high:      #f97316   /* Orange — scores 50-75 */
--medium:    #eab308   /* Yellow — scores 25-50 */
--low:       #22c55e   /* Green  — scores 0-25  */
--bg-dark:   #0f172a   /* Slate 900 — page background */
--bg-card:   #1e293b   /* Slate 800 — card background */
--text:      #f1f5f9   /* Slate 100 — primary text */
--muted:     #94a3b8   /* Slate 400 — secondary text */
--accent:    #6366f1   /* Indigo  — interactive elements */
```

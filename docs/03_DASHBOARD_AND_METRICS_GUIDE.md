# 03 — Dashboard & Metrics Guide
### PAIMANA AI: Screen-by-Screen Walkthrough, Telemetry & Data Dictionary

---

## 1. Executive Dashboard Overview (`/`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PAIMANA DASHBOARD LAYOUT                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Top Bento Header Tiles]                                                               │
│  • Tracked Portfolio: 2,059 Projects       • Flagged Priority: 184 (13 Crit · 171 High)│
│  • Sanctioned Capital: ₹42.78L Cr          • Net Cost Overrun: +₹5.65L Cr (+14.4%)     │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│ [Risk Distribution Donut Chart]        │ [Ministry Cost Overrun Bar Chart]             │
│  • Low (0–24): 1,044 projects (51%)    │  • Railways: ₹1.96L Cr Overrun (Top)          │
│  • Medium (25–49): 831 projects (40%)  │  • Road Transport: ₹1.24L Cr                  │
│  • High (50–74): 171 projects (8%)     │  • Petroleum & Gas: ₹62K Cr                   │
│  • Critical (75–100): 13 projects (1%) │                                               │
├────────────────────────────────────────┴───────────────────────────────────────────────┤
│ [Primary Risk Drivers Bar Breakdown]                                                   │
│  • Slow Physical Progress: 918 | Schedule Delay: 750 | Cost Escalation: 319            │
│  • Excessive Expenditure: 51  | Repeated Revisions: 21                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Priority Early Warning Feed]                                                          │
│  Top 25 Critical/High projects with Risk Score, Delay Months, and Overrun %            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Portfolio-Level KPI Tiles

| Tile Label | API Field | Value | Description |
| :--- | :--- | :---: | :--- |
| **Tracked Portfolio** | `total_projects` | **2,059** | Total central sector projects in the MoSPI dataset with sanctioned budget $\ge$ ₹150 Cr. |
| **Flagged Projects** | `risk_band_counts.High + Critical` | **184** | Projects requiring urgent intervention (`13 Critical · 171 High`). |
| **Sanctioned Capital**| `total_revised_cost_cr` | **₹42.78L Cr** | Total current approved budget across all projects (Baseline: `₹37.13L Cr`). |
| **Net Cost Overrun** | `total_cost_overrun_cr` | **+₹5.65L Cr** | Portfolio-wide capital escalation (`+14.4%` aggregate cost inflation). |

---

## 3. Risk Band Classification

Every project is classified using a **composite 0–100 risk score**:

| Risk Band | Score Range | Color | Status & Protocol |
| :--- | :---: | :---: | :--- |
| 🔴 **Critical** | $\ge 75$ | `#cd4239` | Severe multi-factor distress (cost + schedule + stalled progress). Immediate milestone review required. |
| 🟠 **High** | $50–74$ | `#e06a14` | Significant risk in at least one major dimension. Active escalation mitigation required. |
| 🟡 **Medium** | $25–49$ | `#c49206` | Moderate variance. Project is recoverable with regular monthly tracking. |
| 🟢 **Low** | $0–24$ | `#2c8c66` | Healthy project within acceptable performance variance. |

---

## 4. Primary Risk Drivers

Every project is assigned **one primary risk driver** representing its dominant bottleneck:

| Driver | Nationwide Count | Meaning |
| :--- | :---: | :--- |
| **Slow Physical Progress** | **918** | Physical construction % is far behind expected progress given elapsed time. |
| **Schedule Delay** | **750** | Date of Completion (DOC) has slipped by months beyond original target. |
| **Cost Escalation** | **319** | Revised cost has increased significantly relative to original sanctioned budget. |
| **Excessive Expenditure** | **51** | Expenditure utilization consumes a disproportionately high budget share relative to work done. |
| **Repeated Revisions** | **21** | Project has undergone 3+ timeline or cost extensions, indicating bureaucratic instability. |

---

## 5. Projects Explorer Table (`/projects`)

- **Search Bar**: Real-time debounce search matching project name, code, or agency.
- **Filters**: Multi-select dropdowns for **Risk Band** (All, Critical, High, Medium, Low), **Ministry** (17 options), **State** (all Indian states/UTs), and **Risk Driver**.
- **Column Sorting**: Sort by Risk Score, Cost Overrun %, Delay Months, or Sanctioned Cost.
- **Pagination**: 25 records per page across 2,059 projects.

---

## 6. Project Detail Deep-Dive Drawer (`ProjectDrawer.jsx`)

Triggered by clicking any project row or alert card:

### 1. Financial & Telemetry Grid
- **Revised Cost**: Current official sanctioned budget in ₹ Crores.
- **Cost Overrun**: Difference between revised and original cost (`+X%`).
- **Physical Progress**: Actual verified construction completion %.
- **Expenditure Utilization**: % of revised budget drawn and spent to date.

### 2. 🚨 Machine Learning Early-Warning Cards (The Core AI!)
- **30-Day Cost Escalation Risk**: Probability that cost will be revised upward next month (e.g., `78.5%` $\to$ *⚠️ High likelihood next month*).
- **30-Day Schedule Slip Risk**: Probability that deadline will be delayed next month (e.g., `45.2%` $\to$ *⚡ Elevated probability*).

### 3. 5-Component Risk Point Contribution
- Cost Escalation: `X / 30 pts`
- Schedule Delay: `X / 25 pts`
- Physical Progress Gap: `X / 20 pts`
- Spend-to-Progress Gap: `X / 15 pts`
- Historical Revisions: `X / 10 pts`

### 4. Executive AI Assessment
Automated synthesis translating raw telemetry into actionable plain-English ministerial directives.

### 5. Peer Group Benchmarking Panel
Real-time peer cohort aggregation (`same ministry + same state`):
> *"This project has an overrun of +63.3%, compared to its peer cohort average of +28.4% across 14 similar projects."*

---

## 7. Ministry Benchmarks (`/benchmarks`)

- **Telemetry Leaderboard**: Ranks all 17 ministries by aggregate cost overrun, project count, average risk score, and critical project count.
- **Top Insight**: The **Ministry of Railways** leads with nearly ₹1.96 Lakh Crore in cumulative overrun across 261 projects, followed by Road Transport & Highways and Petroleum & Natural Gas.

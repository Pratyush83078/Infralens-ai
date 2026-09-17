# INFRALENS AI — Codebase & Architecture Index

> **Internal Developer Reference**: Single source of truth for file locations, responsibilities, data flow, and components to guide fast refactoring and maintain clean architectural boundaries.

---

## 1. Directory Structure

```
Paimana-analysis/
├── app/                              # Next.js 15 App Router
│   ├── layout.jsx                    # Root layout with Geist font imports & Supermemory shell
│   ├── page.jsx                      # Main Dashboard (Hero, KPIs, Charts, Watchlist, What-If, Backtest)
│   ├── projects/page.jsx             # Portfolio Explorer (2,059 projects, search/filter table)
│   ├── benchmarks/page.jsx           # Ministry Benchmarks & Severity Leaderboard
│   ├── about/page.jsx                # System Architecture, 5-step pipeline & ROC-AUC scorecard
│   └── api/                          # REST JSON Microservices (Sub-millisecond latency)
│       ├── alerts/route.js           # Early warning alerts (Critical & High projects)
│       ├── benchmarks/ministries/    # Aggregated ministry metrics & overruns
│       ├── filters/route.js          # Ministries, states, and driver filter options
│       ├── kpis/route.js             # Portfolio high-level KPIs
│       ├── projects/route.js         # Paginated & sorted project directory
│       └── projects/[code]/          # Single project details and peer cohort benchmarks
├── components/                       # UI & Visualization Components
│   ├── SupermemorySidebar.jsx        # Fixed left technical navigation bar (infralens ✦)
│   ├── WhatIfSimulator.jsx           # Project-bound Sensitivity Slider (reusable per project)
│   ├── BacktestSection.jsx           # Validated historical backtests (USBRL, WDFC, MTHL, Polavaram)
│   ├── ProjectDrawer.jsx             # Slide-over inspection drawer with peer benchmarking & What-If
│   ├── ThemeController.jsx           # Clean theme & minimalist styling controller
│   └── charts/
│       ├── SupermemoryBarChart.jsx   # Ministry capital overrun horizontal bar chart
│       ├── BenchmarkDualLineChart.jsx# INFRALENS vs MoSPI baseline detection lead time chart
│       └── EqualizerSparkline.jsx    # SVG dynamic sparkline indicator
├── lib/
│   ├── api.js                        # Client API SDK (fetch wrappers & formatting utilities)
│   ├── dataEngine.js                 # Server-side data engine loading processed JSON snapshots
│   └── intelligence.js               # Domain helpers: getProjectSummary, getConfidenceScore, exportToCsv
├── styles/
│   ├── Supermemory.css               # Core design tokens, Geist typography, cards, buttons, sliders
│   └── tokens.css                    # Color palettes (Soft Brutalism / Supermemory / Dark / Light)
└── data/processed/                   # Cleaned MoSPI surveillance datasets
    ├── latest_snapshot.json          # 2,059 active central sector projects (≥₹150 Cr)
    └── portfolio_kpis.json           # Aggregated portfolio totals (₹34.8L Cr, ₹4.92L Cr overrun)
```

---

## 2. Core Engine & Data Flow

```
[Raw MoSPI Flash PDF]
       ↓ (pdfplumber + coordinate extraction)
[data/processed/latest_snapshot.json] (2,059 projects)
       ↓
[lib/dataEngine.js] (In-memory cached data engine)
       ↓
[app/api/*] (Next.js Route Handlers)
       ↓
[lib/api.js] (Client fetch layer with hooks/useApi.js)
       ↓
[app/page.jsx & components/] (Supermemory Technical UI)
```

---

## 3. Component Responsibility Matrix

| Component | File Path | Props / Inputs | Purpose |
|---|---|---|---|
| `WhatIfSimulator` | `components/WhatIfSimulator.jsx` | `{ initialProject, onProjectChange }` | Reusable sensitivity simulator. Can be standalone (with selector) or bound to a specific project. Computes deterministic Engine 1 risk score live. |
| `BacktestSection` | `components/BacktestSection.jsx` | None | Curated backtest evidence across 4 landmark projects with honest statistical sample scoping. |
| `ProjectDrawer` | `components/ProjectDrawer.jsx` | `{ project, peers, onClose }` | Full project inspection drawer with financial breakdown, peer cohort delta, and embedded What-If simulation. |
| `SupermemorySidebar` | `components/SupermemorySidebar.jsx` | None | Clean fixed left technical navigation with live pulse indicator and fast jumping anchors. |

---

## 4. Key Metric Guidelines (Honest Scoping)
- **ROC-AUC (Cost Revision)**: `0.886` (Gradient Boosting on 7,497 snapshot records)
- **PR-AUC (Cost Revision)**: `0.082` (Reflects true imbalanced nature of real-world escalations)
- **ROC-AUC (Schedule Slip)**: `0.802`
- **Portfolio Monitored**: 2,059 projects ≥₹150 Cr (MoSPI July 2026 snapshot)
- **Cumulative Cost Overrun**: ₹4,92,416.53 Crore across 17 ministries
- **Curated Backtest**: 4 landmark mega-projects (USBRL, WDFC, MTHL, Polavaram) showing 6–8 months advance detection. Must never claim portfolio-wide zero false positives; explicitly scope to the sample.

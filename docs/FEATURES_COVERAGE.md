# PAIMANA — SIH 26103 Outcome Coverage Checklist
### What we deliver vs what the problem statement asks for

---

## Is Our Data Enough?

**Short answer: Yes for a–f. Sufficient for g. Needs LLM API for h. Docs = i.**

We have:
- **4 monthly snapshots** (April–July 2026) = 7,497 training rows
- **~1,981 unique ongoing projects** per month
- **13 engineered features** covering cost, time, progress, spend, revisions, and agency track record
- **Data from official government PDFs** — not scraped, not synthetic

The key limitation is *temporal depth*: 4 months means the ML models have seen very few cost revision events (76 in total). Every additional month of historical PAIMANA/OCMS data added will significantly improve model sharpness, especially for cost overrun prediction.

---

## Outcome a — Cost Overrun Prediction Model ✅ COMPLETE

**What the SIH asks for:** A model that predicts whether a project will experience cost escalation.

**What we built:**
- Binary classifier: "Will this project's revised cost increase in the next month?"
- Algorithm: Logistic Regression (baseline) + Gradient Boosting (ML)
- Evaluation: ROC-AUC = 0.886, PR-AUC = 0.082
- Output field: `cost_revised_up_risk_pct` — percentage probability of cost escalation for every project

**Evidence:** `src/model_train.py`, `data/processed/cost_revised_up_label_*.joblib`

**Gap:** Magnitude (how much will it overrun by?) not yet predicted — only probability. Add a regression model in Phase 2.

---

## Outcome b — Time Overrun Prediction Model ✅ COMPLETE

**What the SIH asks for:** A model that predicts schedule slippage.

**What we built:**
- Binary classifier: "Will this project's revised DOC get pushed further in the next month?"
- Algorithm: Logistic Regression (baseline) + Gradient Boosting (ML)
- Evaluation: ROC-AUC = 0.802, PR-AUC = 0.482 (2.3× lift over naive baseline)
- Output field: `schedule_slipped_risk_pct`

**Evidence:** `src/model_train.py`, `data/processed/schedule_slipped_label_*.joblib`

**Gap:** Does not predict magnitude (how many months). Add regression in Phase 2.

---

## Outcome c — Project Risk Scoring Framework ✅ COMPLETE

**What the SIH asks for:** A composite risk score framework for project-level risk assessment.

**What we built:**
- 0–100 composite index with domain-calibrated thresholds
- 5 weighted components: Cost Escalation (30%), Schedule Delay (25%), Slow Progress (20%), Excess Expenditure (15%), Repeated Revisions (10%)
- 4 risk bands: Low (0–25), Medium (25–50), High (50–75), Critical (75–100)
- Distribution on current portfolio: 1,044 Low | 831 Medium | 171 High | 13 Critical

**Evidence:** `src/features.py → compute_risk_score()`, `data/processed/portfolio_kpis.json`

**Gap:** Weights are domain-expert chosen, not data-driven. Phase 2 could use feature importance from SHAP to calibrate weights empirically.

---

## Outcome d — Early Warning Alert System ✅ COMPLETE

**What the SIH asks for:** An alert system that flags projects needing intervention before problems escalate.

**What we built:**
- `GET /api/alerts` endpoint returns all High + Critical projects sorted by risk score
- Currently: **184 projects flagged** (171 High + 13 Critical)
- AI Assessment generated per project: "CRITICAL INTERVENTION REQUIRED: Driven primarily by Cost Escalation. Project exhibits 34-month delay with 63.3% cost escalation."
- `primary_risk_driver` field explains the dominant bottleneck

**Evidence:** `backend/server.js → /api/alerts`, `data/processed/latest_snapshot.json`

---

## Outcome e — Benchmarking and Comparative Analytics Module ✅ COMPLETE

**What the SIH asks for:** Comparative analytics to benchmark projects and agencies.

**What we built:**
- `GET /api/benchmarks/ministries` — ranks all ministries by total cost overrun (₹Cr), average risk score, and delay months
- Top insight from current data: **Ministry of Railways** has the highest aggregate cost overrun (₹1.96 lakh Cr) across 261 projects
- Agency-level track record feature (`agency_avg_overrun`) built into every ML model
- Statistical comparison: Logistic Regression vs Gradient Boosting (ROC-AUC and PR-AUC reported side-by-side)

**Evidence:** `backend/server.js → /api/benchmarks/ministries`

---

## Outcome f — Cost Escalation Driver Analysis Module ✅ COMPLETE (Proxy)

**What the SIH asks for:** Analysis of what drives cost escalation for each project.

**What we built:**
- `primary_risk_driver` field on every project: one of {Cost Escalation, Schedule Delay, Slow Physical Progress, Excessive Expenditure, Repeated Revisions}
- Portfolio-level driver summary in `portfolio_kpis.json`:
  - Slow Physical Progress: 918 projects
  - Schedule Delay: 750 projects
  - Cost Escalation: 319 projects
  - Excessive Expenditure: 51 projects
  - Repeated Revisions: 21 projects

**Evidence:** `src/features.py → compute_risk_score()`, `portfolio_kpis.json`

**Gap:** Driver is computed from a rule-based formula, not from SHAP ML attribution. SHAP would make this a true ML-driven driver analysis. This is the highest-priority Phase 2 upgrade.

---

## Outcome g — AI-Powered Monitoring Dashboard ⚠️ BACKEND READY, FRONTEND PENDING

**What the SIH asks for:** A web dashboard for visual monitoring.

**What we have:**
- Complete REST API with 8 endpoints (Node.js, port 5001)
- `latest_snapshot.json` and `portfolio_kpis.json` ready for frontend consumption
- Designed UI modules: KPI Cards, Risk Distribution Chart, Early Warning Feed, Project Explorer Table, Ministry Benchmarking Chart, Project Detail Modal

**Status:** Frontend not yet built. Build using React/Vite or vanilla HTML/CSS/JS.

---

## Outcome h — LLM-Enabled Project Intelligence Assistant 🔴 NOT YET

**What the SIH asks for:** Natural language Q&A over project data using an LLM.

**Plan:**
- Use the Gemini API (free tier available)
- Load project JSON into context, send natural language queries
- Example: "Which railway projects in Bihar have over 50% cost overrun?" → model parses and returns structured answer

**Effort:** ~1 day of work. Requires API key.

---

## Outcome i — Documentation and Deployment Framework ✅ COMPLETE

**What the SIH asks for:** Documentation describing the solution.

**What we have:**
- `docs/README.md` — Quick start, architecture overview, repository structure
- `docs/ARCHITECTURE.md` — Full data flow, column definitions, pipeline stages, API reference
- `docs/ML_DESIGN.md` — Model selection rationale, evaluation results, trade-offs, roadmap
- `docs/FEATURES_COVERAGE.md` — This file
- `src/run_all.py` — One-command deployment orchestrator

---

## Summary Table

| Outcome | Status | Completeness |
|:---|:---:|:---:|
| a. Cost Overrun Prediction Model | ✅ | ~85% (probability only, not magnitude) |
| b. Time Overrun Prediction Model | ✅ | ~85% (probability only, not magnitude) |
| c. Project Risk Scoring Framework | ✅ | 100% |
| d. Early Warning Alert System | ✅ | 100% |
| e. Benchmarking & Comparative Analytics | ✅ | 90% (ministry level; sector level easy to add) |
| f. Cost Escalation Driver Analysis | ✅ | 75% (rule-based; SHAP would make it 100%) |
| g. AI-Powered Monitoring Dashboard | ⚠️ | 60% (backend complete, frontend pending) |
| h. LLM-Enabled Project Intelligence | 🔴 | 0% (planned for Phase 2) |
| i. Documentation & Deployment Framework | ✅ | 100% |

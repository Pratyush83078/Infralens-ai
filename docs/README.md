# PAIMANA AI — Documentation Hub
### SIH 2025 Problem Statement 26103 | MoSPI / IPMD
> **Transforming India's Central Infrastructure Monitoring from Retrospective Reporting into an AI-Powered Predictive Early Warning System.**

---

## 🧭 Documentation Roadmap

This documentation suite is organized logically for both **non-technical evaluators** and **developers**. Follow this guide to find what you need:

| # | Document | Best For | What You Will Learn |
| :---: | :--- | :--- | :--- |
| **01** | [**System Architecture & Flow**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/01_ARCHITECTURE_AND_FLOW.md) | System Architects, Developers | 6-stage ingestion-to-UI pipeline, visual Mermaid flowcharts, scaling to 20 years, and Next.js vs decoupled backend analysis. |
| **02** | [**ML Model & Methodology**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/02_MODEL_AND_METHODOLOGY.md) | Data Scientists, Evaluators | Confirmed target variables, 13 input features, pure math vs ML models, Gradient Boosting vs Logistic Regression metrics (ROC-AUC 0.88), and explainability. |
| **03** | [**Dashboard & Metrics Guide**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/03_DASHBOARD_AND_METRICS_GUIDE.md) | Presenters, Product Managers | Screen-by-screen breakdown of the live web app, all header KPIs, risk band definitions, and deep-dive drawer telemetry. |
| **04** | [**Project Journey Example**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/04_PROJECT_JOURNEY_EXAMPLE.md) | Non-Technical, Interviewers | Step-by-step case study tracing a real project (Anandpur Barrage) from raw PDF line to predictive early-warning alert. |
| **05** | [**SIH Compliance & Winning Pitch**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/05_SIH_COMPLIANCE_AND_PITCH.md) | Hackathon Teams, Presenters | SIH 26103 outcome audit (a through i), what is genuinely working vs future plans, the 4-step winning demo script, and defense against tough judge questions. |
| **06** | [**Design System Specs**](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/06_DESIGN_SYSTEM.md) | Frontend Engineers, Designers | Neo-brutalist warm design tokens, CSS variables, typography, and component styling rules. |

---

## ⚡ 30-Second Executive Summary

1. **The Problem**: MoSPI monitors **2,059+ central projects costing ₹42.78 Lakh Crore**. Historical monitoring is *retrospective* — overruns and delays are officially acknowledged only after deadlines pass.
2. **Our Solution**: A **Dual-Engine Platform**:
   - **Current State Engine (Pure Math)**: 100% transparent, auditable 0–100 composite risk score and primary bottleneck attribution.
   - **Predictive Early Warning Engine (Gradient Boosting ML)**: Analyzes 13 dynamic signals (like progress stagnation and spend divergence) to forecast cost revisions and schedule slippage 30 days before they happen.
3. **The Tech Stack**:
   - Automated PDF parsing: `pdfplumber` (coordinate clustering).
   - Panel & Feature Engineering: `pandas`, `numpy`, `pyarrow`.
   - Machine Learning: `scikit-learn` (`GradientBoostingClassifier`, `LogisticRegression`).
   - Backend API: `Node.js` + `Express` (8 REST endpoints).
   - Frontend UI: `React 18` + `Vite` + `Recharts` + `Lucide Icons`.

---

## 📂 Archival Notes
Historical planning notes, scratchpads, and early-draft checklists have been safely organized in [`docs/archive/`](file:///Users/prem/Documents/Projects/Paimana-analysis/docs/archive/).

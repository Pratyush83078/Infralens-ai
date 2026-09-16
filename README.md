# PAIMANA — AI-Powered Infrastructure Project Risk & Early Warning System
### SIH 2025 Problem Statement 26103 | MoSPI / IPMD

> **Transform India's central infrastructure project monitoring from retrospective reporting into an AI-powered predictive early warning system.**

---

## What This Project Does

The government monitors **2,000+ central sector infrastructure projects** worth ₹37–43 lakh crore. Despite rich data, decisions are historically reactive — cost overruns and delays are detected only after they've happened.

This system ingests monthly PAIMANA Flash Reports and uses ML to:
- **Predict** which projects are heading toward cost escalation **before** the overrun is formally revised
- **Predict** which projects are heading toward schedule slippage **next month**
- **Score** every project on a **0–100 composite Risk Index** (Low / Medium / High / Critical)
- **Explain** *why* a project is flagged (primary risk driver: Cost Escalation, Schedule Delay, Slow Progress, etc.)
- **Export** all of this to a REST API consumed by a live monitoring dashboard

---

## Quick Start

### Install Python Dependencies
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run Everything at Once (Recommended)
```bash
python src/run_all.py

# Force re-extract PDFs even if CSVs already exist
python src/run_all.py --force-pdf
```

### Or Step-by-Step
```bash
python src/pdf_extracter.py data/pdfs/FlashReport_July_2026.pdf July2026 data/raw/July2026.csv
python src/pipeline.py
python src/model_train.py
python src/export_for_backend.py
```

### Start the Backend API
```bash
cd backend && npm install && npm start
# → http://localhost:5001
```

---

## Adding New Data

1. Download the latest Flash Report PDF from https://paimana-proj.mospi.gov.in/ReportPage
2. Drop it into `data/pdfs/`
3. Run `python src/run_all.py`
4. Everything re-runs automatically — new data, retraining, fresh export

---

## Repository Structure

```
Paimana-analysis/
├── data/
│   ├── pdfs/               ← Raw MoSPI Flash Report PDFs (gitignored)
│   ├── raw/                ← Extracted monthly CSVs
│   └── processed/          ← Panel, models (.joblib), exported JSONs
├── src/
│   ├── pdf_extracter.py    ← PDF → CSV extraction (Table 6)
│   ├── data_loader.py      ← Cleaning, date parsing, deduplication
│   ├── features.py         ← Feature engineering + risk scoring + driver attribution
│   ├── labels.py           ← Future-looking binary labels for ML
│   ├── pipeline.py         ← Build full multi-month panel
│   ├── model_train.py      ← Train + evaluate ML models
│   ├── export_for_backend.py ← Score all projects, export JSON
│   └── run_all.py          ← Master orchestrator (one command to rule them all)
├── backend/
│   ├── server.js           ← Node.js Express REST API (8 endpoints)
│   └── package.json
└── docs/
    ├── README.md           ← This file
    ├── ARCHITECTURE.md     ← Data flow, column definitions, pipeline stages
    ├── ML_DESIGN.md        ← Model choices, trade-offs, evaluation results, roadmap
    └── FEATURES_COVERAGE.md ← SIH outcome checklist (a–i) with current status
    and many more...
```

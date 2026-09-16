# 01 — System Architecture & Data Flow
### PAIMANA AI: End-to-End Pipeline, Dual-Engine Architecture & Evolution

---

## 1. System Overview & Core Philosophy

### The Non-Technical Intuition (The Hospital Analogy)
Imagine a giant hospital managing **2,000 giant patients** (each project is a ₹1,000+ Crore national infrastructure asset).
1. **Reading Reports**: A digital worker scans the monthly 400-page government health records.
2. **Medical History**: Stacks 4 months of records side-by-side to track patient changes over time.
3. **Checking Vitals (Pure Math)**: Calculates vital signs (spending speed, work velocity, delay months) into an auditable **Health Score (0–100)**.
4. **Predictive AI**: An ensemble model compares the patient's vitals to 7,500 historical cases to forecast: *"There is an 80% chance this patient will need a budget transfusion next month."*
5. **ICU Dashboard**: Ministers view a live control room to catch deteriorating projects before failure.

### The "Dual-Engine" Philosophy
Government bureaucrats and auditors reject black-box AI because they cannot legally justify reprimands on unexplained scores. PAIMANA solves this by decoupling into **two distinct engines**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │                   PAIMANA DUAL ENGINE                  │
                       └───────────────────┬────────────────┬───────────────────┘
                                           │                │
                    ┌──────────────────────▼───────┐ ┌──────▼───────────────────────┐
                    │   ENGINE 1: DESCRIPTIVE      │ │   ENGINE 2: PREDICTIVE       │
                    │   (Current State / Rules)    │ │   (Future Early Warning / ML)│
                    ├──────────────────────────────┤ ├──────────────────────────────┤
                    │ • 100% Deterministic Math    │ │ • Non-linear Machine Learning│
                    │ • "Where is project today?"  │ │ • "What will happen in 30d?" │
                    │ • 0–100 Composite Score      │ │ • Gradient Boosting Trees    │
                    │ • Auditable by CAG / MoSPI   │ │ • Catches hidden stagnation  │
                    │ • Primary Risk Driver        │ │ • Outputs Risk Probability % │
                    └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. End-to-End Pipeline (The 6 Execution Stages)

```
[Raw MoSPI PDF]
       │
       ▼ (Stage 1: Coordinate-Based Word Extraction - pdfplumber)
[data/raw/*.csv]
       │
       ▼ (Stage 2: Type Normalization, Date Parsing, Deduplication - pandas)
[data/processed/full_panel.parquet] (7,497 snapshots × 2,059 projects)
       │
       ├──────────────────────────────────────────────┐
       ▼ (Stage 3: Feature Engineering)               ▼ (Stage 4: Label Engineering)
[13 Dynamic Numerical Features]               [Future Shift Labels: T+1]
 - Snapshot Ratios (progress_gap, spend_gap)    - cost_revised_up_label (0/1)
 - Velocity Metrics (progress_velocity)         - schedule_slipped_label (0/1)
 - Agency Baselines (agency_avg_overrun)
       │                                              │
       └──────────────────────┬───────────────────────┘
                              ▼ (Stage 5: Supervised Model Training)
               [scikit-learn Pipelines: Imputer + Scaler]
               - LogisticRegression (Baseline)
               - GradientBoostingClassifier (Production ML)
                              │
                              ▼ (Model Serialization)
               [data/processed/*.joblib Binary Models]
                              │
                              ▼ (Stage 6: Latest Snapshot Inference)
               [latest_snapshot.json] + [portfolio_kpis.json]
                              │
                              ▼ (REST API Service - Node.js/Express :5001)
               [8 API Endpoints: /kpis, /alerts, /projects, /peers, /benchmarks]
                              │
                              ▼ (Frontend UI - React 18 + Vite + Recharts :5173)
               [Interactive Telemetry Dashboard & Deep-Dive Drawer]
```

### Stage Details & Code Symbols:
1. **Extraction** ([`src/pdf_extracter.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/pdf_extracter.py)): Uses `pdfplumber` horizontal word-coordinate clustering to reliably extract multi-line wrapped cells from Table 6.
2. **Cleaning** ([`src/data_loader.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/data_loader.py)): Strips currency commas, parses MM/YYYY strings into `pd.Timestamp`, deduplicates on `(project_code, report_month_dt)`, outputting `full_panel.parquet`.
3. **Feature Engineering** ([`src/features.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/features.py)): Computes 13 snapshot & velocity metrics (e.g., `progress_gap`, `spend_vs_progress_gap`, `progress_velocity`).
4. **Label Creation** ([`src/labels.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/labels.py)): Applies `shift(-1)` per project to establish ground truth for the next month ($T+1$).
5. **Model Training** ([`src/model_train.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/model_train.py)): Benchmarks `LogisticRegression` against `GradientBoostingClassifier` and dumps trained binaries to `.joblib` files.
6. **Inference & Serving** ([`src/export_for_backend.py`](file:///Users/prem/Documents/Projects/Paimana-analysis/src/export_for_backend.py) & [`backend/server.js`](file:///Users/prem/Documents/Projects/Paimana-analysis/backend/server.js)): Runs `predict_proba()` on the latest snapshot, saving `latest_snapshot.json` served via 8 Express endpoints to the React frontend.

---

## 3. Visual Architecture Diagrams

### Diagram 1: Current Working MVP Flow
```mermaid
flowchart TD
    subgraph Data_Layer ["1. Data Ingestion & Engineering"]
        PDF["Raw MoSPI PDF Reports<br/>(FlashReport_*.pdf)"] -->|"pdfplumber<br/>Coordinate Clustering"| EXT["src/pdf_extracter.py"]
        EXT -->|"Extracted Table 6"| CSV["data/raw/*.csv"]
        CSV -->|"Type Normalization &<br/>Date Parsing"| CLEAN["src/data_loader.py"]
        CLEAN -->|"Deduplicated Panel"| PARQUET["data/processed/full_panel.parquet<br/>(7,497 rows × 2,059 projects)"]
        PARQUET -->|"Snapshot & Velocity Ratios"| FEAT["src/features.py"]
        FEAT -->|"Future Lookahead (T+1)"| LABELS["src/labels.py"]
    end

    subgraph ML_Layer ["2. Predictive ML Engine"]
        LABELS -->|"Train/Test Split (80/20)"| TRAIN["src/model_train.py"]
        TRAIN -->|"Impute + Scale"| PIPELINE["scikit-learn Pipelines"]
        PIPELINE -->|"Baseline Comparison"| LOGREG["Logistic Regression<br/>ROC-AUC: 0.886 / 0.771"]
        PIPELINE -->|"Champion Ensemble"| GBM["Gradient Boosting<br/>ROC-AUC: 0.883 / 0.802"]
        GBM -->|"Serialize Binary"| JOBLIB["data/processed/*.joblib"]
    end

    subgraph Serving_Layer ["3. Backend & API Service"]
        JOBLIB -->|"Batch predict_proba()"| EXPORT["src/export_for_backend.py"]
        FEAT --> EXPORT
        EXPORT -->|"JSON Snapshots"| SNAP["latest_snapshot.json<br/>portfolio_kpis.json"]
        SNAP -->|"Express REST API (:5001)"| SERVER["backend/server.js"]
        SERVER -->|"/api/kpis, /api/alerts"| ENDPOINTS["8 REST Endpoints"]
        SERVER -->|"/api/projects, /api/peers"| ENDPOINTS
    end

    subgraph UI_Layer ["4. Interactive Frontend"]
        ENDPOINTS -->|"HTTP Fetch API"| API_CLIENT["frontend/src/api.js"]
        API_CLIENT -->|"Global State / Hooks"| REACT["React 18 + Vite SPA (:5173)"]
        REACT -->|"Recharts Donut / Bars"| DASH["Dashboard View (KPIs & Alerts)"]
        REACT -->|"Multi-filter Table"| EXPLORER["Projects Explorer View"]
        REACT -->|"Deep-Dive Slide-Out"| DRAWER["Project Detail Drawer<br/>(ML Probabilities & Peer Cohort)"]
        REACT -->|"Ranking Telemetry"| BENCH["Ministry Benchmarks View"]
    end
```

---

### Diagram 2: Ideal 20-Year Enterprise Target Architecture
How the system scales to process **20 years of historical OCMS records (500,000+ snapshots)**:

```mermaid
flowchart TD
    subgraph Enterprise_Ingestion ["Enterprise Ingestion Pipeline"]
        A1["MoSPI PAIMANA Live APIs<br/>(Push/Webhook)"] --> KAFKA["Apache Kafka / RabbitMQ<br/>Event Streaming"]
        A2["Historical OCMS DB Dump<br/>(2006–2026, 500K+ rows)"] --> KAFKA
        A3["External Data Feeds<br/>(IMD Rainfall, Steel/Cement CPI,<br/>e-Courts Land Disputes)"] --> KAFKA
        A4["Legacy Scanned PDFs"] --> OCR["OCR Pipeline<br/>(Tesseract + LayoutLM)"] --> KAFKA
    end

    subgraph Data_Lakehouse ["Lakehouse & Storage Engine"]
        KAFKA --> SPARK["Apache Spark / DuckDB<br/>ETL & Temporal Normalization"]
        SPARK --> ICEBERG["Apache Iceberg / Delta Lake<br/>(Parquet on S3 / MinIO)"]
        SPARK --> TIMEDB["TimescaleDB / PostgreSQL<br/>(Relational & Time-Series)"]
        SPARK --> POSTGIS["PostGIS<br/>(Geospatial Project Coordinates)"]
        SPARK --> FEAST["Feast Feature Store<br/>(Online/Offline Feature Sync)"]
    end

    subgraph Enterprise_ML ["Distributed ML & Explainability Ops"]
        FEAST --> RAY["Ray Train / MLflow<br/>Distributed Model Training"]
        RAY --> MODEL_CLASS["Multi-Class Early Warning<br/>(XGBoost / LightGBM / CatBoost)"]
        RAY --> MODEL_REG["Overrun Magnitude Regression<br/>(Quantile Gradient Boosting)"]
        RAY --> MODEL_SURV["Survival Analysis<br/>(Cox Proportional Hazards)"]
        RAY --> SHAP_ENGINE["SHAP TreeExplainer Engine<br/>(Per-Project Attribution Vectors)"]
        MODEL_CLASS & MODEL_REG & MODEL_SURV & SHAP_ENGINE --> REGISTRY["MLflow Model Registry<br/>(Versioned Artifacts)"]
    end

    subgraph GenAI_Engine ["Conversational Intelligence Copilot"]
        TIMEDB --> CHUNKER["Document & Project Summarizer"]
        CHUNKER --> VECTOR_DB["Vector Database<br/>(Milvus / Qdrant / pgvector)"]
        VECTOR_DB --> RAG["RAG Orchestrator<br/>(LangChain / LlamaIndex)"]
        RAG --> GEMINI["Google Gemini 1.5 Flash<br/>(Multimodal Project Copilot)"]
    end

    subgraph API_Microservices ["High-Throughput Serving Layer"]
        REGISTRY --> TRITON["Triton / FastAPI<br/>High-Speed ML Inference Service"]
        TIMEDB & POSTGIS --> GO_API["FastAPI / Go Microservice<br/>(Sub-5ms Filter & Geo Queries)"]
        GO_API --> REDIS["Redis Cache<br/>(KPI Aggregations & Session Store)"]
    end

    subgraph Enterprise_Frontend ["Next.js Enterprise Portal"]
        GO_API & TRITON & GEMINI & REDIS --> NEXTJS["Next.js 15 App Router<br/>(SSR, Edge Caching, Server Components)"]
        NEXTJS --> MAPBOX["Mapbox GL / Deck.gl<br/>(Interactive India GIS Map)"]
        NEXTJS --> CHAT_UI["Ministerial Copilot Chat Drawer<br/>(Gemini Streaming Responses)"]
        NEXTJS --> PDF_EXPORT["Automated Cabinet Briefing Note<br/>(1-Click PDF Generation)"]
    end
```

---

## 4. Tech Stack Evolution (MVP vs 20-Year Scaled Production)

| Layer | Current Hackathon MVP | 20-Year Scaled Production | Rationale |
| :--- | :--- | :--- | :--- |
| **Storage** | Parquet (`pyarrow`) | **PostgreSQL + TimescaleDB** | 500K records need ACID transactions, indexes, and fast time-bucket aggregations. |
| **PDF Extraction**| `pdfplumber` (coordinate heuristics) | **LayoutLMv3 + Tesseract OCR** | Parses legacy scanned low-res PDFs (2006–2014 OCMS era) where vector text is absent. |
| **ML Engine** | `GradientBoostingClassifier` | **XGBoost / LightGBM / CatBoost** | Native GPU acceleration, native categorical handling, 10× faster training on 500K rows. |
| **Stats Expansion**| Binary classification | **Quantile Regressor + Cox Survival**| Predicts continuous overrun ₹ Cr and time-to-delay survival probability curves. |
| **Explainability** | Linear weighted decomposition | **SHAP (`TreeExplainer`)** | Mathematical Shapley values with local waterfall contribution plots per project. |
| **Backend API** | Node.js (Express) | **Python FastAPI (Async)** | Loads models in-memory with C-bindings (`onnxruntime`), eliminating JSON export lag. |
| **AI Copilot** | Deterministic string synthesis | **Gemini 1.5 Flash + pgvector (RAG)**| Conversational natural language querying over 20 years of audit records. |
| **GIS Mapping** | State name strings | **PostGIS + Mapbox GL / Deck.gl** | Visualizes projects on a live map of India with interactive risk pins. |

---

## 5. Architectural Analysis: Next.js vs Decoupled React + Separate Backend

### The Trade-off Matrix

| Criterion | Pure Next.js (All-in-One Serverless) | Decoupled: React SPA + Separate Backend (Current) | Decoupled: Next.js + FastAPI Microservice (Roadmap) |
| :--- | :--- | :--- | :--- |
| **Deployment** | ⭐⭐⭐⭐⭐ (Single Vercel click) | ⭐⭐⭐ (Two local processes: frontend & backend) | ⭐⭐⭐ (Vercel for UI, Render/Fly for API) |
| **ML Compatibility** | ❌ **Incompatible**: Serverless runs Node.js. Cannot run `scikit-learn`, `pandas`, or `pdfplumber` natively. | ✅ Python pipelines run cleanly; Node.js serves pre-scored JSON. | ⭐⭐⭐⭐⭐ **The Gold Standard**: Python FastAPI runs ML natively; Next.js renders the UI. |
| **Heavy File Ingestion** | ❌ 50MB payload limits & 10–60s timeouts crash on 400-page MoSPI PDFs. | ✅ Persistent process with access to local filesystem and zero timeouts. | ✅ Asynchronous background worker handles ingestion and retraining. |
| **Demo Stability** | ⚠️ Subject to conference Wi-Fi, Vercel rate-limits, and cold starts. | ✅ **100% Reliable locally**: Runs offline on `localhost:5173` and `:5001`. | ⚠️ Requires reliable cloud hosting. |

### The Winning Interview Pitch:
> *"We evaluated an all-in-one Next.js setup, but deliberately chose a decoupled architecture because of our data science compute requirements. Parsing 400-page government PDFs via coordinate extraction and training 7,500-row tree ensembles requires native Python data science runtimes (`pandas`, `scikit-learn`, `pdfplumber`). Running these inside serverless Node.js functions causes severe memory bottlenecks and timeout crashes. In our enterprise roadmap, we decouple a Next.js 15 UI from an asynchronous Python FastAPI microservice, keeping the ministerial dashboard lightning-fast while heavy data pipelines scale independently."*

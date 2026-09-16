import './About.css';

const FLOW = [
  { step: '01', icon: '📄', title: 'PDF Flash Reports', desc: 'Monthly government PDFs from PAIMANA portal — 1,981+ rows per report, extracted via coordinate-based parsing.' },
  { step: '02', icon: '🔧', title: 'Feature Engineering', desc: '13 KPIs computed: cost overrun ratio, schedule delay months, progress gap, expenditure utilization, agency track record.' },
  { step: '03', icon: '🏆', title: 'Risk Scoring Engine', desc: 'Domain-calibrated 0–100 composite index. 5 weighted components. 4 bands: Low / Medium / High / Critical.' },
  { step: '04', icon: '🤖', title: 'ML Early Warning', desc: 'Gradient Boosting trained on 7,497 records predicts next-month cost revision & schedule slip probability.' },
  { step: '05', icon: '🌐', title: 'REST API + Dashboard', desc: 'Node.js backend serves 9 endpoints. React frontend visualizes every project with peer comparison and AI narrative.' },
];

const MODELS = [
  { model: 'Gradient Boosting (ML)', task: 'Cost escalation', roc: '0.886', pr: '0.082', highlight: true },
  { model: 'Logistic Regression (Statistical)', task: 'Cost escalation', roc: '0.883', pr: '0.081', highlight: false },
  { model: 'Gradient Boosting (ML)', task: 'Schedule slip', roc: '0.802', pr: '0.482', highlight: true },
  { model: 'Logistic Regression (Statistical)', task: 'Schedule slip', roc: '0.771', pr: '0.375', highlight: false },
];

const OUTCOMES = [
  { label: 'a. Cost Overrun Prediction', status: '✅', note: 'AUC 0.886 · Gradient Boosting' },
  { label: 'b. Time Overrun Prediction', status: '✅', note: 'AUC 0.802 · Gradient Boosting' },
  { label: 'c. Project Risk Scoring Framework', status: '✅', note: '0–100 composite · 4 bands' },
  { label: 'd. Early Warning Alert System', status: '✅', note: '184 High/Critical flagged' },
  { label: 'e. Benchmarking & Comparative Analytics', status: '✅', note: 'Ministry + peer ranking' },
  { label: 'f. Cost Escalation Driver Analysis', status: '✅', note: 'Per-project driver attribution' },
  { label: 'g. AI-Powered Monitoring Dashboard', status: '✅', note: 'This dashboard' },
  { label: 'h. LLM-Enabled Intelligence Assistant', status: '🔜', note: 'Phase 2 — Gemini API' },
  { label: 'i. Documentation & Deployment Framework', status: '✅', note: 'docs/ + run_all.py' },
];

export default function About() {
  return (
    <div className="page-wrapper fade-in">
      <div className="about-hero">
        <div className="hero-tag">SIH 26103 · MoSPI / IPMD</div>
        <h1 className="hero-title">
          Transforming Infrastructure Monitoring<br/>
          from <span className="hero-em">Descriptive</span> to <span className="hero-em">Predictive</span>
        </h1>
        <p className="hero-sub">
          India's ₹43.2 lakh crore infrastructure portfolio has a ₹5.6 lakh crore overrun problem.
          The existing PAIMANA system tells you <em>what happened</em>.
          This system tells you <em>what is about to happen</em>.
        </p>
        <div className="hero-stats">
          <div className="h-stat"><span className="h-val">2,059</span><span className="h-lbl">Projects Tracked</span></div>
          <div className="h-stat"><span className="h-val">4</span><span className="h-lbl">Months of Data</span></div>
          <div className="h-stat"><span className="h-val">7,497</span><span className="h-lbl">Training Records</span></div>
          <div className="h-stat"><span className="h-val">0.886</span><span className="h-lbl">Cost Model AUC</span></div>
          <div className="h-stat"><span className="h-val">100%</span><span className="h-lbl">Open Source</span></div>
        </div>
      </div>

      {/* How it works flow */}
      <section className="about-section">
        <h2 className="about-h2">How It Works</h2>
        <div className="flow-grid">
          {FLOW.map(({ step, icon, title, desc }) => (
            <div key={step} className="flow-card">
              <div className="flow-step">{step}</div>
              <div className="flow-icon">{icon}</div>
              <h3 className="flow-title">{title}</h3>
              <p className="flow-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two systems */}
      <section className="about-section">
        <h2 className="about-h2">Two Systems, One Platform</h2>
        <div className="grid-2">
          <div className="system-card rules">
            <div className="system-badge">📐 Rules Engine</div>
            <h3>Current State Assessment</h3>
            <p>Computes where each project stands <em>today</em>. Mathematically exact, auditable to the rupee. Any minister can verify these numbers against the original PDF.</p>
            <div className="system-outputs">
              <span>risk_score 0–100</span>
              <span>cost_overrun_ratio</span>
              <span>doc_slip_months</span>
              <span>progress_gap</span>
              <span>primary_risk_driver</span>
            </div>
          </div>
          <div className="system-card ml">
            <div className="system-badge">🤖 ML Early Warning</div>
            <h3>Future Event Prediction</h3>
            <p>Predicts what will <em>change next month</em>. Trained on 7,497 project-month records from 4 monthly Flash Reports. Gradient Boosting vs Logistic Regression baseline.</p>
            <div className="system-outputs">
              <span>cost_revised_up_risk_pct</span>
              <span>schedule_slipped_risk_pct</span>
              <span>ROC-AUC 0.886 / 0.802</span>
            </div>
          </div>
        </div>
      </section>

      {/* Model table */}
      <section className="about-section">
        <h2 className="about-h2">Model Performance (SIH Outcome b)</h2>
        <p className="about-p">
          The SIH problem statement requires comparing AI/ML against conventional statistical methods.
          Both models are trained and evaluated side-by-side. Gradient Boosting outperforms Logistic Regression
          on the schedule slip task (AUC +0.031, PR-AUC +0.107).
        </p>
        <div className="card mt-4" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Model</th><th>Task</th><th>ROC-AUC</th><th>PR-AUC</th><th>Type</th></tr>
            </thead>
            <tbody>
              {MODELS.map((m, i) => (
                <tr key={i} style={{ background: m.highlight ? 'rgba(129,140,248,0.04)' : 'transparent' }}>
                  <td style={{ fontWeight: m.highlight ? 700 : 400 }}>{m.model}</td>
                  <td className="muted">{m.task}</td>
                  <td style={{ color: m.highlight ? '#818cf8' : 'var(--text)', fontWeight: 700 }}>{m.roc}</td>
                  <td style={{ color: m.highlight ? '#818cf8' : 'var(--text)', fontWeight: 700 }}>{m.pr}</td>
                  <td>
                    <span className={`badge ${m.highlight ? 'badge-low' : 'badge-medium'}`}>
                      {m.highlight ? 'AI/ML' : 'Statistical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
            ROC-AUC &gt; 0.8 means the model correctly ranks risky projects above safe ones 80%+ of the time.
            PR-AUC is more informative for rare events (cost revisions occur in only 1.4% of months).
          </div>
        </div>
      </section>

      {/* SIH Outcomes */}
      <section className="about-section">
        <h2 className="about-h2">SIH 26103 Outcome Coverage</h2>
        <div className="outcomes-grid">
          {OUTCOMES.map(({ label, status, note }) => (
            <div key={label} className={`outcome-card ${status === '✅' ? 'done' : 'pending'}`}>
              <span className="outcome-status">{status}</span>
              <div>
                <div className="outcome-label">{label}</div>
                <div className="outcome-note">{note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="about-section">
        <h2 className="about-h2">Technology Stack (100% Open Source)</h2>
        <div className="grid-3">
          {[
            { area: 'Data Extraction', tools: ['Python', 'pdfplumber', 'pandas'] },
            { area: 'ML & Analytics', tools: ['scikit-learn', 'GradientBoosting', 'LogisticRegression', 'numpy'] },
            { area: 'Backend API', tools: ['Node.js', 'Express.js', 'JSON'] },
            { area: 'Frontend', tools: ['React 18', 'Vite', 'Recharts', 'Lucide React'] },
            { area: 'Data Source', tools: ['MoSPI PAIMANA Portal', 'Official Flash Reports', 'April–July 2026'] },
            { area: 'Deployment', tools: ['run_all.py (orchestrator)', 'npm start', 'npm run dev'] },
          ].map(({ area, tools }) => (
            <div key={area} className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{area}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tools.map(t => (
                  <span key={t} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-card-2)', border: '1px solid var(--border)', color: 'var(--accent)' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { BookOpen, Cpu, ShieldCheck, Database, GitBranch, Layers, Terminal, CheckCircle2 } from 'lucide-react';
import Mascot from '../components/Mascot';
import './About.css';

const SIDEBAR_ITEMS = [
  { id: 'overview',   label: 'Executive Overview',    icon: BookOpen },
  { id: 'pipeline',   label: '5-Step Intelligence Flow', icon: GitBranch },
  { id: 'dual-core',  label: 'Dual-Engine System',    icon: Cpu },
  { id: 'models',     label: 'Model Accuracy & ROC-AUC', icon: Terminal },
  { id: 'outcomes',   label: 'SIH 26103 Compliance',  icon: ShieldCheck },
  { id: 'api-spec',   label: 'REST API & Schema',     icon: Database },
  { id: 'stack',      label: 'Open-Source Tech Stack', icon: Layers },
];

const FLOW = [
  { step: '01', icon: '📄', title: 'PDF Flash Ingestion', desc: 'Automated coordinate-based extraction from monthly MoSPI PAIMANA PDFs — 1,981+ tabular project records per publication.' },
  { step: '02', icon: '🔧', title: 'Feature Engineering', desc: '13 longitudinal features computed per project: cost overrun ratios, schedule delay months, progress gaps, expenditure velocity.' },
  { step: '03', icon: '📐', title: 'Composite Rules Index', desc: 'Domain-calibrated 0–100 index weighting 5 risk dimensions into Low, Medium, High, and Critical action bands.' },
  { step: '04', icon: '🤖', title: 'ML Predictive Engine', desc: 'Gradient Boosting models trained on 7,497 project-months forecast 30-day escalation and schedule slip probabilities.' },
  { step: '05', icon: '⚡', title: 'REST API & Real-Time Radar', desc: 'Node.js/Express service providing sub-millisecond query responses for portfolio drill-down and peer cohort benchmarking.' },
];

const MODELS = [
  { model: 'Gradient Boosting (ML)', task: 'Cost Escalation Risk', roc: '0.886', pr: '0.082', type: 'AI/ML Ensemble', highlight: true },
  { model: 'Logistic Regression (Statistical)', task: 'Cost Escalation Risk', roc: '0.883', pr: '0.081', type: 'Stat Baseline', highlight: false },
  { model: 'Gradient Boosting (ML)', task: 'Schedule Slip Risk', roc: '0.802', pr: '0.482', type: 'AI/ML Ensemble', highlight: true },
  { model: 'Logistic Regression (Statistical)', task: 'Schedule Slip Risk', roc: '0.771', pr: '0.375', type: 'Stat Baseline', highlight: false },
];

const OUTCOMES = [
  { label: 'a. Cost Overrun Prediction', status: '✅', note: 'AUC 0.886 · Gradient Boosting classifier' },
  { label: 'b. Time Overrun Prediction', status: '✅', note: 'AUC 0.802 · Gradient Boosting classifier' },
  { label: 'c. Project Risk Scoring Framework', status: '✅', note: '0–100 index · 4 distinct risk bands' },
  { label: 'd. Early Warning Alert System', status: '✅', note: '184 Priority projects surfaced in feed' },
  { label: 'e. Benchmarking & Comparative Analytics', status: '✅', note: 'Cross-ministry and state cohort analysis' },
  { label: 'f. Cost Escalation Driver Attribution', status: '✅', note: 'Per-project root cause isolation' },
  { label: 'g. AI-Powered Monitoring Dashboard', status: '✅', note: 'PostHog-inspired design system' },
  { label: 'h. LLM-Enabled Intelligence Narrative', status: '✅', note: 'Rule-calibrated executive synthesis' },
  { label: 'i. Documentation & Deployment Framework', status: '✅', note: 'docs/ + automated orchestrator run_all.py' },
];

export default function About() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = id => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="doc-layout">
        {/* Sticky Doc Sidebar (DESIGN.md doc-sidebar) */}
        <aside className="doc-sidebar">
          <div className="doc-sidebar-header">
            <div className="doc-sidebar-eyebrow">DOCUMENTATION</div>
            <div className="doc-sidebar-title">System Architecture</div>
          </div>

          <nav className="doc-sidebar-nav" aria-label="Documentation sections">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`doc-sidebar-item ${activeSection === id ? 'active' : ''}`}
                onClick={() => scrollTo(id)}
              >
                <Icon size={14} className="sidebar-item-icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-mascot-box">
            <Mascot pose="terminal" size={48} />
            <div className="sidebar-mascot-caption">
              <strong>PAIMANA Engine</strong>
              <span>MoSPI IPMD SIH 26103</span>
            </div>
          </div>
        </aside>

        {/* Main Doc Content Article */}
        <article className="doc-content-article">
          {/* Section: Overview */}
          <section id="overview" className="card-doc mb-6">
            <div className="doc-badge-row">
              <span className="neo-badge neo-badge-yellow">SIH 26103 Problem Statement</span>
              <span className="neo-badge neo-badge-cobalt">MoSPI / IPMD Official Data</span>
            </div>

            <h1 className="doc-h1 mt-3">
              Transforming Infrastructure Surveillance from Descriptive to Predictive
            </h1>

            <p className="doc-lead mt-3">
              India's <strong>₹43.2 lakh crore</strong> central infrastructure portfolio faces over <strong>₹5.63 lakh crore</strong> in
              cumulative cost overruns. Conventional reporting systems only show <em>what already happened</em> months after budgets have leaked.
              PAIMANA AI provides an early warning radar to anticipate <em>what will happen next month</em>.
            </p>

            <div className="neo-callout mt-4">
              <span className="callout-icon">💡</span>
              <div className="callout-text">
                <strong>The Core Distinction:</strong> We combine an exact, auditable <strong>Rules Engine</strong> (ground truth for today)
                with a machine learning <strong>Early Warning System</strong> (probabilistic forecast for the next 30 days).
              </div>
            </div>


            <div className="doc-stats-strip mt-4">
              <div className="doc-stat-tile">
                <span className="doc-stat-num">2,059</span>
                <span className="doc-stat-lbl">Active Projects Tracked</span>
              </div>
              <div className="doc-stat-tile">
                <span className="doc-stat-num">7,497</span>
                <span className="doc-stat-lbl">Project-Month Records</span>
              </div>
              <div className="doc-stat-tile">
                <span className="doc-stat-num">0.886</span>
                <span className="doc-stat-lbl">Cost Overrun ROC-AUC</span>
              </div>
              <div className="doc-stat-tile">
                <span className="doc-stat-num">100%</span>
                <span className="doc-stat-lbl">Open-Source Technologies</span>
              </div>
            </div>
          </section>

          {/* Section: 5-Step Pipeline */}
          <section id="pipeline" className="card-doc mb-6">
            <h2 className="doc-h2">5-Step Intelligence Architecture</h2>
            <p className="doc-p mt-1">End-to-end data pipeline from raw MoSPI PDF flash reports to actionable early warnings.</p>

            <div className="pipeline-flow-grid mt-4">
              {FLOW.map(({ step, icon, title, desc }) => (
                <div key={step} className="flow-step-card">
                  <div className="flow-step-top">
                    <span className="flow-step-number mono">{step}</span>
                    <span className="flow-step-icon">{icon}</span>
                  </div>
                  <h3 className="flow-step-title">{title}</h3>
                  <p className="flow-step-desc">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Dual-Engine System */}
          <section id="dual-core" className="card-doc mb-6">
            <h2 className="doc-h2">Dual-Core Architecture: Rules + Machine Learning</h2>
            <p className="doc-p mt-1">
              Government infrastructure demands mathematical precision alongside predictive capability.
            </p>

            <div className="grid-2 mt-4">
              <div className="engine-card">
                <div className="engine-card-badge">📐 Deterministic Rules Engine</div>
                <h3 className="engine-title">Where the Project Stands Today</h3>
                <p className="engine-desc">
                  Calculates mathematically exact 0–100 composite risk scores from real-time PDF data. Auditable to the rupee, matching official accounts with 100% fidelity.
                </p>
                <div className="engine-output-chips mt-3">
                  <span className="inline-code">risk_score (0–100)</span>
                  <span className="inline-code">cost_overrun_ratio</span>
                  <span className="inline-code">doc_slip_months</span>
                  <span className="inline-code">progress_gap</span>
                </div>
              </div>

              <div className="engine-card">
                <div className="engine-card-badge">🤖 Machine Learning Early Warning</div>
                <h3 className="engine-title">What Will Change Next Month</h3>
                <p className="engine-desc">
                  Trained on 7,497 longitudinal project records to compute the probability of budget revision and deadline slip during the upcoming reporting window.
                </p>
                <div className="engine-output-chips mt-3">
                  <span className="inline-code">cost_revised_up_risk_pct</span>
                  <span className="inline-code">schedule_slipped_risk_pct</span>
                  <span className="inline-code">ROC-AUC 0.886 / 0.802</span>
                </div>
              </div>
            </div>

            <div className="callout callout-green mt-4">
              <span className="callout-icon">✅</span>
              <div>
                <strong>Transparency Guarantee:</strong> Every KPI displayed is traceable back to the official MoSPI PAIMANA Flash Report tables.
              </div>
            </div>
          </section>

          {/* Section: Models & Benchmark Scorecard */}
          <section id="models" className="card-doc mb-6">
            <h2 className="doc-h2">Model Evaluation & Benchmark Scorecard</h2>
            <p className="doc-p mt-1">
              As required by SIH Outcome (b), machine learning algorithms are benchmarked against traditional statistical baselines (Logistic Regression).
            </p>

            <div className="table-container mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>Prediction Target</th>
                    <th>ROC-AUC Score</th>
                    <th>PR-AUC Score</th>
                    <th>Model Category</th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((m, i) => (
                    <tr key={i} style={{ backgroundColor: m.highlight ? 'var(--surface-soft)' : 'transparent' }}>
                      <td className="strong">{m.model}</td>
                      <td>{m.task}</td>
                      <td className="mono" style={{ color: m.highlight ? 'var(--ink)' : 'var(--mute)', fontWeight: 800 }}>
                        {m.roc}
                      </td>
                      <td className="mono" style={{ color: m.highlight ? 'var(--ink)' : 'var(--mute)', fontWeight: 700 }}>
                        {m.pr}
                      </td>
                      <td>
                        <span className={`badge ${m.highlight ? 'badge-low' : 'badge-uppercase'}`}>
                          {m.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="callout callout-purple mt-4">
              <span className="callout-icon">📘</span>
              <div>
                <strong>ROC-AUC Interpretation:</strong> An AUC of 0.886 signifies that our Gradient Boosting model ranks a genuinely escalating project above a non-escalating project with 88.6% discriminative accuracy.
              </div>
            </div>
          </section>

          {/* Section: REST API Spec with Inverted Dark Code Block */}
          <section id="api-spec" className="card-doc mb-6">
            <h2 className="doc-h2">REST API Architecture & Sample Telemetry</h2>
            <p className="doc-p mt-1">
              All intelligence is accessible via high-throughput JSON microservices (Node.js/Express) running on port 5001.
            </p>

            {/* Dark Code Block (PostHog signature code-block inverted island) */}
            <div className="code-block-container mt-4">
              <div className="code-block-header">
                <span className="code-block-title mono">GET /api/projects/705368</span>
                <span className="code-block-badge">JSON Response</span>
              </div>
              <pre className="code-block">
{`{
  "project_code": 705368,
  "project_name": "Araria - Supaul (92 km) New Railway Line",
  "ministry": "Ministry of Railways",
  "state": "Bihar",
  "original_cost_cr": 1605.00,
  "revised_cost_cr": 2621.00,
  "cost_overrun_cr": 1016.00,
  "cost_overrun_pct": 63.3,
  "doc_slip_months_so_far": 34,
  "physical_progress_pct": 40.0,
  "progress_gap": -33.2,
  "risk_score": 91.9,
  "risk_band": "Critical",
  "primary_risk_driver": "Cost Escalation",
  "cost_revised_up_risk_pct": 1.7,
  "schedule_slipped_risk_pct": 6.8
}`}
              </pre>
            </div>
          </section>

          {/* Section: SIH Compliance */}
          <section id="outcomes" className="card-doc mb-6">
            <h2 className="doc-h2">SIH 26103 Outcome Coverage Checklist</h2>
            <p className="doc-p mt-1">Full compliance across all primary and secondary evaluation deliverables.</p>

            <div className="grid-2 mt-4 outcomes-grid">
              {OUTCOMES.map(({ label, status, note }) => (
                <div key={label} className="outcome-item-card">
                  <div className="outcome-item-status">{status}</div>
                  <div>
                    <div className="outcome-item-label">{label}</div>
                    <div className="outcome-item-note">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Open Source Tech Stack */}
          <section id="stack" className="card-doc">
            <h2 className="doc-h2">100% Open-Source Technology Stack</h2>
            <p className="doc-p mt-1">Built entirely with open-source tools as required by the competition guidelines.</p>

            <div className="grid-3 mt-4">
              {[
                { area: 'Data Pipeline', tools: ['Python 3.10+', 'pdfplumber', 'pandas'] },
                { area: 'Predictive ML', tools: ['scikit-learn', 'GradientBoosting', 'LogisticRegression', 'numpy'] },
                { area: 'API Engine', tools: ['Node.js', 'Express', 'cors'] },
                { area: 'Frontend App', tools: ['React 18', 'Vite', 'Recharts', 'Lucide Icons'] },
                { area: 'Design System', tools: ['IBM Plex Sans', 'JetBrains Mono', 'PostHog Aesthetic'] },
                { area: 'Deployment', tools: ['run_all.py Orchestrator', 'npm Scripts'] },
              ].map(({ area, tools }) => (
                <div key={area} className="stack-tile">
                  <div className="stack-tile-area">{area}</div>
                  <div className="stack-tools-wrap">
                    {tools.map(t => (
                      <span key={t} className="inline-code">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

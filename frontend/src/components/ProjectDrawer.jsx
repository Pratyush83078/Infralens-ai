import { riskColor, cleanState, fmtCr } from '../api';
import './ProjectDrawer.css';

const BAND_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function RiskBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="risk-bar-row">
      <span className="risk-bar-label">{label}</span>
      <div className="risk-bar-track">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="risk-bar-val">{value.toFixed(1)}</span>
    </div>
  );
}

function ProbMeter({ label, pct, icon }) {
  const color = pct >= 20 ? '#ef4444' : pct >= 10 ? '#f97316' : pct >= 5 ? '#eab308' : '#22c55e';
  return (
    <div className="prob-meter">
      <div className="prob-header">
        <span className="prob-icon">{icon}</span>
        <span className="prob-label">{label}</span>
      </div>
      <div className="prob-value" style={{ color }}>{pct?.toFixed(1)}%</div>
      <div className="progress-bar-wrap mt-2">
        <div className="progress-bar-fill" style={{ width: `${Math.min(pct * 3, 100)}%`, background: color }} />
      </div>
      <div className="prob-sub" style={{ color }}>
        {pct >= 15 ? '⚠ High probability' : pct >= 5 ? 'Moderate risk' : 'Low risk next month'}
      </div>
    </div>
  );
}

export default function ProjectDrawer({ project, onClose, peers }) {
  if (!project) return null;

  const overrunCr    = Math.max(0, project.revised_cost_cr - project.original_cost_cr);
  const overrunPct   = project.original_cost_cr > 0
    ? ((overrunCr / project.original_cost_cr) * 100).toFixed(1) : 0;
  const expendPct    = project.revised_cost_cr > 0
    ? ((project.cumulative_expenditure_cr / project.revised_cost_cr) * 100).toFixed(1) : 0;
  const bandColor    = riskColor(project.risk_band);
  const scoreClr     = riskColor(project.risk_band);
  const stateCleaned = cleanState(project.state);

  // Risk component breakdown (reverse-engineer from weighted formula)
  const costRisk  = Math.min(Math.max(project.cost_overrun_ratio_so_far || 0, 0) / 0.50, 1) * 30;
  const schedRisk = Math.min((project.doc_slip_months_so_far || 0) / 36, 1) * 25;
  const progRisk  = Math.min(Math.max(-(project.progress_gap || 0), 0) / 40, 1) * 20;

  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="drawer fade-in">
        {/* Header */}
        <div className="drawer-header" style={{ borderLeft: `4px solid ${bandColor}` }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge badge-${project.risk_band?.toLowerCase()}`}>
                {project.risk_band}
              </span>
              <span className="drawer-code">#{project.project_code}</span>
            </div>
            <h2 className="drawer-title">{project.project_name}</h2>
            <div className="drawer-meta">
              {project.ministry} · {stateCleaned} · {project.agency?.replace(/[()]/g, '').trim()}
            </div>
          </div>
          <button className="drawer-close btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Financial Snapshot */}
          <section className="drawer-section">
            <div className="section-title">💰 Financial Snapshot</div>
            <div className="fin-grid">
              <div className="fin-block">
                <div className="fin-label">Original Cost</div>
                <div className="fin-value">{fmtCr(project.original_cost_cr)}</div>
              </div>
              <div className="fin-arrow">→</div>
              <div className="fin-block">
                <div className="fin-label">Revised Cost</div>
                <div className="fin-value" style={{ color: overrunCr > 0 ? '#ef4444' : '#22c55e' }}>
                  {fmtCr(project.revised_cost_cr)}
                </div>
                {overrunCr > 0 && (
                  <div className="fin-badge-overrun">+{fmtCr(overrunCr)} (+{overrunPct}%)</div>
                )}
              </div>
              <div className="fin-block fin-exp">
                <div className="fin-label">Expenditure</div>
                <div className="fin-value">{fmtCr(project.cumulative_expenditure_cr)}</div>
                <div className="fin-exp-pct">{expendPct}% utilized</div>
              </div>
            </div>
          </section>

          {/* Risk Score Breakdown */}
          <section className="drawer-section">
            <div className="section-title">🎯 Risk Score Breakdown</div>
            <div className="score-row">
              <div className="score-circle" style={{ '--score-color': scoreClr }}>
                <svg viewBox="0 0 100 100" className="score-svg">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke={scoreClr}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(project.risk_score / 100) * 264} 264`}
                    transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
                </svg>
                <div className="score-center">
                  <div className="score-num" style={{ color: scoreClr }}>{project.risk_score?.toFixed(1)}</div>
                  <div className="score-denom">/100</div>
                </div>
              </div>
              <div className="score-bars flex-col gap-2" style={{ flex: 1 }}>
                <RiskBar label="Cost Escalation"  value={costRisk}  max={30} color="#ef4444" />
                <RiskBar label="Schedule Delay"   value={schedRisk} max={25} color="#f97316" />
                <RiskBar label="Slow Progress"    value={progRisk}  max={20} color="#eab308" />
                <div className="driver-chip">
                  Primary Driver: <strong>{project.primary_risk_driver}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="drawer-section">
            <div className="section-title">📅 Schedule Status</div>
            <div className="schedule-row">
              <div className="sched-block">
                <div className="sched-label">Physical Progress</div>
                <div className="sched-val">{project.physical_progress_pct?.toFixed(1)}%</div>
                <div className="progress-bar-wrap mt-2">
                  <div className="progress-bar-fill" style={{
                    width: `${project.physical_progress_pct}%`,
                    background: riskColor(project.risk_band)
                  }}/>
                </div>
              </div>
              <div className="sched-block">
                <div className="sched-label">Schedule Delay</div>
                <div className="sched-val" style={{ color: project.doc_slip_months_so_far > 24 ? '#ef4444' : '#f97316' }}>
                  {project.doc_slip_months_so_far} months
                </div>
                <div className="sched-sub">
                  {project.doc_slip_months_so_far > 0
                    ? `~${(project.doc_slip_months_so_far / 12).toFixed(1)} years behind schedule`
                    : 'On schedule'}
                </div>
              </div>
              <div className="sched-block">
                <div className="sched-label">Progress Gap</div>
                <div className="sched-val" style={{ color: (project.progress_gap || 0) < -10 ? '#ef4444' : '#22c55e' }}>
                  {(project.progress_gap || 0).toFixed(1)}%
                </div>
                <div className="sched-sub">vs expected progress</div>
              </div>
            </div>
          </section>

          {/* ML Early Warning */}
          <section className="drawer-section">
            <div className="section-title">🤖 AI Early Warning — Next Month Predictions</div>
            <div className="grid-2">
              <ProbMeter label="Cost Escalation Risk" pct={project.cost_revised_up_risk_pct}    icon="💸" />
              <ProbMeter label="Schedule Slip Risk"    pct={project.schedule_slipped_risk_pct}   icon="⏰" />
            </div>
            <div className="ml-disclaimer">
              Predictions by Gradient Boosting Classifier trained on 7,497 project-month records · ROC-AUC 0.886 / 0.802
            </div>
          </section>

          {/* Peer Comparison */}
          {peers && peers.peer_group?.count > 0 && (
            <section className="drawer-section">
              <div className="section-title">📊 Peer Comparison</div>
              <div className="peer-insight">{peers.peer_insight}</div>
              <div className="peer-grid">
                <div className="peer-row header">
                  <span>Metric</span><span>This Project</span><span>Peer Avg ({peers.peer_group.count} projects)</span>
                </div>
                <div className="peer-row">
                  <span>Cost Overrun</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    {(peers.this_project?.cost_overrun_pct || 0).toFixed(1)}%
                  </span>
                  <span>{(peers.peer_group?.avg_cost_overrun_pct || 0).toFixed(1)}%</span>
                </div>
                <div className="peer-row">
                  <span>Schedule Delay</span>
                  <span>{peers.this_project?.schedule_delay_months} months</span>
                  <span>{peers.peer_group?.avg_schedule_delay_months} months</span>
                </div>
                <div className="peer-row">
                  <span>Risk Score</span>
                  <span style={{ color: bandColor, fontWeight: 700 }}>{peers.this_project?.risk_score?.toFixed(1)}</span>
                  <span>{peers.peer_group?.avg_risk_score?.toFixed(1)}</span>
                </div>
              </div>
            </section>
          )}

          {/* AI Assessment */}
          {(project.ai_assessment || project.analytics?.ai_assessment) && (
            <section className="drawer-section">
              <div className="section-title">🧠 AI Assessment</div>
              <div className="ai-text">{project.ai_assessment || project.analytics?.ai_assessment}</div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

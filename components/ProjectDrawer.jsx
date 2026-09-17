'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, Calendar, AlertTriangle, Cpu, DollarSign, Activity } from 'lucide-react';
import { cleanState, fmtCr } from '@/lib/api';
import Mascot from './Mascot';
import WhatIfSimulator from './WhatIfSimulator';

function getRiskColors(band) {
  switch (band) {
    case 'Critical':
      return { text: '#cd4239', bg: '#f7d6d3', border: 'rgba(205, 66, 57, 0.4)' };
    case 'High':
      return { text: '#e06a14', bg: '#fae4d7', border: 'rgba(224, 106, 20, 0.4)' };
    case 'Medium':
      return { text: '#c49206', bg: '#fbf4d7', border: 'rgba(196, 146, 6, 0.4)' };
    case 'Low':
    default:
      return { text: '#2c8c66', bg: '#d9eddf', border: 'rgba(44, 140, 102, 0.4)' };
  }
}

function RiskBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="risk-bar-row">
      <span className="risk-bar-label">{label}</span>
      <div className="risk-bar-track">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="risk-bar-val">{value.toFixed(1)} / {max}</span>
    </div>
  );
}

function ProbMeter({ label, pct, icon: Icon }) {
  const isHigh = pct >= 15;
  const isMed = pct >= 7;
  const color = isHigh ? '#cd4239' : isMed ? '#e06a14' : '#2c8c66';
  const bg = isHigh ? '#f7d6d3' : isMed ? '#fae4d7' : '#d9eddf';

  return (
    <div className="prob-meter-card">
      <div className="prob-meter-header">
        <div className="prob-meter-icon" style={{ color, backgroundColor: bg }}>
          <Icon size={16} />
        </div>
        <span className="prob-meter-title">{label}</span>
      </div>
      <div className="prob-meter-value" style={{ color }}>
        {pct != null ? `${pct.toFixed(1)}%` : '—'}
      </div>
      <div className="progress-bar-wrap mt-2">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min((pct || 0) * 3.5, 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="prob-meter-caption" style={{ color }}>
        {isHigh ? '⚠️ High likelihood next month' : isMed ? '⚡ Elevated probability' : '✅ Low probability window'}
      </div>
    </div>
  );
}

export default function ProjectDrawer({ project, onClose, peers }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project || !mounted) return null;

  const colors = getRiskColors(project.risk_band);
  const overrunCr = Math.max(0, (project.revised_cost_cr || 0) - (project.original_cost_cr || 0));
  const overrunPct = project.original_cost_cr > 0
    ? ((overrunCr / project.original_cost_cr) * 100).toFixed(1)
    : '0.0';
  const expendPct = project.revised_cost_cr > 0
    ? (((project.cumulative_expenditure_cr || 0) / project.revised_cost_cr) * 100).toFixed(1)
    : '0.0';
  const stateCleaned = cleanState(project.state);

  // Approximate 5 component risk weights (calibrated to MoSPI formula)
  const costRisk  = Math.min(Math.max(project.cost_overrun_ratio_so_far || 0, 0) / 0.50, 1) * 30;
  const schedRisk = Math.min((project.doc_slip_months_so_far || 0) / 36, 1) * 25;
  const progRisk  = Math.min(Math.max(-(project.progress_gap || 0), 0) / 40, 1) * 20;
  const spendRisk = Math.min(Math.max((expendPct / 100) - (project.physical_progress_pct || 0) / 100, 0) / 0.30, 1) * 15;
  const revRisk   = 10;

  const assessmentText = project.ai_assessment || project.analytics?.ai_assessment ||
    `Risk score is ${project.risk_score?.toFixed(1)}/100 (${project.risk_band} band). Primary driver: ${project.primary_risk_driver}. Cost overrun is +${overrunPct}% with ${project.doc_slip_months_so_far} months schedule delay.`;

  return createPortal(
    <div className="drawer-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <aside className="drawer-panel" aria-label="Project Deep-Dive Drawer">
        {/* Drawer Header */}
        <div className="drawer-header" style={{ borderTop: `4px solid ${colors.text}` }}>
          <div className="drawer-header-left">
            <div className="drawer-eyebrow">
              <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
                {project.risk_band} Risk
              </span>
              <span className="drawer-code mono">#{project.project_code}</span>
            </div>
            <h2 className="drawer-project-title">{project.project_name}</h2>
            <div className="drawer-meta-line">
              <strong>{project.ministry}</strong> · {stateCleaned} · {project.agency?.replace(/[()]/g, '').trim()}
            </div>
          </div>

          <button className="drawer-close-btn btn btn-ghost btn-sm" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-content">
          {/* Section: AI Assessment Callout Banner */}
          <section className="drawer-section">
            <div className={`callout ${project.risk_band === 'Critical' || project.risk_band === 'High' ? 'callout-red' : 'callout-blue'}`}>
              <span className="callout-icon">
                {project.risk_band === 'Critical' || project.risk_band === 'High' ? '⚠️' : '💡'}
              </span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {project.risk_band === 'Critical' || project.risk_band === 'High'
                    ? 'Priority Executive Intervention Recommended'
                    : 'System Intelligence Diagnostic'}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{assessmentText}</div>
              </div>
            </div>
          </section>

          {/* Section: Financial Snapshot */}
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <DollarSign size={15} />
              <span>Financial Snapshot & Escalation</span>
            </div>
            <div className="fin-cards-grid">
              <div className="fin-tile">
                <span className="fin-tile-label">Original Sanction</span>
                <span className="fin-tile-val">{fmtCr(project.original_cost_cr)}</span>
                <span className="fin-tile-sub">Baseline budget</span>
              </div>

              <div className="fin-tile">
                <span className="fin-tile-label">Current Revised Cost</span>
                <span className="fin-tile-val" style={{ color: overrunCr > 0 ? 'var(--risk-critical)' : 'var(--ink)' }}>
                  {fmtCr(project.revised_cost_cr)}
                </span>
                {overrunCr > 0 ? (
                  <span className="fin-overrun-pill">
                    +{fmtCr(overrunCr)} (+{overrunPct}%)
                  </span>
                ) : (
                  <span className="fin-tile-sub">Within estimate</span>
                )}
              </div>

              <div className="fin-tile">
                <span className="fin-tile-label">Cumulative Expenditure</span>
                <span className="fin-tile-val">{fmtCr(project.cumulative_expenditure_cr)}</span>
                <span className="fin-tile-sub">{expendPct}% utilized</span>
              </div>
            </div>
          </section>

          {/* Section: Risk Score Breakdown */}
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <Activity size={15} />
              <span>Composite Risk Architecture (0–100)</span>
            </div>

            <div className="score-composite-wrap">
              {/* Circular Gauge */}
              <div className="score-gauge-box">
                <svg viewBox="0 0 100 100" className="score-svg">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-soft)" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={colors.text}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${((project.risk_score || 0) / 100) * 264} 264`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                </svg>
                <div className="score-gauge-content">
                  <span className="score-num" style={{ color: colors.text }}>
                    {project.risk_score?.toFixed(1) || '—'}
                  </span>
                  <span className="score-scale">/ 100</span>
                </div>
              </div>

              {/* 5 Component Bars */}
              <div className="score-bars-box flex-col gap-2">
                <RiskBar label="Cost Escalation" value={costRisk} max={30} color="var(--risk-critical)" />
                <RiskBar label="Schedule Delay" value={schedRisk} max={25} color="var(--risk-high)" />
                <RiskBar label="Slow Progress" value={progRisk} max={20} color="var(--risk-medium)" />
                <RiskBar label="Excess Spend" value={spendRisk} max={15} color="var(--link-teal)" />
                <RiskBar label="Revisions" value={revRisk} max={10} color="var(--mute)" />

                <div className="primary-driver-box">
                  <span className="driver-caption">Primary Risk Driver:</span>
                  <span className="driver-name-chip">{project.primary_risk_driver}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Schedule Status & Timeline */}
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <Calendar size={15} />
              <span>Schedule Telemetry & Delays</span>
            </div>

            <div className="grid-3 schedule-grid">
              <div className="schedule-tile">
                <div className="sched-lbl">Physical Progress</div>
                <div className="sched-num">{project.physical_progress_pct?.toFixed(1)}%</div>
                <div className="progress-bar-wrap mt-2">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${project.physical_progress_pct || 0}%`, backgroundColor: colors.text }}
                  />
                </div>
              </div>

              <div className="schedule-tile">
                <div className="sched-lbl">Schedule Delay</div>
                <div className="sched-num" style={{ color: project.doc_slip_months_so_far > 12 ? 'var(--risk-critical)' : 'var(--ink)' }}>
                  {project.doc_slip_months_so_far || 0} mos
                </div>
                <div className="sched-sub">
                  {project.doc_slip_months_so_far > 0
                    ? `~${(project.doc_slip_months_so_far / 12).toFixed(1)} yrs behind DOC`
                    : 'Target maintained'}
                </div>
              </div>

              <div className="schedule-tile">
                <div className="sched-lbl">Progress Gap</div>
                <div className="sched-num" style={{ color: (project.progress_gap || 0) < -10 ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
                  {(project.progress_gap || 0).toFixed(1)}%
                </div>
                <div className="sched-sub">vs expected curve</div>
              </div>
            </div>
          </section>

          {/* Section: ML Early Warning Probabilities */}
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <Cpu size={15} />
              <span>AI Early Warning (Next Month Probabilities)</span>
            </div>

            <div className="grid-2 prob-meters-grid">
              <ProbMeter
                label="Cost Escalation Risk"
                pct={project.cost_revised_up_risk_pct}
                icon={TrendingUp}
              />
              <ProbMeter
                label="Schedule Slip Risk"
                pct={project.schedule_slipped_risk_pct}
                icon={Calendar}
              />
            </div>

            <div className="ml-model-note">
              <span>Model: Gradient Boosting Classifier · ROC-AUC 0.886 (Cost) · 0.802 (Schedule) · Trained on 7,497 monthly records</span>
            </div>
          </section>

          {/* Section: Live What-If Stress-Testing */}
          <section className="drawer-section">
            <WhatIfSimulator project={project} />
          </section>

          {/* Section: Peer Comparison */}
          {peers && peers.peer_group?.count > 0 && (
            <section className="drawer-section">
              <div className="drawer-section-heading">
                <span>Peer Cohort Benchmark ({peers.peer_group.count} Projects in {stateCleaned})</span>
              </div>

              {peers.peer_insight && (
                <div className="callout callout-blue mb-4">
                  <span className="callout-icon">💡</span>
                  <div style={{ fontSize: 13.5 }}>{peers.peer_insight}</div>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>This Project</th>
                      <th>Cohort Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="strong">Cost Overrun Ratio</td>
                      <td style={{ color: 'var(--risk-critical)', fontWeight: 700 }}>
                        +{(peers.this_project?.cost_overrun_pct || 0).toFixed(1)}%
                      </td>
                      <td className="muted">{(peers.peer_group?.avg_cost_overrun_pct || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="strong">Schedule Delay</td>
                      <td style={{ fontWeight: 700 }}>{peers.this_project?.schedule_delay_months || 0} mos</td>
                      <td className="muted">{peers.peer_group?.avg_schedule_delay_months?.toFixed(1)} mos</td>
                    </tr>
                    <tr>
                      <td className="strong">Composite Risk Score</td>
                      <td style={{ color: colors.text, fontWeight: 800 }}>
                        {peers.this_project?.risk_score?.toFixed(1)}
                      </td>
                      <td className="muted">{peers.peer_group?.avg_risk_score?.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}

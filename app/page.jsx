'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Building2, AlertTriangle, TrendingUp, Wallet, Activity, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api, fmtCr, riskColor, cleanState } from '@/lib/api';
import KpiCard from '@/components/KpiCard';
import ProjectDrawer from '@/components/ProjectDrawer';
import Mascot from '@/components/Mascot';
import { KpiGridSkeleton, ChartSkeleton } from '@/components/Skeleton';

const RiskDonutChart = dynamic(() => import('@/components/charts/RiskDonutChart'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton-shimmer" style={{ width: 140, height: 140, borderRadius: '50%' }} />
    </div>
  ),
});

const MinistryBarChart = dynamic(() => import('@/components/charts/MinistryBarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={270} />,
});

const RISK_PALETTE = {
  Critical: '#cd4239',
  High:     '#e06a14',
  Medium:   '#c49206',
  Low:      '#2c8c66',
};

export default function Dashboard() {

  const { data: kpis, loading: kLoading } = useApi(api.kpis);
  const { data: alertsData, loading: aLoading } = useApi(() => api.alerts(25));
  const { data: benchData, loading: bLoading } = useApi(api.benchmarks);

  const [selected, setSelected] = useState(null);
  const [peers, setPeers]       = useState(null);


  async function openProject(code) {
    const [proj, peerData] = await Promise.all([
      api.project(code),
      api.peers(code).catch(() => null),
    ]);
    setSelected(proj);
    setPeers(peerData);
  }

  // Derived datasets
  const riskDonut = kpis?.risk_band_counts
    ? Object.entries(kpis.risk_band_counts).map(([name, value]) => ({
        name,
        value,
        fill: RISK_PALETTE[name] || '#6c6e63',
      }))
    : [];

  const driverData = kpis?.primary_risk_drivers
    ? Object.entries(kpis.primary_risk_drivers)
        .map(([name, value]) => ({ name: name.replace('Physical ', ''), value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const ministryData = Array.isArray(benchData)
    ? benchData.slice(0, 8).map(m => ({
        name: m.ministry.replace('Ministry of ', '').replace('Department of ', '').substring(0, 22),
        fullName: m.ministry,
        overrun: m.total_cost_overrun_cr,
        critical: m.critical_count,
        high: m.high_count,
      }))
    : [];

  const overrunPct = kpis && kpis.total_original_cost_cr > 0
    ? (((kpis.total_revised_cost_cr - kpis.total_original_cost_cr) / kpis.total_original_cost_cr) * 100).toFixed(1)
    : '14.4';

  const alerts = Array.isArray(alertsData)
    ? alertsData
    : (alertsData?.projects || alertsData?.data || []);

  return (

    <div className="page-wrapper fade-in">
      {/* ── Top Bento Row: Hero Workbench & ML Baseline Card ── */}
      <div className="bento-hero-grid mb-6">
        <section className="bento-hero-main">
          <div className="hero-eyebrow">
            <span className="neo-badge neo-badge-yellow">NATIONAL INFRASTRUCTURE RADAR</span>
            <span className="hero-meta-tag mono">MoSPI Flash Ingestion · July 2026</span>
          </div>
          
          <div className="hero-headline-wrap">
            <h1 className="hero-title">Infrastructure Risk Command Centre</h1>
            <span className="handwritten-annotation hero-note">
              ✦ 2,059 projects under real-time surveillance
            </span>
          </div>

          <p className="hero-desc">
            Predictive machine learning surveillance across India's central sector infrastructure investments (≥₹150 Cr). 
            Detecting cost escalations and schedule delays before budgetary compounding sets in.
          </p>
        </section>

        <section className="bento-hero-stat">
          <div className="hero-stat-header">
            <Activity size={18} color="var(--ink)" />
            <span className="hero-stat-title">AI Predictive Baseline</span>
          </div>
          <p className="hero-stat-desc">
            Ensemble Gradient Boosted Trees calibrated against historical MoSPI milestones.
          </p>
          <div className="hero-metrics-stack">
            <div className="hero-metric-row">
              <span className="metric-label">Cost Overrun ROC-AUC</span>
              <span className="metric-val mono">0.886</span>
            </div>
            <div className="hero-metric-row">
              <span className="metric-label">Schedule Slip ROC-AUC</span>
              <span className="metric-val mono">0.802</span>
            </div>
            <div className="hero-metric-badge">
              <ShieldCheck size={14} /> Production Certified
            </div>
          </div>
        </section>
      </div>

      {/* ── Section A: Bento KPI Tiles (4-Column Grid) ── */}
      <section className="mb-6">
        {kLoading ? (
          <KpiGridSkeleton />
        ) : kpis && (
          <div className="bento-grid">
            <KpiCard
              icon={<Building2 size={20} />}
              label="Tracked Portfolio"
              value={(kpis.total_projects || 2059).toLocaleString('en-IN')}
              sub="Central Sector Projects (≥₹150 Cr)"
              accentColor="var(--neo-cobalt)"
              pillLabel="Active"
            />
            <KpiCard
              icon={<AlertTriangle size={20} />}
              label="Flagged Projects"
              value={((kpis.risk_band_counts?.High || 0) + (kpis.risk_band_counts?.Critical || 0)).toLocaleString('en-IN')}
              sub={`${kpis.risk_band_counts?.Critical || 13} Critical · ${kpis.risk_band_counts?.High || 171} High risk`}
              accentColor="var(--neo-yellow)"
              bg="var(--neo-yellow-soft)"
              pillLabel="Action Required"
            />
            <KpiCard
              icon={<Wallet size={20} />}
              label="Sanctioned Capital"
              value={fmtCr(kpis.total_revised_cost_cr || 4320000)}
              sub={`Original: ${fmtCr(kpis.total_original_cost_cr || 3908000)}`}
              accentColor="var(--accent-purple)"
            />
            <KpiCard
              icon={<TrendingUp size={20} />}
              label="Net Cost Overrun"
              value={fmtCr(kpis.total_cost_overrun_cr || 563000)}
              sub={`+${overrunPct}% aggregate escalation`}
              accentColor="var(--neo-orange)"
              trend={overrunPct}
            />
          </div>
        )}
      </section>

      {/* ── Section B: Risk Architecture & Primary Drivers (2-Column Bento) ── */}
      <section className="bento-2-col mb-6">
        {/* Risk Band Donut Chart */}
        <div className="bento-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Risk Band Distribution</h2>
              <p className="card-subtitle">Composite 0–100 index classification across portfolio</p>
            </div>
            <span className="neo-badge">2,059 Projects</span>
          </div>

          <div className="donut-container">
            <div className="donut-chart-box">
              <RiskDonutChart data={riskDonut} />
              <div className="donut-center-metric">
                <span className="donut-center-val mono">2,059</span>
                <span className="donut-center-lbl">Projects</span>
              </div>
            </div>

            <div className="donut-legend-box">
              {riskDonut.map(({ name, value, fill }) => {
                const total = kpis?.total_projects || 2059;
                const pct = ((value / total) * 100).toFixed(1);
                return (
                  <div key={name} className="donut-legend-row">
                    <span className="legend-indicator" style={{ backgroundColor: fill }} />
                    <span className="legend-name">{name}</span>
                    <span className="legend-count mono">{value.toLocaleString('en-IN')}</span>
                    <span className="legend-share mono">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary Risk Drivers */}
        <div className="bento-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Primary Escalation Drivers</h2>
              <p className="card-subtitle">Root-cause attribution per individual project</p>
            </div>
            <span className="neo-badge">5 Domains</span>
          </div>

          <div className="driver-list">
            {driverData.map(({ name, value }, i) => {
              const maxVal = driverData[0]?.value || 1;
              const barPct = (value / maxVal) * 100;
              const barColors = [
                'var(--neo-red)',
                'var(--neo-orange)',
                'var(--neo-yellow)',
                'var(--neo-cobalt)',
                '#94A3B8',
              ];
              return (
                <div key={name} className="driver-item-card">
                  <div className="driver-item-header">
                    <span className="driver-item-name">{name}</span>
                    <span className="driver-item-count mono">{value.toLocaleString('en-IN')} projects</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: barColors[i % barColors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section C: Ministry Cost Overrun Ranking ────────── */}
      <section className="bento-card mb-6">
        <div className="card-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="card-title">Ministry Cost Overrun Ranking</h2>
              <span className="handwritten-annotation text-sm">✦ Top budget escalations</span>
            </div>
            <p className="card-subtitle">Top central ministries by total capital cost escalation (₹ Cr)</p>
          </div>
          <span className="neo-badge neo-badge-cobalt">17 Portfolios</span>
        </div>

        <div className="ministry-chart-container">
          <MinistryBarChart data={ministryData} height={270} />
        </div>
      </section>

      {/* ── Section D: Priority Early Warning Alert Feed ────────────── */}
      <section className="bento-card mb-6">
        <div className="card-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="card-title">Priority Early Warning Alert Feed</h2>
              <span className="handwritten-annotation text-sm">✦ Click any project to open drawer</span>
            </div>
            <p className="card-subtitle">Critical and High-risk projects requiring active ministerial intervention</p>
          </div>
          <span className="neo-badge neo-badge-red">
            {alertsData?.total_alerts || alerts.length} Priority Flagged
          </span>
        </div>

        {/* Warning Callout Banner (Neo-brutalist callout) */}
        <div className="neo-callout mb-4">
          <span className="callout-icon">⚠️</span>
          <div className="callout-text">
            <strong>184 projects currently breach high-risk thresholds</strong> across cost revision and delay metrics.
            Select any project row to view complete financial breakdown, schedule slips, peer variance, and AI predictive trajectories.
          </div>
        </div>

        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Project Name & Ministry</th>
                <th>State</th>
                <th>Risk Score</th>
                <th>Cost Overrun</th>
                <th>Delay</th>
                <th>Cost↑ ML Risk</th>
                <th>Sched↑ ML Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {aLoading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8}>
                        <div className="skeleton-shimmer" style={{ height: 28, borderRadius: 6 }} />
                      </td>
                    </tr>
                  ))
                : alerts.slice(0, 15).map(p => (
                    <tr key={p.project_code} onClick={() => openProject(p.project_code)}>
                      <td>
                        <div className="project-row-primary">
                          <span className={`badge badge-${p.risk_band?.toLowerCase()}`}>
                            {p.risk_band}
                          </span>
                          <div className="project-row-text">
                            <div className="proj-cell-name truncate" style={{ maxWidth: 290 }}>
                              {p.project_name}
                            </div>
                            <div className="project-sub-meta">
                              <span className="mono">#{p.project_code}</span> · {p.ministry?.replace('Ministry of ', '')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="muted">{cleanState(p.state)}</td>

                      <td>
                        <span
                          className="risk-score-display mono"
                          style={{ color: riskColor(p.risk_band) }}
                        >
                          {p.risk_score?.toFixed(1)}
                        </span>
                      </td>

                      <td
                        style={{
                          color: (p.cost_overrun_ratio_so_far || 0) > 0.4 ? 'var(--neo-red)' : 'var(--ink)',
                          fontWeight: 700,
                        }}
                      >
                        +{((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                      </td>

                      <td className="mono">{p.doc_slip_months_so_far} mos</td>

                      <td>
                        <span
                          className="prob-chip"
                          style={{
                            color: p.cost_revised_up_risk_pct >= 10 ? 'var(--neo-red)' : p.cost_revised_up_risk_pct >= 5 ? 'var(--neo-orange)' : 'var(--neo-mint)',
                            backgroundColor: p.cost_revised_up_risk_pct >= 10 ? 'var(--risk-critical-bg)' : p.cost_revised_up_risk_pct >= 5 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                          }}
                        >
                          {p.cost_revised_up_risk_pct?.toFixed(1)}%
                        </span>
                      </td>

                      <td>
                        <span
                          className="prob-chip"
                          style={{
                            color: p.schedule_slipped_risk_pct >= 20 ? 'var(--neo-red)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--neo-orange)' : 'var(--neo-mint)',
                            backgroundColor: p.schedule_slipped_risk_pct >= 20 ? 'var(--risk-critical-bg)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                          }}
                        >
                          {p.schedule_slipped_risk_pct?.toFixed(1)}%
                        </span>
                      </td>

                      <td>
                        <ChevronRight size={18} color="var(--ink)" />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Slide-in Project Drawer ────────────────────────── */}
      {selected && (
        <ProjectDrawer
          project={selected}
          peers={peers}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}


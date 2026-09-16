import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Building2, AlertTriangle, TrendingUp, Wallet, Activity, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, fmtCr, riskColor, cleanState } from '../api';
import KpiCard from '../components/KpiCard';
import ProjectDrawer from '../components/ProjectDrawer';
import Mascot from '../components/Mascot';
import './Dashboard.css';

const RISK_PALETTE = {
  Critical: '#cd4239',
  High:     '#e06a14',
  Medium:   '#c49206',
  Low:      '#2c8c66',
};

// Custom Tooltip for Donut Chart (Flat white card on cream)
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-title">{data.name} Risk Band</div>
      <div className="tooltip-value" style={{ color: data.payload.fill || 'var(--ink)' }}>
        {data.value?.toLocaleString('en-IN')} Projects
      </div>
    </div>
  );
};

// Custom Tooltip for Ministry Bar Chart
const MinistryTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-title">{p.payload.fullName || label}</div>
      <div className="tooltip-value" style={{ color: 'var(--ink)' }}>
        ₹{(p.value / 100000).toFixed(2)} Lakh Cr Overrun
      </div>
      <div className="tooltip-sub">
        Critical: <strong style={{ color: 'var(--risk-critical)' }}>{p.payload.critical}</strong> · High: <strong style={{ color: 'var(--risk-high)' }}>{p.payload.high}</strong>
      </div>
    </div>
  );
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
      {/* ── Hero Vignette Strip (Editorial Notebook style) ── */}
      <section className="dashboard-hero-card">
        <div className="hero-left">
          <div className="hero-mascot-container">
            <Mascot pose="hardhat" size={54} />
          </div>
          <div className="hero-typography">
            <div className="hero-eyebrow">
              <span className="hero-badge">NATIONAL INFRASTRUCTURE RADAR</span>
              <span className="hero-date">MoSPI Flash Ingestion · July 2026</span>
            </div>
            <h1 className="hero-title">Infrastructure Risk Command Centre</h1>
            <p className="hero-desc">
              Predictive surveillance and machine learning early warnings across India's <strong>2,059</strong> central sector
              infrastructure investments (≥₹150 Cr). Identifying cost escalations and schedule slips before they compound.
            </p>
          </div>
        </div>

        <div className="hero-model-pill" title="Machine learning model accuracy benchmark">
          <div className="model-pill-header">
            <Activity size={15} color="var(--primary)" />
            <span>AI Predictive Baseline</span>
          </div>
          <div className="model-pill-metrics">
            <span>Cost ROC-AUC: <strong>0.886</strong></span>
            <span className="pill-dot">·</span>
            <span>Schedule ROC-AUC: <strong>0.802</strong></span>
          </div>
        </div>
      </section>

      {/* ── Section A: KPI Strip (4 White Cards on Cream) ── */}
      <section className="kpi-grid mt-6">
        {kLoading ? (
          <div className="grid-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 115 }} />
            ))}
          </div>
        ) : kpis && (
          <div className="grid-4">
            <KpiCard
              icon={<Building2 size={20} />}
              label="Tracked Portfolio"
              value={(kpis.total_projects || 2059).toLocaleString('en-IN')}
              sub="Central Sector Projects (≥₹150 Cr)"
              accentColor="var(--link-teal)"
            />
            <KpiCard
              icon={<AlertTriangle size={20} />}
              label="Flagged Projects"
              value={((kpis.risk_band_counts?.High || 0) + (kpis.risk_band_counts?.Critical || 0)).toLocaleString('en-IN')}
              sub={`${kpis.risk_band_counts?.Critical || 13} Critical · ${kpis.risk_band_counts?.High || 171} High risk`}
              accentColor="var(--risk-critical)"
              pillLabel="Action Required"
            />
            <KpiCard
              icon={<Wallet size={20} />}
              label="Sanctioned Capital"
              value={fmtCr(kpis.total_revised_cost_cr || 4320000)}
              sub={`Original: ${fmtCr(kpis.total_original_cost_cr || 3908000)}`}
              accentColor="var(--ink)"
            />
            <KpiCard
              icon={<TrendingUp size={20} />}
              label="Net Cost Overrun"
              value={fmtCr(kpis.total_cost_overrun_cr || 563000)}
              sub={`+${overrunPct}% aggregate escalation`}
              accentColor="var(--risk-high)"
              trend={overrunPct}
            />
          </div>
        )}
      </section>

      {/* ── Section B: Risk Architecture & Primary Drivers ── */}
      <section className="grid-2 mt-6">
        {/* Risk Band Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Risk Band Distribution</span>
              <p className="card-subtitle">Composite 0–100 index classification</p>
            </div>
            <span className="card-badge">2,059 Projects</span>
          </div>

          <div className="donut-container">
            <div className="donut-chart-box">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={riskDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="var(--surface-card)"
                    strokeWidth={2}
                  >
                    {riskDonut.map(entry => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-metric">
                <span className="donut-center-val">2,059</span>
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
                    <span className="legend-share">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary Risk Drivers */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Primary Escalation Drivers</span>
              <p className="card-subtitle">Root-cause attribution per project</p>
            </div>
            <span className="card-badge">5 Domains</span>
          </div>

          <div className="driver-list flex-col gap-3">
            {driverData.map(({ name, value }, i) => {
              const maxVal = driverData[0]?.value || 1;
              const barPct = (value / maxVal) * 100;
              const barColors = [
                'var(--risk-critical)',
                'var(--risk-high)',
                'var(--risk-medium)',
                'var(--link-teal)',
                'var(--mute)',
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
      <section className="card mt-6">
        <div className="card-header">
          <div>
            <span className="card-title">Ministry Cost Overrun Ranking</span>
            <p className="card-subtitle">Top central ministries by total budget escalation (₹ Cr)</p>
          </div>
          <span className="card-badge">17 Portfolios</span>
        </div>

        <div className="ministry-chart-container">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={ministryData}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => `₹${(v / 100000).toFixed(1)}L Cr`}
                tick={{ fill: 'var(--mute)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
                axisLine={{ stroke: 'var(--hairline)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                axisLine={{ stroke: 'var(--hairline)' }}
                tickLine={false}
              />
              <Tooltip content={<MinistryTooltip />} cursor={{ fill: 'rgba(238, 239, 233, 0.6)' }} />
              <Bar dataKey="overrun" fill="var(--link-teal)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Section D: Early Warning Alert Feed ────────────── */}
      <section className="card mt-6">
        <div className="card-header">
          <div>
            <span className="card-title">Priority Early Warning Alert Feed</span>
            <p className="card-subtitle">Critical and High-risk projects requiring active ministerial intervention</p>
          </div>
          <span
            className="badge badge-critical"
            style={{ fontSize: 12, padding: '3px 10px' }}
          >
            {alertsData?.total_alerts || alerts.length} Priority Flagged
          </span>
        </div>

        {/* Warning Callout Banner (PostHog style callout-red) */}
        <div className="callout callout-red mb-4">
          <span className="callout-icon">⚠️</span>
          <div>
            <strong>184 projects currently breach high-risk thresholds</strong> across cost revision and delay metrics.
            Select any project row to view complete financial breakdown, schedule slips, peer variance, and AI predictive trajectories.
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
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
                        <div className="skeleton" style={{ height: 22 }} />
                      </td>
                    </tr>
                  ))
                : alerts.slice(0, 15).map(p => (
                    <tr key={p.project_code} onClick={() => openProject(p.project_code)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${p.risk_band?.toLowerCase()}`}>
                            {p.risk_band}
                          </span>
                          <span className="strong truncate" style={{ maxWidth: 280 }}>
                            {p.project_name}
                          </span>
                        </div>
                        <div className="project-sub-meta">
                          <span className="mono">#{p.project_code}</span> · {p.ministry?.replace('Ministry of ', '')}
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
                          color: (p.cost_overrun_ratio_so_far || 0) > 0.4 ? 'var(--risk-critical)' : 'var(--ink)',
                          fontWeight: 600,
                        }}
                      >
                        +{((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                      </td>

                      <td className="muted">{p.doc_slip_months_so_far} mos</td>

                      <td>
                        <span
                          className="prob-chip"
                          style={{
                            color: p.cost_revised_up_risk_pct >= 10 ? 'var(--risk-critical)' : p.cost_revised_up_risk_pct >= 5 ? 'var(--risk-high)' : 'var(--risk-low)',
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
                            color: p.schedule_slipped_risk_pct >= 20 ? 'var(--risk-critical)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--risk-high)' : 'var(--risk-low)',
                            backgroundColor: p.schedule_slipped_risk_pct >= 20 ? 'var(--risk-critical-bg)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                          }}
                        >
                          {p.schedule_slipped_risk_pct?.toFixed(1)}%
                        </span>
                      </td>

                      <td>
                        <ChevronRight size={16} color="var(--mute)" />
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

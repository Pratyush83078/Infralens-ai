import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Building2, AlertTriangle, TrendingUp, Wallet, Activity, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, fmtCr, riskColor, cleanState } from '../api';
import KpiCard from '../components/KpiCard';
import ProjectDrawer from '../components/ProjectDrawer';
import './Dashboard.css';

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
      <div style={{ fontWeight: 700 }}>{payload[0].name}</div>
      <div style={{ color: payload[0].fill || 'var(--accent)' }}>{payload[0].value?.toLocaleString('en-IN')} projects</div>
    </div>
  );
};

const MinTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 8, fontSize: 12, maxWidth: 240 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, fontWeight: 600 }}>
          ₹{(p.value / 100000).toFixed(2)}L Cr overrun
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: kpis, loading: kLoading } = useApi(api.kpis);
  const { data: alertsData, loading: aLoading } = useApi(() => api.alerts(20));
  const { data: benchData, loading: bLoading } = useApi(api.benchmarks);

  const [selected, setSelected] = useState(null);
  const [peers, setPeers]       = useState(null);

  async function openProject(code) {
    const [proj, peerData] = await Promise.all([api.project(code), api.peers(code).catch(() => null)]);
    setSelected(proj);
    setPeers(peerData);
  }

  // Derived data
  const riskDonut = kpis ? Object.entries(kpis.risk_band_counts).map(([name, value]) => ({ name, value })) : [];
  const driverData = kpis ? Object.entries(kpis.primary_risk_drivers)
    .map(([name, value]) => ({ name: name.replace('Physical ', ''), value }))
    .sort((a, b) => b.value - a.value) : [];
  const ministryData = Array.isArray(benchData)
    ? benchData.slice(0, 8).map(m => ({
        name: m.ministry.replace('Ministry of ', 'MoF ').replace('Department of ', 'Dept ').substring(0, 28),
        fullName: m.ministry,
        overrun: m.total_cost_overrun_cr,
        critical: m.critical_count,
        high: m.high_count,
      }))
    : [];

  const overrunPct = kpis && kpis.total_original_cost_cr > 0
    ? (((kpis.total_revised_cost_cr - kpis.total_original_cost_cr) / kpis.total_original_cost_cr) * 100).toFixed(1)
    : 0;

  const alerts = Array.isArray(alertsData)
    ? alertsData
    : (alertsData?.projects || alertsData?.data || []);

  return (
    <div className="page-wrapper fade-in">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Infrastructure Risk Command Centre</h1>
          <p className="page-subtitle">
            Real-time AI-powered monitoring of India's central sector infrastructure portfolio · Data: July 2026
          </p>
        </div>
        <div className="model-badge">
          <Activity size={13} />
          <span>ROC-AUC: 0.886 Cost · 0.802 Schedule</span>
        </div>
      </div>

      {/* ── KPI Strip ─────────────────────────────────── */}
      {kLoading ? (
        <div className="grid-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : kpis && (
        <div className="grid-4">
          <KpiCard icon={<Building2 size={20}/>} label="Total Projects"
            value={(kpis.total_projects || 0).toLocaleString('en-IN')}
            sub="Ongoing Central Sector (≥₹150 Cr)"
            color="#818cf8" />
          <KpiCard icon={<AlertTriangle size={20}/>} label="Flagged Projects"
            value={((kpis.risk_band_counts?.High || 0) + (kpis.risk_band_counts?.Critical || 0)).toLocaleString('en-IN')}
            sub={`${kpis.risk_band_counts?.Critical || 0} Critical · ${kpis.risk_band_counts?.High || 0} High`}
            color="#ef4444"
            trend={overrunPct} />
          <KpiCard icon={<Wallet size={20}/>} label="Revised Portfolio"
            value={fmtCr(kpis.total_revised_cost_cr)}
            sub={`Original: ${fmtCr(kpis.total_original_cost_cr)}`}
            color="#22c55e" />
          <KpiCard icon={<TrendingUp size={20}/>} label="Total Cost Overrun"
            value={fmtCr(kpis.total_cost_overrun_cr)}
            sub={`+${overrunPct}% above original estimates`}
            color="#f97316" />
        </div>
      )}

      {/* ── Risk Distribution + Driver Breakdown ─────── */}
      <div className="grid-2 mt-6">
        {/* Donut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Risk Band Distribution</span>
            <span className="card-badge">2,059 projects</span>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskDonut} cx="40%" cy="50%" innerRadius={65} outerRadius={95}
                  dataKey="value" stroke="none">
                  {riskDonut.map(entry => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {riskDonut.map(({ name, value }) => (
                <div key={name} className="legend-row">
                  <span className="legend-dot" style={{ background: RISK_COLORS[name] }} />
                  <span className="legend-label">{name}</span>
                  <span className="legend-val">{value.toLocaleString('en-IN')}</span>
                  <span className="legend-pct">
                    {((value / (kpis?.total_projects || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Primary Risk Drivers</span>
          </div>
          <div className="flex-col gap-3 mt-2">
            {driverData.map(({ name, value }, i) => {
              const max = driverData[0]?.value || 1;
              const pct = (value / max) * 100;
              const colors = ['#ef4444', '#f97316', '#eab308', '#818cf8', '#6b7280'];
              return (
                <div key={name} className="driver-item">
                  <div className="driver-meta">
                    <span className="driver-name">{name}</span>
                    <span className="driver-count">{value.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: colors[i], borderRadius: 99, height: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Ministry Overrun Chart ─────────────────────── */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="card-title">Ministry Cost Overrun Ranking</span>
          <span className="card-badge">17 Ministries</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ministryData} layout="vertical" margin={{ left: 10, right: 40, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `₹${(v / 100000).toFixed(0)}L Cr`}
              tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={150}
              tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<MinTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="overrun" fill="#818cf8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Critical Alert Feed ────────────────────────── */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="card-title">🚨 Early Warning — Critical & High Risk Projects</span>
          <span className="card-badge" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {alertsData?.total_alerts ?? alerts.length} flagged
          </span>
        </div>
        <div className="alert-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>State</th>
                <th>Risk Score</th>
                <th>Overrun</th>
                <th>Delay</th>
                <th>Cost↑ Prob</th>
                <th>Sched↑ Prob</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {aLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 20 }} /></td></tr>
                  ))
                : alerts.slice(0, 15).map(p => (
                    <tr key={p.project_code} onClick={() => openProject(p.project_code)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${p.risk_band?.toLowerCase()}`}>{p.risk_band}</span>
                          <span className="truncate" style={{ maxWidth: 220 }}>{p.project_name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.ministry?.replace('Ministry of ', 'Mo')}
                        </div>
                      </td>
                      <td className="muted">{cleanState(p.state)}</td>
                      <td>
                        <span style={{ color: riskColor(p.risk_band), fontWeight: 800, fontSize: 16 }}>
                          {p.risk_score?.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ color: (p.cost_overrun_ratio_so_far || 0) > 0.5 ? '#ef4444' : 'var(--text)' }}>
                        +{((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="muted">{p.doc_slip_months_so_far}m</td>
                      <td>
                        <span style={{ color: p.cost_revised_up_risk_pct >= 10 ? '#ef4444' : p.cost_revised_up_risk_pct >= 5 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                          {p.cost_revised_up_risk_pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: p.schedule_slipped_risk_pct >= 20 ? '#ef4444' : p.schedule_slipped_risk_pct >= 10 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                          {p.schedule_slipped_risk_pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td><ChevronRight size={14} color="#6b7280"/></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <ProjectDrawer project={selected} peers={peers} onClose={() => setSelected(null)} />}
    </div>
  );
}

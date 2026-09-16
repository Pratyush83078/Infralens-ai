import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api, fmtCr } from '../api';
import './Benchmarks.css';

const TABS = ['Ministry Rankings', 'Top Overrun Projects'];

const MinTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 8, fontSize: 12, maxWidth: 260 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d?.ministry}</div>
      <div>Projects: <strong>{d?.project_count}</strong></div>
      <div>Avg Risk: <strong>{d?.avg_risk_score?.toFixed(1)}</strong></div>
      <div>Critical: <strong style={{ color: '#ef4444' }}>{d?.critical_count}</strong> · High: <strong style={{ color: '#f97316' }}>{d?.high_count}</strong></div>
      <div>Overrun: <strong style={{ color: '#818cf8' }}>{fmtCr(d?.total_cost_overrun_cr)}</strong></div>
    </div>
  );
};

export default function Benchmarks() {
  const { data: bench, loading } = useApi(api.benchmarks);
  const [tab, setTab] = useState(0);

  const sorted = bench?.slice(0, 12).map(m => ({
    ...m,
    shortName: m.ministry.replace('Ministry of ', '').replace('Department of ', '').substring(0, 24),
  })) || [];

  // Top overrun projects (from bench data)
  const topOverrun = Array.isArray(bench)
    ? [...bench].sort((a, b) => b.total_cost_overrun_cr - a.total_cost_overrun_cr).slice(0, 15)
    : [];

  const highestRiskMin = Array.isArray(bench) && bench.length > 0
    ? [...bench].sort((a, b) => b.avg_risk_score - a.avg_risk_score)[0]
    : null;

  const mostProjectsMin = Array.isArray(bench) && bench.length > 0
    ? [...bench].sort((a, b) => (b.project_count || b.total_projects || 0) - (a.project_count || a.total_projects || 0))[0]
    : null;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <div>
          <h1>Benchmarks & Comparative Analytics</h1>
          <p className="page-subtitle">Ministry-level performance rankings · Cost overrun · Risk distribution</p>
        </div>
      </div>

      {/* Summary stat cards */}
      {Array.isArray(bench) && bench.length > 0 && !loading && (
        <div className="grid-3 mb-4">
          {[
            { label: 'Ministry with Highest Overrun', val: bench[0]?.ministry?.replace('Ministry of ',''), sub: fmtCr(bench[0]?.total_cost_overrun_cr) + ' overrun', color: '#ef4444' },
            { label: 'Ministry with Highest Avg Risk', val: highestRiskMin?.ministry?.replace('Ministry of ','').replace('Department of ',''), sub: 'Avg score: ' + highestRiskMin?.avg_risk_score?.toFixed(1), color: '#f97316' },
            { label: 'Most Projects', val: mostProjectsMin?.ministry?.replace('Ministry of ',''), sub: (mostProjectsMin?.project_count || mostProjectsMin?.total_projects || 0) + ' projects', color: '#818cf8' },
          ].map(c => (
            <div key={c.label} className="card">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs mb-4">
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="flex-col gap-6">
          {/* Overrun bar chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Total Cost Overrun by Ministry (₹ Cr)</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 60, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="shortName" width={160}
                  tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<MinTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total_cost_overrun_cr" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ministry table */}
          <div className="card">
            <div className="card-header"><span className="card-title">Ministry Detailed Rankings</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ministry / Department</th>
                    <th>Projects</th>
                    <th>Avg Risk</th>
                    <th>Critical</th>
                    <th>High</th>
                    <th>Total Overrun</th>
                    <th>Avg Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(8)].map((_,i) => <tr key={i}><td colSpan={8}><div className="skeleton" style={{height:18}}/></td></tr>)
                    : bench?.map((m, i) => (
                        <tr key={m.ministry}>
                          <td className="muted">{i + 1}</td>
                          <td style={{ fontWeight: 500 }}>{m.ministry.replace('Ministry of ','').replace('Department of ','')}</td>
                          <td className="muted">{m.project_count || m.total_projects}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: m.avg_risk_score > 40 ? '#f97316' : m.avg_risk_score > 30 ? '#eab308' : '#22c55e' }}>
                              {m.avg_risk_score?.toFixed(1)}
                            </span>
                          </td>
                          <td>
                            {m.critical_count > 0
                              ? <span style={{ color: '#ef4444', fontWeight: 700 }}>{m.critical_count}</span>
                              : <span className="muted">—</span>}
                          </td>
                          <td>
                            {m.high_count > 0
                              ? <span style={{ color: '#f97316', fontWeight: 700 }}>{m.high_count}</span>
                              : <span className="muted">—</span>}
                          </td>
                          <td style={{ color: '#818cf8', fontWeight: 600 }}>{fmtCr(m.total_cost_overrun_cr)}</td>
                          <td className="muted">{m.avg_delay_months?.toFixed(0)}m</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Ministry Rankings by Total Cost Overrun</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Ministry</th><th>Projects</th>
                  <th>Total Overrun ₹Cr</th><th>Avg Risk Score</th><th>Critical</th>
                </tr>
              </thead>
              <tbody>
                {topOverrun.map((m, i) => (
                  <tr key={m.ministry}>
                    <td className="muted">{i + 1}</td>
                    <td style={{ fontWeight: 500, maxWidth: 300 }}>{m.ministry}</td>
                    <td className="muted">{m.project_count || m.total_projects}</td>
                    <td style={{ color: '#818cf8', fontWeight: 600 }}>{fmtCr(m.total_cost_overrun_cr)}</td>
                    <td style={{ color: m.avg_risk_score > 35 ? '#f97316' : '#22c55e', fontWeight: 700 }}>{m.avg_risk_score?.toFixed(1)}</td>
                    <td>{m.critical_count > 0
                      ? <span style={{ color: '#ef4444', fontWeight: 700 }}>{m.critical_count}</span>
                      : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

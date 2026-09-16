import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Award, AlertTriangle, Layers, TrendingUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, fmtCr, riskColor } from '../api';
import './Benchmarks.css';

const TABS = ['Ministry Rankings & Telemetry', 'Cost Escalation Leaderboard'];

const BenchmarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-title">{d?.ministry}</div>
      <div className="tooltip-sub">Projects Tracked: <strong>{d?.project_count || d?.total_projects}</strong></div>
      <div className="tooltip-sub">Average Risk Score: <strong>{d?.avg_risk_score?.toFixed(1)}</strong></div>
      <div className="tooltip-sub" style={{ marginTop: 4 }}>
        Critical: <strong style={{ color: 'var(--risk-critical)' }}>{d?.critical_count}</strong> · High: <strong style={{ color: 'var(--risk-high)' }}>{d?.high_count}</strong>
      </div>
      <div className="tooltip-value" style={{ marginTop: 6, color: 'var(--ink)' }}>
        Overrun: {fmtCr(d?.total_cost_overrun_cr)}
      </div>
    </div>
  );
};

export default function Benchmarks() {
  const { data: bench, loading } = useApi(api.benchmarks);
  const [tab, setTab] = useState(0);

  const sorted = bench?.slice(0, 12).map(m => ({
    ...m,
    shortName: m.ministry.replace('Ministry of ', '').replace('Department of ', '').substring(0, 22),
  })) || [];

  const topOverrun = Array.isArray(bench)
    ? [...bench].sort((a, b) => b.total_cost_overrun_cr - a.total_cost_overrun_cr)
    : [];

  const highestRiskMin = Array.isArray(bench) && bench.length > 0
    ? [...bench].sort((a, b) => b.avg_risk_score - a.avg_risk_score)[0]
    : null;

  const mostProjectsMin = Array.isArray(bench) && bench.length > 0
    ? [...bench].sort((a, b) => (b.project_count || b.total_projects || 0) - (a.project_count || a.total_projects || 0))[0]
    : null;

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="benchmarks-header-strip">
        <div className="benchmarks-eyebrow">PORTFOLIO INTELLIGENCE</div>
        <h1 className="benchmarks-title">Ministry Benchmarks & Rankings</h1>
        <p className="benchmarks-subtitle">
          Comparative performance evaluation across 17 Central Government ministries · Identifying systemic delay patterns and cost inflation.
        </p>
      </div>

      {/* Summary Highlight Cards */}
      {Array.isArray(bench) && bench.length > 0 && !loading && (
        <div className="grid-3 mb-6">
          <div className="card benchmark-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label">Highest Budget Overrun</span>
              <div className="stat-card-icon" style={{ color: 'var(--risk-critical)', backgroundColor: 'var(--risk-critical-bg)' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="stat-card-name">{bench[0]?.ministry?.replace('Ministry of ', '')}</div>
            <div className="stat-card-highlight" style={{ color: 'var(--risk-critical)' }}>
              {fmtCr(bench[0]?.total_cost_overrun_cr)} overrun
            </div>
            <div className="stat-card-sub">
              {bench[0]?.critical_count} Critical · {bench[0]?.high_count} High-risk projects
            </div>
          </div>

          <div className="card benchmark-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label">Highest Average Risk Score</span>
              <div className="stat-card-icon" style={{ color: 'var(--risk-high)', backgroundColor: 'var(--risk-high-bg)' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="stat-card-name">
              {highestRiskMin?.ministry?.replace('Ministry of ', '').replace('Department of ', '')}
            </div>
            <div className="stat-card-highlight" style={{ color: 'var(--risk-high)' }}>
              {highestRiskMin?.avg_risk_score?.toFixed(1)} / 100 avg
            </div>
            <div className="stat-card-sub">
              {(highestRiskMin?.project_count || highestRiskMin?.total_projects)} ongoing projects tracked
            </div>
          </div>

          <div className="card benchmark-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label">Largest Infrastructure Volume</span>
              <div className="stat-card-icon" style={{ color: 'var(--link-teal)', backgroundColor: 'var(--accent-blue-soft)' }}>
                <Layers size={16} />
              </div>
            </div>
            <div className="stat-card-name">
              {mostProjectsMin?.ministry?.replace('Ministry of ', '')}
            </div>
            <div className="stat-card-highlight" style={{ color: 'var(--ink)' }}>
              {(mostProjectsMin?.project_count || mostProjectsMin?.total_projects)} Projects
            </div>
            <div className="stat-card-sub">
              Overrun: {fmtCr(mostProjectsMin?.total_cost_overrun_cr)}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs (DESIGN.md pill-tab style) */}
      <div className="bench-pill-tabs mb-4">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`pill-tab ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Overview & Detailed Rankings */}
      {tab === 0 && (
        <div className="flex-col gap-6">
          {/* Visual Overrun Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">Cost Overrun by Ministry (₹ Cr)</span>
                <p className="card-subtitle">Aggregated cost escalation above original sanctioned estimates</p>
              </div>
              <span className="card-badge">Top 12 Portfolios</span>
            </div>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted}
                  layout="vertical"
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={v => `₹${(v / 100000).toFixed(1)}L Cr`}
                    tick={{ fill: 'var(--mute)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--hairline)' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={160}
                    tick={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: 'var(--hairline)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<BenchmarkTooltip />} cursor={{ fill: 'rgba(238, 239, 233, 0.6)' }} />
                  <Bar dataKey="total_cost_overrun_cr" fill="var(--link-teal)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="card p-0">
            <div className="card-header" style={{ padding: '16px 20px 12px' }}>
              <div>
                <span className="card-title">Comprehensive Ministry Performance Table</span>
                <p className="card-subtitle">Sorted by total portfolio cost overrun</p>
              </div>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Ministry / Department</th>
                    <th>Projects</th>
                    <th>Avg Risk Score</th>
                    <th>Critical</th>
                    <th>High</th>
                    <th>Total Cost Overrun</th>
                    <th>Avg Schedule Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}>
                          <div className="skeleton" style={{ height: 22 }} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    bench?.map((m, i) => (
                      <tr key={m.ministry}>
                        <td className="muted mono">{i + 1}</td>
                        <td className="strong">
                          {m.ministry.replace('Ministry of ', '').replace('Department of ', '')}
                        </td>
                        <td className="mono">{m.project_count || m.total_projects}</td>
                        <td>
                          <span
                            className="mono"
                            style={{
                              fontWeight: 800,
                              color: m.avg_risk_score > 40 ? 'var(--risk-high)' : m.avg_risk_score > 30 ? 'var(--risk-medium)' : 'var(--risk-low)',
                            }}
                          >
                            {m.avg_risk_score?.toFixed(1)}
                          </span>
                        </td>
                        <td>
                          {m.critical_count > 0 ? (
                            <span className="badge badge-critical">{m.critical_count}</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          {m.high_count > 0 ? (
                            <span className="badge badge-high">{m.high_count}</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--ink)', fontWeight: 700 }}>
                          {fmtCr(m.total_cost_overrun_cr)}
                        </td>
                        <td className="muted mono">{m.avg_delay_months?.toFixed(1)} mos</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Cost Escalation Leaderboard */}
      {tab === 1 && (
        <div className="card p-0">
          <div className="card-header" style={{ padding: '16px 20px 12px' }}>
            <div>
              <span className="card-title">Ministry Overrun Severity Leaderboard</span>
              <p className="card-subtitle">Direct comparison of cumulative fiscal slippage across portfolios</p>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Rank</th>
                  <th>Ministry</th>
                  <th>Projects Tracked</th>
                  <th>Cumulative Overrun</th>
                  <th>Average Risk Score</th>
                  <th>Critical Severity Count</th>
                </tr>
              </thead>
              <tbody>
                {topOverrun.map((m, i) => (
                  <tr key={m.ministry}>
                    <td className="muted mono">{i + 1}</td>
                    <td className="strong">{m.ministry}</td>
                    <td className="mono">{m.project_count || m.total_projects}</td>
                    <td style={{ color: 'var(--risk-critical)', fontWeight: 800 }}>
                      {fmtCr(m.total_cost_overrun_cr)}
                    </td>
                    <td>
                      <span
                        className="mono"
                        style={{
                          fontWeight: 700,
                          color: m.avg_risk_score > 35 ? 'var(--risk-high)' : 'var(--risk-low)',
                        }}
                      >
                        {m.avg_risk_score?.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      {m.critical_count > 0 ? (
                        <span className="badge badge-critical">{m.critical_count} Critical</span>
                      ) : (
                        <span className="muted">0</span>
                      )}
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

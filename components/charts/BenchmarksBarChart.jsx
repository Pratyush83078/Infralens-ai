'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fmtCr } from '@/lib/api';

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

export default function BenchmarksBarChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={v => `₹${(v / 100000).toFixed(1)}L Cr`}
          tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={170}
          tick={{ fill: '#0F172A', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-geist-sans)' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <Tooltip content={<BenchmarkTooltip />} cursor={{ fill: 'rgba(0, 102, 255, 0.04)' }} />
        <Bar 
          dataKey="total_cost_overrun_cr" 
          fill="#0066FF" 
          radius={[0, 4, 4, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function MinistryBarChart({ data, height = 270 }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={v => `₹${(v / 100000).toFixed(1)}L Cr`}
          tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          axisLine={{ stroke: '#000', strokeWidth: 2 }}
          tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tick={{ fill: '#F8FAFC', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)' }}
          axisLine={{ stroke: '#000', strokeWidth: 2 }}
          tickLine={false}
        />
        <Tooltip content={<MinistryTooltip />} cursor={{ fill: 'rgba(255, 213, 0, 0.15)' }} />
        <Bar 
          dataKey="overrun" 
          fill="var(--neo-cobalt)" 
          stroke="#000" 
          strokeWidth={2}
          radius={[0, 6, 6, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function RiskDonutChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="#000"
          strokeWidth={2.5}
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<DonutTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

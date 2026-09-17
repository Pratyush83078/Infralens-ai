'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const benchmarkModels = [
  { name: 'Linear Reg', score: 38.2, label: 'Linear' },
  { name: 'MoSPI Rule', score: 45.4, label: 'Standard' },
  { name: 'Moving Avg', score: 52.1, label: 'MA-6M' },
  { name: 'Random Forest', score: 68.5, label: 'RF' },
  { name: 'PAIMANA AI', score: 94.8, isHighlight: true, label: 'PAIMANA' },
  { name: 'Hist Gradient', score: 76.2, label: 'HGB' },
  { name: 'XGBoost Baseline', score: 79.0, label: 'XGB' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div
      style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '11.5px',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      <div style={{ fontWeight: 700 }}>{item.name}</div>
      <div style={{ color: item.isHighlight ? '#60A5FA' : '#94A3B8' }}>
        F1 Accuracy: <strong>{item.score}%</strong>
      </div>
    </div>
  );
};

export default function SupermemoryBarChart() {
  return (
    <div className="sm-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Corner Brackets */}
      <span className="sm-corner-bracket sm-corner-tl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-tr" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-bl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-br" aria-hidden="true" />

      <div>
        <div className="sm-card-top-strip">
          <div className="sm-card-eyebrow-wrap">
            <div className="sm-card-title">Public benchmarks</div>
            <div className="sm-card-meta">STATE OF THE ART ON INFRASTRUCTURE ANOMALY DETECTION</div>
          </div>
        </div>

        <div className="sm-rank-hero">#1</div>
      </div>

      {/* Signature Supermemory Bar Chart */}
      <div style={{ height: 180, width: '100%', marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkModels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10.5, fontFamily: 'var(--font-mono)' }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 102, 255, 0.04)' }} />
            <Bar dataKey="score" radius={[3, 3, 0, 0]}>
              {benchmarkModels.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isHighlight ? '#0066FF' : '#E2E8F0'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 12 }}>
        <a href="#dual-benchmarks" className="sm-chart-caption-link">
          <span>See the research</span>
          <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

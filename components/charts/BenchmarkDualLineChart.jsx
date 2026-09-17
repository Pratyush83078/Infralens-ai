'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const datasetBySector = {
  all: [
    { scale: '10', baseline: 68, paimana: 24, label: '10' },
    { scale: '50', baseline: 64, paimana: 22, label: '50' },
    { scale: '100', baseline: 72, paimana: 25, label: '100' },
    { scale: '250', baseline: 58, paimana: 20, label: '250' },
    { scale: '500', baseline: 82, paimana: 27, label: '500' },
    { scale: '1000', baseline: 95, paimana: 31, label: '1,000' },
    { scale: '2059', baseline: 120, paimana: 34, label: '2,059' },
  ],
  railways: [
    { scale: '10', baseline: 84, paimana: 30, label: '10' },
    { scale: '50', baseline: 78, paimana: 28, label: '50' },
    { scale: '100', baseline: 88, paimana: 32, label: '100' },
    { scale: '250', baseline: 70, paimana: 24, label: '250' },
    { scale: '500', baseline: 98, paimana: 34, label: '500' },
    { scale: '1000', baseline: 110, paimana: 38, label: '1,000' },
    { scale: '2059', baseline: 135, paimana: 42, label: '2,059' },
  ],
  roads: [
    { scale: '10', baseline: 55, paimana: 19, label: '10' },
    { scale: '50', baseline: 52, paimana: 18, label: '50' },
    { scale: '100', baseline: 60, paimana: 21, label: '100' },
    { scale: '250', baseline: 49, paimana: 16, label: '250' },
    { scale: '500', baseline: 71, paimana: 22, label: '500' },
    { scale: '1000', baseline: 84, paimana: 26, label: '1,000' },
    { scale: '2059', baseline: 105, paimana: 29, label: '2,059' },
  ],
  power: [
    { scale: '10', baseline: 74, paimana: 26, label: '10' },
    { scale: '50', baseline: 70, paimana: 23, label: '50' },
    { scale: '100', baseline: 79, paimana: 27, label: '100' },
    { scale: '250', baseline: 64, paimana: 21, label: '250' },
    { scale: '500', baseline: 89, paimana: 29, label: '500' },
    { scale: '1000', baseline: 102, paimana: 33, label: '1,000' },
    { scale: '2059', baseline: 128, paimana: 37, label: '2,059' },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono, monospace)',
        border: '1px solid #334155',
      }}
    >
      <div style={{ color: '#94A3B8', marginBottom: 4 }}>PROJECTS IN CORRIDOR: {label}</div>
      <div style={{ color: '#94A3B8' }}>
        MoSPI Baseline: <strong>₹{payload[0]?.value} Cr</strong>
      </div>
      <div style={{ color: '#60A5FA' }}>
        PAIMANA Model: <strong>₹{payload[1]?.value} Cr</strong>
      </div>
    </div>
  );
};

export default function BenchmarkDualLineChart() {
  const [filter, setFilter] = useState('all');
  const data = datasetBySector[filter] || datasetBySector.all;

  return (
    <div className="sm-bench-box">
      {/* Corner Brackets */}
      <span className="sm-corner-bracket sm-corner-tl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-tr" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-bl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-br" aria-hidden="true" />

      {/* Metrics Row */}
      <div className="sm-bench-metrics-row">
        <div className="sm-bench-metric-col">
          <span className="sm-bench-metric-lbl">COST OVERRUN PER PROJECT</span>
          <span className="sm-bench-metric-val">₹24.2 Cr</span>
          <span className="sm-bench-metric-delta">64% less than ₹68.4 Cr standard</span>
        </div>

        <div className="sm-bench-metric-col">
          <span className="sm-bench-metric-lbl">EARLY ANOMALIES RESOLVED</span>
          <span className="sm-bench-metric-val">81%</span>
          <span className="sm-bench-metric-delta">up from 45% standard declaration</span>
        </div>
      </div>

      {/* Filter and Legend Toolbar */}
      <div className="sm-bench-toolbar">
        <div className="sm-bench-legend">
          <div className="sm-legend-item">
            <span className="sm-legend-dot" style={{ backgroundColor: '#94A3B8' }} />
            <span>MoSPI Baseline</span>
          </div>
          <div className="sm-legend-item">
            <span className="sm-legend-square" />
            <span style={{ fontWeight: 600, color: 'var(--ink, #0F172A)' }}>paimana model</span>
          </div>
        </div>

        <div className="sm-filter-pills">
          <button
            type="button"
            className={`sm-filter-pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Corridors
          </button>
          <button
            type="button"
            className={`sm-filter-pill-btn ${filter === 'railways' ? 'active' : ''}`}
            onClick={() => setFilter('railways')}
          >
            Railways
          </button>
          <button
            type="button"
            className={`sm-filter-pill-btn ${filter === 'roads' ? 'active' : ''}`}
            onClick={() => setFilter('roads')}
          >
            Roads
          </button>
          <button
            type="button"
            className={`sm-filter-pill-btn ${filter === 'power' ? 'active' : ''}`}
            onClick={() => setFilter('power')}
          >
            Power
          </button>
        </div>
      </div>

      {/* Recharts Dual-Line Chart */}
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tickFormatter={(v) => `₹${v}Cr`}
              tick={{ fill: '#64748B', fontSize: 10.5, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Grey Baseline Line */}
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#94A3B8"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#94A3B8', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            {/* Cobalt Active Line */}
            <Line
              type="monotone"
              dataKey="paimana"
              stroke="#0066FF"
              strokeWidth={2}
              dot={{ r: 3.5, fill: '#0066FF', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#0066FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <a href="#watchlist" className="sm-chart-caption-link">
          <span>The research runs</span>
          <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

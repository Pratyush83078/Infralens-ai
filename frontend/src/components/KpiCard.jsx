import { fmtCr, scoreColor } from '../api';
import './KpiCard.css';

export default function KpiCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className="kpi-card fade-in">
      <div className="kpi-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ color: color || 'var(--text)' }}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      {trend && (
        <div className={`kpi-trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

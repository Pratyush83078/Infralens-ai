import './KpiCard.css';

export default function KpiCard({ icon, label, value, sub, accentColor, trend, pillLabel }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon-wrap" style={{ color: accentColor || 'var(--ink)' }}>
          {icon}
        </div>
        {pillLabel && (
          <span className="kpi-pill-badge" style={{ borderColor: accentColor }}>
            {pillLabel}
          </span>
        )}
        {trend && (
          <span className={`kpi-trend ${Number(trend) > 0 ? 'trend-up' : 'trend-neutral'}`}>
            +{trend}%
          </span>
        )}
      </div>

      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>

      <div className="kpi-accent-bar" style={{ backgroundColor: accentColor || 'var(--hairline)' }} />
    </div>
  );
}

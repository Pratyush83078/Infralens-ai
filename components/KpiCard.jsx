export default function KpiCard({ icon, label, value, sub, accentColor, trend, pillLabel, bg, className = '' }) {
  return (
    <div 
      className={`kpi-card ${className}`} 
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div className="kpi-top">
        <div className="kpi-icon-wrap" style={{ backgroundColor: accentColor || 'var(--surface-cream)' }}>
          {icon}
        </div>
        <div className="kpi-badges">
          {pillLabel && (
            <span className="kpi-pill-badge">
              {pillLabel}
            </span>
          )}
          {trend && (
            <span className={`kpi-trend ${Number(trend) > 0 ? 'trend-up' : 'trend-neutral'}`}>
              +{trend}%
            </span>
          )}
        </div>
      </div>

      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>

      {accentColor && (
        <div className="kpi-accent-bar" style={{ backgroundColor: accentColor }} />
      )}
    </div>
  );
}

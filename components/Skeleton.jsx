export function SkeletonBox({ width = '100%', height = 20, style = {}, className = '' }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="skeleton-kpi-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBox width={40} height={40} style={{ borderRadius: 10 }} />
            <SkeletonBox width={60} height={20} style={{ borderRadius: 999 }} />
          </div>
          <SkeletonBox width="55%" height={14} style={{ marginTop: 8 }} />
          <SkeletonBox width="75%" height={32} style={{ borderRadius: 8 }} />
          <SkeletonBox width="90%" height={12} style={{ marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 240, title = 'Loading Analytics...' }) {
  return (
    <div className="skeleton-card" style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="skeleton-header-row">
          <SkeletonBox width={180} height={22} />
          <SkeletonBox width={80} height={20} style={{ borderRadius: 999 }} />
        </div>
        <SkeletonBox width={260} height={13} style={{ marginBottom: 20 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: height - 120, paddingBottom: 10 }}>
        <SkeletonBox width="14%" height="45%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="75%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="60%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="90%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="50%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="80%" style={{ borderRadius: 6 }} />
        <SkeletonBox width="14%" height="65%" style={{ borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="skeleton-card" style={{ padding: 0 }}>
      <div style={{ padding: '20px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width={220} height={24} />
        <SkeletonBox width={140} height={34} style={{ borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <SkeletonBox width="8%" height={18} />
            <SkeletonBox width="28%" height={18} />
            <SkeletonBox width="20%" height={18} />
            <SkeletonBox width="14%" height={18} />
            <SkeletonBox width="12%" height={18} />
            <SkeletonBox width="10%" height={24} style={{ borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsFeedSkeleton({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <SkeletonBox width="45%" height={18} />
            <SkeletonBox width={70} height={20} style={{ borderRadius: 999 }} />
          </div>
          <SkeletonBox width="70%" height={14} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <SkeletonBox width={90} height={14} />
            <SkeletonBox width={90} height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

import { TableSkeleton } from '@/components/Skeleton';

export default function ProjectsLoading() {
  return (
    <div className="paimana-container" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="skeleton-shimmer" style={{ width: 260, height: 34, marginBottom: 8 }} />
          <div className="skeleton-shimmer" style={{ width: 340, height: 16 }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: 120, height: 36, borderRadius: 12 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: 42, borderRadius: 10 }} />
        <div className="skeleton-shimmer" style={{ width: '20%', height: 42, borderRadius: 10 }} />
        <div className="skeleton-shimmer" style={{ width: '20%', height: 42, borderRadius: 10 }} />
        <div className="skeleton-shimmer" style={{ width: '20%', height: 42, borderRadius: 10 }} />
      </div>

      <TableSkeleton rows={10} />
    </div>
  );
}

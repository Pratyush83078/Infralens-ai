import { ChartSkeleton, TableSkeleton } from '@/components/Skeleton';

export default function BenchmarksLoading() {
  return (
    <div className="paimana-container" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton-shimmer" style={{ width: 280, height: 34, marginBottom: 8 }} />
        <div className="skeleton-shimmer" style={{ width: 360, height: 16 }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <ChartSkeleton height={360} />
      </div>

      <TableSkeleton rows={8} />
    </div>
  );
}

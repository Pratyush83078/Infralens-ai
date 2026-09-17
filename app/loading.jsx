import { KpiGridSkeleton, ChartSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="paimana-container" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="skeleton-shimmer" style={{ width: 240, height: 36, marginBottom: 8 }} />
        <div className="skeleton-shimmer" style={{ width: 380, height: 16 }} />
      </div>

      <KpiGridSkeleton />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <ChartSkeleton height={320} />
        <ChartSkeleton height={320} />
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { getKpis } from '@/lib/dataEngine';

export async function GET() {
  const kpiData = getKpis();
  if (!kpiData || Object.keys(kpiData).length === 0) {
    return NextResponse.json(
      { error: 'KPI data not loaded yet. Run export_for_backend.py first.' },
      { status: 503 }
    );
  }
  return NextResponse.json(kpiData);
}

import { NextResponse } from 'next/server';
import { getMinistryBenchmarks } from '@/lib/dataEngine';

export async function GET() {
  const benchmarks = getMinistryBenchmarks();
  return NextResponse.json(benchmarks);
}

import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/dataEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || 10;
  const alerts = getAlerts(limit);
  return NextResponse.json(alerts);
}

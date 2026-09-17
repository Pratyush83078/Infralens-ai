import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/dataEngine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = {
    search: searchParams.get('search') || '',
    risk_band: searchParams.get('risk_band') || '',
    ministry: searchParams.get('ministry') || '',
    state: searchParams.get('state') || '',
    driver: searchParams.get('driver') || '',
    sort_by: searchParams.get('sort_by') || 'risk_score',
    order: searchParams.get('order') || 'desc',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20
  };

  const result = getProjects(params);
  return NextResponse.json(result);
}

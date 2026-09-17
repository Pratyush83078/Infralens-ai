import { NextResponse } from 'next/server';
import { getFilters } from '@/lib/dataEngine';

export async function GET() {
  const filters = getFilters();
  return NextResponse.json(filters);
}

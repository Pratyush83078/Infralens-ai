import { NextResponse } from 'next/server';
import { getHealth } from '@/lib/dataEngine';

export async function GET() {
  const health = getHealth();
  return NextResponse.json(health);
}

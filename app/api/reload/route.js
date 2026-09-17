import { NextResponse } from 'next/server';
import { reloadData } from '@/lib/dataEngine';

export async function POST() {
  const result = reloadData();
  return NextResponse.json(result);
}

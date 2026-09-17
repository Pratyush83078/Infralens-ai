import { NextResponse } from 'next/server';
import { getProjectPeers } from '@/lib/dataEngine';

export async function GET(request, context) {
  const params = await context.params;
  const code = params?.code;

  if (!code) {
    return NextResponse.json({ error: 'Project code is required.' }, { status: 400 });
  }

  const peersResult = getProjectPeers(code);
  if (!peersResult) {
    return NextResponse.json({ error: `Project '${code}' not found.` }, { status: 404 });
  }

  return NextResponse.json(peersResult);
}

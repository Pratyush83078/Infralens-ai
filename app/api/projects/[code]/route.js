import { NextResponse } from 'next/server';
import { getProjectByCode } from '@/lib/dataEngine';

export async function GET(request, context) {
  const params = await context.params;
  const code = params?.code;

  if (!code) {
    return NextResponse.json({ error: 'Project code is required.' }, { status: 400 });
  }

  const project = getProjectByCode(code);
  if (!project) {
    return NextResponse.json({ error: `Project with code '${code}' not found.` }, { status: 404 });
  }

  return NextResponse.json(project);
}

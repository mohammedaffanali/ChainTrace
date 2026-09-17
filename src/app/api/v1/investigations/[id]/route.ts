import { NextRequest, NextResponse } from 'next/server';
import { getStandaloneCaseById } from '@/lib/standaloneStore';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${BACKEND_URL}/api/v1/investigations/${id}`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Standalone fallback
  }

  const found = getStandaloneCaseById(id);
  if (!found) {
    return NextResponse.json({ detail: 'Investigation case docket not found.' }, { status: 404 });
  }

  return NextResponse.json(found);
}

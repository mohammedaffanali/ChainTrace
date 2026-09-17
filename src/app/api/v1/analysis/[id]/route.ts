import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL}/api/v1/analysis/${id}`, {
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

    return NextResponse.json(
      { code: 'NOT_FOUND', message: `Analysis record ${id} not found.` },
      { status: res.status }
    );
  } catch {
    return NextResponse.json(
      { code: 'BACKEND_OFFLINE', message: 'Backend unreachable.' },
      { status: 503 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const cookieHeader = req.headers.get('cookie') || '';
    const csrfHeader = req.headers.get('x-csrf-token') || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (csrfHeader) {
      headers['X-CSRF-Token'] = csrfHeader;
    }

    const endpoint = body.is_active !== undefined ? `/api/v1/users/${id}/status` : `/api/v1/users/${id}/role`;

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Failed to update officer status' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[api/users/id] Backend unreachable:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { detail: 'User update service unavailable. Please ensure the backend server is running.' },
      { status: 503 }
    );
  }
}

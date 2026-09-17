import { NextRequest, NextResponse } from 'next/server';
import { updateStandaloneOfficer } from '@/lib/standaloneStore';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

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
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Offline fallback
  }

  // Standalone user status/role update fallback
  const updated = updateStandaloneOfficer(id, body);
  if (!updated) {
    return NextResponse.json({ detail: 'Officer not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: updated });
}

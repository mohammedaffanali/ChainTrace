import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';


export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errData.detail || 'Failed to retrieve officer directory' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[api/users] Backend unreachable:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { detail: 'User directory service unavailable. Please ensure the backend server is running.' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Failed to provision officer' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/users] Backend unreachable:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { detail: 'User provisioning service unavailable. Please ensure the backend server is running.' },
      { status: 503 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { badge_id, password } = body;

    // Forward to FastAPI Backend
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: data.detail || 'Authentication failed' },
        { status: backendRes.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 200 });

    // Forward cookies from FastAPI (HTTP-only access, refresh, and CSRF cookies)
    const setCookieHeaders = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
    for (const cookieStr of setCookieHeaders) {
      nextRes.headers.append('Set-Cookie', cookieStr);
    }

    return nextRes;
  } catch (err: unknown) {
    // Fail closed — never grant access when the authentication service is unreachable
    console.error('[auth/login] Backend unreachable:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Authentication service unavailable. Please ensure the backend server is running.' },
      { status: 503 }
    );
  }
}

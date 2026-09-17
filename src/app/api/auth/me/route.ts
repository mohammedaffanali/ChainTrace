import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  // 1. Try FastAPI if connected
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const user = await backendRes.json();
      return NextResponse.json(user);
    }
  } catch {
    // Offline or unreachable
  }

  // 2. Standalone Session Cookie Fallback
  const sessionCookie = req.cookies.get('chaintrace_session')?.value || req.cookies.get('chaintrace_access_token')?.value;
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'));
      if (parsed && (parsed.badge_id || parsed.id)) {
        return NextResponse.json(parsed);
      }
    } catch {
      // Invalid base64 or JSON
    }
  }

  return NextResponse.json({ detail: 'Unauthenticated' }, { status: 401 });
}

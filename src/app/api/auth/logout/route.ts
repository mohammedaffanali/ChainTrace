import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') || '' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Ignore offline backend
  }

  const res = NextResponse.json({ success: true, message: 'Session logged out.' });
  res.cookies.delete('chaintrace_access_token');
  res.cookies.delete('chaintrace_refresh_token');
  res.cookies.delete('chaintrace_csrf_token');
  res.cookies.delete('chaintrace_session');
  return res;
}

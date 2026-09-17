import { NextRequest, NextResponse } from 'next/server';
import { validateStandaloneOfficer } from '@/lib/standaloneStore';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { badge_id, password } = body;

  if (!badge_id || !password) {
    return NextResponse.json(
      { success: false, message: 'Badge ID and Security PIN are required.' },
      { status: 400 }
    );
  }

  // 1. Attempt connection to FastAPI backend if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await backendRes.json().catch(() => ({}));

    if (backendRes.ok) {
      const nextRes = NextResponse.json(data, { status: 200 });

      // Forward cookies from FastAPI (HTTP-only access, refresh, and CSRF cookies)
      const setCookieHeaders = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
      for (const cookieStr of setCookieHeaders) {
        nextRes.headers.append('Set-Cookie', cookieStr);
      }

      // Also set fallback session cookie
      if (data.user) {
        const sessionPayload = Buffer.from(JSON.stringify(data.user)).toString('base64');
        nextRes.cookies.set('chaintrace_session', sessionPayload, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return nextRes;
    } else if (backendRes.status === 401) {
      return NextResponse.json(
        { success: false, message: data.detail || 'Invalid Badge ID or Security PIN.' },
        { status: 401 }
      );
    }
  } catch {
    // Backend unreachable / timeout — proceed seamlessly to Standalone Forensic Auth
  }

  // 2. Standalone Forensic Auth Fallback (For Vercel / Serverless deployments)
  const officer = validateStandaloneOfficer(badge_id, password);

  if (!officer) {
    return NextResponse.json(
      { success: false, message: 'Invalid Investigator Badge ID or Security PIN.' },
      { status: 401 }
    );
  }

  const userPayload = {
    id: officer.id,
    badge_id: officer.badge_id,
    email: officer.email,
    full_name: officer.full_name,
    designation: officer.designation,
    agency: officer.agency,
    role: officer.role,
    is_active: officer.is_active,
  };

  const response = NextResponse.json(
    {
      success: true,
      user: userPayload,
      csrf_token: 'standalone-csrf-token',
      is_offline_fallback: true,
    },
    { status: 200 }
  );

  const sessionToken = Buffer.from(JSON.stringify(userPayload)).toString('base64');
  response.cookies.set('chaintrace_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set('chaintrace_access_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set('chaintrace_csrf_token', 'standalone-csrf-token', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
    });

    if (backendRes.ok) {
      const user = await backendRes.json();
      return NextResponse.json(user);
    }
  } catch {
    // Offline
  }

  return NextResponse.json({ detail: 'Unauthenticated' }, { status: 401 });
}

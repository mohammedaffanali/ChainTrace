import { NextRequest, NextResponse } from 'next/server';
import { getStandaloneOfficers, addStandaloneOfficer } from '@/lib/standaloneStore';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const cookieHeader = req.headers.get('cookie') || '';
    const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json',
      },
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

  // Standalone officer directory fallback
  return NextResponse.json({ users: getStandaloneOfficers() });
}

export async function POST(req: NextRequest) {
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

    const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }
  } catch {
    // Offline fallback
  }

  // Standalone officer creation fallback
  const created = addStandaloneOfficer({
    badge_id: body.badge_id || `LEA-${Math.floor(1000 + Math.random() * 9000)}`,
    email: body.email || 'officer@fiu-ind.gov.in',
    full_name: body.full_name || 'Cyber Investigator',
    designation: body.designation || 'Forensic Specialist',
    agency: body.agency || 'Cyber Crime Division',
    role: body.role || 'INVESTIGATOR',
    is_active: true,
  });

  return NextResponse.json(created, { status: 201 });
}

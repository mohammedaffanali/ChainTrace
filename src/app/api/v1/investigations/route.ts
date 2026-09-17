import { NextRequest, NextResponse } from 'next/server';
import { getStandaloneCases, addStandaloneCase } from '@/lib/standaloneStore';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const res = await fetch(`${BACKEND_URL}/api/v1/investigations${query}`, {
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
  } catch {
    // Standalone fallback
  }

  const allCases = getStandaloneCases();
  const filtered = statusFilter && statusFilter !== 'ALL'
    ? allCases.filter((c) => c.status === statusFilter)
    : allCases;

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${BACKEND_URL}/api/v1/investigations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }
  } catch {
    // Standalone fallback
  }

  const created = addStandaloneCase({
    title: body.title,
    agency: body.agency,
    priority: body.priority,
    totalExposureINR: body.total_exposure_inr ? `${body.total_exposure_inr} INR` : undefined,
    summary: body.summary,
    chains: body.chain ? [body.chain] : ['Ethereum', 'Tron'],
  });

  return NextResponse.json(created, { status: 201 });
}

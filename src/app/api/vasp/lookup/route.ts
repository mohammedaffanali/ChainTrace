/**
 * CHAINTRACE // API Route: POST & GET /api/vasp/lookup
 * Executes provenance-backed VASP address and cluster lookup.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findVaspByAddress } from '@/lib/vasp/lookupService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const address = (body.address || '').trim();
    const chain = (body.chain || 'ethereum').trim();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required for VASP lookup.' },
        { status: 400 }
      );
    }

    const result = await findVaspByAddress(address, chain);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'VASP lookup failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = (searchParams.get('address') || '').trim();
    const chain = (searchParams.get('chain') || 'ethereum').trim();

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required for VASP lookup.' },
        { status: 400 }
      );
    }

    const result = await findVaspByAddress(address, chain);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'VASP lookup failed' },
      { status: 500 }
    );
  }
}

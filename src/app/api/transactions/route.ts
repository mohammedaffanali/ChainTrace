/**
 * CHAINTRACE // API Route: POST & GET /api/transactions
 * Returns normalized blockchain intelligence for a target wallet address.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlockchainService, BlockchainError, BlockchainMode } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const address = (body.address || '').trim();
    const chain = (body.chain || 'ethereum').trim();
    const mode = body.mode as BlockchainMode | undefined;
    const limit = typeof body.limit === 'number' ? body.limit : 25;

    if (!address) {
      return NextResponse.json(
        {
          code: 'INVALID_WALLET',
          message: 'Target address is required in request body.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const result = await BlockchainService.queryAddress({
      address,
      chain,
      mode,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof BlockchainError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }

    const message = (err as Error)?.message || 'An unexpected error occurred';
    return NextResponse.json(
      {
        code: 'PROVIDER_UNAVAILABLE',
        message,
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = (searchParams.get('address') || '').trim();
    const chain = (searchParams.get('chain') || 'ethereum').trim();
    const mode = (searchParams.get('mode') as BlockchainMode) || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 25;

    if (!address) {
      return NextResponse.json(
        {
          code: 'INVALID_WALLET',
          message: 'Target address parameter is required.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const result = await BlockchainService.queryAddress({
      address,
      chain,
      mode,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof BlockchainError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }

    const message = (err as Error)?.message || 'An unexpected error occurred';
    return NextResponse.json(
      {
        code: 'PROVIDER_UNAVAILABLE',
        message,
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

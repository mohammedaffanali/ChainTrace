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

    const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

    // 1. Attempt to query FastAPI backend in live mode
    if (mode !== 'demo') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(`${BACKEND_URL}/api/v1/analysis/wallet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: req.headers.get('cookie') || '',
            authorization: req.headers.get('authorization') || '',
          },
          body: JSON.stringify({
            address,
            network: chain.toLowerCase(),
            limit,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const analysisData = await res.json();
          const txs = analysisData.transactions || [];
          return NextResponse.json(
            {
              mode: 'live',
              chain,
              address,
              balance: analysisData.balance,
              activity: {
                firstSeenTimestamp: txs.length > 0 ? txs[txs.length - 1].timestamp : Math.floor(Date.now() / 1000),
                lastActiveTimestamp: txs.length > 0 ? txs[0].timestamp : Math.floor(Date.now() / 1000),
                totalTransactions: txs.length,
              },
              transactions: txs,
              tokenTransfers: [],
              retrievedAt: analysisData.created_at || new Date().toISOString(),
              isDemonstrationData: false,
              providerInfo: {
                id: 'fastapi-blockchain-provider',
                name: analysisData.data_source || 'Live Blockchain Provider',
                live: true,
              },
              attribution: analysisData.attribution,
              latest_block: analysisData.latest_block,
              graph: analysisData.graph,
            },
            { status: 200 }
          );
        }
      } catch {
        // Fallback to internal service
      }
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

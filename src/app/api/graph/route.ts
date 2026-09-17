import { NextRequest, NextResponse } from 'next/server';
import { buildTransactionGraph } from '@/lib/graph/graphBuilder';
import { BlockchainError } from '@/lib/blockchain/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      address,
      chain = 'ethereum',
      maxHops = 3,
      maxNodes = 40,
      transactionLimit = 20,
      direction = 'outgoing',
      minAmount = 0,
      timeRange,
      mode,
    } = body;

    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json(
        {
          error: 'Missing required field: address',
          code: 'INVALID_WALLET',
        },
        { status: 400 }
      );
    }

    const graph = await buildTransactionGraph(address.trim(), chain, {
      maxHops: Number(maxHops),
      maxNodes: Number(maxNodes),
      transactionLimit: Number(transactionLimit),
      direction,
      minAmount: Number(minAmount),
      timeRange,
      mode,
    });

    return NextResponse.json(graph, { status: 200 });
  } catch (error: any) {
    if (error instanceof BlockchainError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        { status: error.code === 'INVALID_WALLET' || error.code === 'UNSUPPORTED_CHAIN' ? 400 : 500 }
      );
    }

    return NextResponse.json(
      {
        code: 'GRAPH_ERROR',
        message: error?.message || 'Failed to construct transaction graph.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';
  const maxHops = searchParams.get('maxHops') ? Number(searchParams.get('maxHops')) : 3;
  const mode = (searchParams.get('mode') as 'demo' | 'live') || undefined;

  if (!address) {
    return NextResponse.json(
      { error: 'Query parameter "address" is required.', code: 'INVALID_WALLET' },
      { status: 400 }
    );
  }

  try {
    const graph = await buildTransactionGraph(address, chain, {
      maxHops,
      mode,
    });
    return NextResponse.json(graph, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: error.code || 'GRAPH_ERROR',
        message: error?.message || 'Failed to build transaction graph.',
      },
      { status: 500 }
    );
  }
}

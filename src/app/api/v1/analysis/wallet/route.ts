import { NextRequest, NextResponse } from 'next/server';
import { BlockchainService, BlockchainError } from '@/lib/blockchain';
import { buildTransactionGraph } from '@/lib/graph/graphBuilder';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const address = (body.address || '').trim();
  const network = (body.network || body.chain || 'ethereum').trim().toLowerCase();
  const direction = body.direction || 'outgoing';
  const maxHops = typeof body.max_hops === 'number' ? body.max_hops : 3;
  const limit = typeof body.limit === 'number' ? body.limit : 25;
  const caseId = body.case_id || undefined;

  if (!address) {
    return NextResponse.json(
      { code: 'INVALID_WALLET', message: 'Target address is required.' },
      { status: 400 }
    );
  }

  // 1. Attempt to query FastAPI backend as single source of truth
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for live RPC

    const res = await fetch(`${BACKEND_URL}/api/v1/analysis/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        address,
        network,
        direction,
        max_hops: maxHops,
        limit,
        case_id: caseId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 200 });
    }

    // If backend returns explicit 400/422 validation error, return it
    if (res.status === 400 || res.status === 422) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { code: 'INVALID_WALLET', message: errData.detail || 'Validation error' },
        { status: res.status }
      );
    }
  } catch {
    // Backend unreachable or timeout - fall through to local fallback
  }

  // 2. Standalone fallback using Next.js internal BlockchainService & GraphBuilder
  try {
    const queryResult = await BlockchainService.queryAddress({
      address,
      chain: network,
      limit,
    });

    const graphResult = await buildTransactionGraph(address, network, {
      maxHops,
      direction: direction as any,
      transactionLimit: limit,
    });

    const nearestVaspNode = graphResult.nodes.find((n) => n.isNearestVasp);

    const fallbackResponse = {
      analysis_id: `fallback-${Date.now()}`,
      address,
      network,
      balance: queryResult.balance || { balance: '0', symbol: 'ETH', formatted: '0 ETH', fiatValueINR: '₹0' },
      transactions: queryResult.transactions || [],
      graph: {
        nodes: graphResult.nodes,
        edges: graphResult.edges,
        stats: graphResult.stats,
      },
      attribution: {
        nearest_vasp: nearestVaspNode?.label || 'Unknown / Unverified',
        hop_distance: nearestVaspNode ? nearestVaspNode.hopDistance : null,
        confidence_score: nearestVaspNode?.vaspAssociation?.confidence || 0,
        evidence_chain: nearestVaspNode
          ? [
              {
                hop: nearestVaspNode.hopDistance,
                entity: nearestVaspNode.label,
                address: nearestVaspNode.address,
                role: 'Counterparty',
              },
            ]
          : [],
        legal_limitations:
          'Automated graph traversal intelligence; evidentiary verification required under Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023).',
      },
      risk_score: nearestVaspNode ? 35.0 : 85.0,
      data_source: queryResult.providerInfo?.name || 'Local Standalone Engine',
      latest_block: null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  } catch (err: any) {
    if (err instanceof BlockchainError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    return NextResponse.json(
      { code: 'PROVIDER_ERROR', message: err?.message || 'Failed to analyze wallet' },
      { status: 500 }
    );
  }
}

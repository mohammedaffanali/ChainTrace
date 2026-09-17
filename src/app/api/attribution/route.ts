/**
 * CHAINTRACE // API Route: POST /api/attribution
 * Executes full explainable VASP attribution analysis across DEMO or LIVE mode.
 * Pipeline:
 * Wallet validation -> Blockchain retrieval -> Graph construction -> Graph traversal ->
 * VASP candidate discovery -> 7-Signal scoring -> Evidence generation -> Audit logging -> Final result
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runVaspAttributionSimulation,
  runLiveVaspAttribution,
  SupportedChain,
} from '@/lib/attributionService';
import { BlockchainService, BlockchainError, BlockchainMode } from '@/lib/blockchain';
import { globalAuditVault } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const wallet = (body.wallet || body.address || body.walletAddress || '').trim();
    const chain = (body.chain || 'AUTO') as SupportedChain;
    const requestedMode = (body.mode || (body.forceDemo ? 'demo' : undefined)) as BlockchainMode | undefined;
    const caseId = body.caseId;
    const officerName = body.officerName;

    if (!wallet) {
      return NextResponse.json(
        {
          code: 'INVALID_WALLET',
          message: 'Wallet address is required for attribution analysis.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const systemMode = BlockchainService.getSystemMode();
    const effectiveMode = requestedMode || systemMode;

    if (effectiveMode === 'live') {
      const liveResult = await runLiveVaspAttribution(
        wallet,
        chain === 'AUTO' ? 'ethereum' : chain.toLowerCase(),
        { caseId, officerName }
      );

      return NextResponse.json(liveResult, { status: 200 });
    }

    // Default: Isolated DEMO simulation through scoring engine
    const demoResult = runVaspAttributionSimulation(wallet, chain, { caseId, officerName });
    return NextResponse.json(demoResult, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof BlockchainError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }

    const message = (err as Error)?.message || 'Attribution calculation failed';
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
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet') || searchParams.get('address');
  const chain = (searchParams.get('chain') || 'AUTO') as SupportedChain;
  const mode = (searchParams.get('mode') as BlockchainMode) || undefined;

  if (!wallet) {
    return NextResponse.json(
      { error: 'Query parameter "wallet" or "address" is required.', code: 'INVALID_WALLET' },
      { status: 400 }
    );
  }

  try {
    if (mode === 'live') {
      const result = await runLiveVaspAttribution(wallet, chain === 'AUTO' ? 'ethereum' : chain.toLowerCase());
      return NextResponse.json(result, { status: 200 });
    }
    const demoResult = runVaspAttributionSimulation(wallet, chain);
    return NextResponse.json(demoResult, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { code: err.code || 'ATTRIBUTION_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

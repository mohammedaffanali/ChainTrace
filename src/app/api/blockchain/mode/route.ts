/**
 * CHAINTRACE // API Route: GET /api/blockchain/mode
 * Returns system mode (DEMO vs LIVE) and provider availability health.
 */

import { NextResponse } from 'next/server';
import { BlockchainService, SUPPORTED_LIVE_CHAINS } from '@/lib/blockchain';

export async function GET() {
  const mode = BlockchainService.getSystemMode();
  const providers = BlockchainService.getProviderStatuses();

  return NextResponse.json({
    mode,
    isLive: mode === 'live',
    supportedLiveChains: SUPPORTED_LIVE_CHAINS,
    providers,
    serverTime: new Date().toISOString(),
  });
}

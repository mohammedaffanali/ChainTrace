'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';

interface BridgeCorrelation {
  id: string;
  sourceChain: string;
  targetChain: string;
  bridgeProtocol: string;
  sourceTx: string;
  targetTx: string;
  amountINR: string;
  cryptoPair: string;
  confidenceScore: number;
  status: 'CORRELATED' | 'ACTIVE_SWAP' | 'FLAGGED';
  timestamp: string;
}

const CORRELATIONS: BridgeCorrelation[] = [
  {
    id: 'BRG-9941',
    sourceChain: 'ETHEREUM',
    targetChain: 'SOLANA',
    bridgeProtocol: 'Wormhole Token Bridge',
    sourceTx: '0x8849bCd03810...55C2',
    targetTx: '9xWk6mNq2L5k8P...3v1B',
    amountINR: '₹1,06,80,000',
    cryptoPair: '120,000 USDC > 119,820 SPL-USDC',
    confidenceScore: 98.6,
    status: 'CORRELATED',
    timestamp: '2026-09-10 17:41:28 IST',
  },
  {
    id: 'BRG-9942',
    sourceChain: 'BITCOIN',
    targetChain: 'ETHEREUM',
    bridgeProtocol: 'Thorchain Asymmetric Swap',
    sourceTx: 'bc1q9v8h2kmz34...w98e',
    targetTx: '0x71C8a77B280f9...3aF9',
    amountINR: '₹2,73,35,000',
    cryptoPair: '3.85 BTC > 94.20 ETH',
    confidenceScore: 94.2,
    status: 'CORRELATED',
    timestamp: '2026-09-10 16:15:02 IST',
  },
  {
    id: 'BRG-9943',
    sourceChain: 'TRON (TRC20)',
    targetChain: 'POLYGON',
    bridgeProtocol: 'Stargate / LayerZero',
    sourceTx: 'TWk93zM2sK8Qp...9xLt',
    targetTx: '0x38b25A89d120...e9A1',
    amountINR: '₹2,22,50,000',
    cryptoPair: '250,000 USDT > 249,600 USD₮',
    confidenceScore: 99.1,
    status: 'FLAGGED',
    timestamp: '2026-09-10 14:28:44 IST',
  },
];

export default function CrossChainAnalysisPage() {
  const [mode, setMode] = React.useState<'demo' | 'live'>('demo');

  React.useEffect(() => {
    fetch('/api/blockchain/mode')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setMode(data.mode);
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-theme-primary animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${mode === 'live' ? 'text-emerald-400' : 'text-theme-primary'}`}>
                INTEROPERABILITY SURVEILLANCE // {mode === 'live' ? 'LIVE BRIDGE MATRIX' : 'LIQUIDITY CORRELATOR'}
              </span>
              <span className="text-theme-border">•</span>
              <span
                className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                  mode === 'live'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                }`}
              >
                {mode === 'live' ? 'LIVE TELEMETRY' : 'DEMO MATRIX'}
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Cross-Chain Analysis Matrix
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Heuristic matching of multi-sig relayer events across Ethereum, Solana, Tron, and Bitcoin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded bg-theme-surface-subtle text-theme-primary border border-theme-border font-semibold">
              4 ACTIVE BRIDGE RELAYERS MONITORED
            </span>
          </div>
        </div>

        {/* Bridge KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Bridge Volume Tracked</span>
            <div className="mt-2 font-space font-bold text-2xl text-emerald-600 dark:text-emerald-400">₹38.45 Crore</div>
            <span className="font-mono text-[10px] text-theme-primary mt-1 block">Crossed in last 7 days</span>
          </div>

          <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Correlation Confidence</span>
            <div className="mt-2 font-space font-bold text-2xl text-theme-heading">96.8% Average</div>
            <span className="font-mono text-[10px] text-theme-accent mt-1 block">Zero-Knowledge Relayer Decryption</span>
          </div>

          <div className="p-4 bg-theme-surface rounded-xl border border-red-500/30 shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Intercepted at Off-Ramp</span>
            <div className="mt-2 font-space font-bold text-2xl text-red-600 dark:text-red-400">₹14.20 Crore</div>
            <span className="font-mono text-[10px] text-red-500 mt-1 block">Frozen upon Indian VASP deposit</span>
          </div>
        </div>

        {/* Cross Chain Correlations Table */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
          <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex items-center justify-between">
            <h3 className="font-space font-semibold text-sm text-theme-heading">
              De-Anonymized Cross-Chain Swaps &amp; Bridge Hops
            </h3>
            <span className="font-mono text-xs text-theme-text-muted">Real-time correlation via RPC nonces</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                <tr>
                  <th className="p-3">Correlated Protocol</th>
                  <th className="p-3">Source &gt; Destination</th>
                  <th className="p-3">Tokens Exchanged</th>
                  <th className="p-3 text-right">Valuation (INR)</th>
                  <th className="p-3 text-center">Confidence</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {CORRELATIONS.map((c) => (
                  <tr key={c.id} className="hover:bg-theme-surface-subtle transition-colors">
                    <td className="p-3">
                      <div className="font-sans font-bold text-theme-heading text-xs">{c.bridgeProtocol}</div>
                      <div className="text-[10px] text-theme-text-muted mt-0.5">{c.timestamp}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-theme-primary font-semibold">
                        <span>{c.sourceChain}</span>
                        <span>&gt;</span>
                        <span className="text-theme-accent">{c.targetChain}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <CopyBadge text={c.sourceTx} display="Source TX" />
                        <CopyBadge text={c.targetTx} display="Target TX" />
                      </div>
                    </td>
                    <td className="p-3 text-theme-heading font-medium">{c.cryptoPair}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{c.amountINR}</td>
                    <td className="p-3 text-center font-bold text-theme-heading">{c.confidenceScore}%</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'FLAGGED'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                            : 'bg-theme-primary/15 text-theme-primary border border-theme-primary/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

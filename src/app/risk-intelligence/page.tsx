'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';

interface ThreatVector {
  id: string;
  category: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  activeNodes: number;
  totalVolumeINR: string;
  primaryChains: string[];
  description: string;
  mitigationStatus: string;
}

const THREAT_VECTORS: ThreatVector[] = [
  {
    id: 'TV-01',
    category: 'DeFi Autonomous Mixers (Tornado & Railgun)',
    threatLevel: 'CRITICAL',
    activeNodes: 64,
    totalVolumeINR: '₹48,20,00,000',
    primaryChains: ['Ethereum', 'Arbitrum', 'Polygon'],
    description: 'Pool-based cryptographic obfuscation used by cyber syndicates to erase provenance of extortion proceeds.',
    mitigationStatus: 'Automated reverse peel-chain heuristics active',
  },
  {
    id: 'TV-02',
    category: 'P2P Hawala Mule Terminals (Surat/Jaipur/Dubai)',
    threatLevel: 'CRITICAL',
    activeNodes: 142,
    totalVolumeINR: '₹62,40,00,000',
    primaryChains: ['Tron (TRC20)', 'BSC'],
    description: 'Structured cash-in-hand and IMPS/UPI off-ramps settled using USDT without PAN/KYC declarations.',
    mitigationStatus: '18 bank mule clusters frozen under PMLA Sec 5',
  },
  {
    id: 'TV-03',
    category: 'Cross-Chain Decentralized Liquidity Bridges',
    threatLevel: 'HIGH',
    activeNodes: 38,
    totalVolumeINR: '₹29,80,00,000',
    primaryChains: ['Thorchain', 'Wormhole'],
    description: 'Rapid hopping across non-custodial bridges to break chain analysis continuity and jump jurisdictions.',
    mitigationStatus: 'Multi-sig relayer intercept monitoring active',
  },
  {
    id: 'TV-04',
    category: 'Illegal Offshore Betting Escrow Aggregators',
    threatLevel: 'CRITICAL',
    activeNodes: 84,
    totalVolumeINR: '₹76,15,00,000',
    primaryChains: ['Tron', 'Polygon'],
    description: 'Automated USDT settlement pools for Mahadev-style unregistered betting networks operating outside India.',
    mitigationStatus: 'Section 69A domain blocking notices served',
  },
];

export default function RiskIntelligencePage() {
  const [screenerInput, setScreenerInput] = useState('');
  const [screenerResult, setScreenerResult] = useState<string | null>(null);

  const handleScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenerInput.trim()) return;
    setScreenerResult(
      `MATCH FOUND: Address ${screenerInput.slice(0, 10)}... flagged on FIU-IND Priority High-Risk Watchlist. Linked to Hawala Mule Network #TWz55m. Risk Score: 94/100.`
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-mono text-xs text-red-600 dark:text-red-400 uppercase tracking-wider font-semibold">
                NATIONAL CYBER THREAT MATRIX // SANCTIONS RADAR
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Risk Intelligence &amp; Threat Vectors
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Continuous mempool surveillance against darknet mixers, sanctions lists, and unlicensed VDA corridors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-semibold">
              328 CRITICAL TARGETS FLAGGED
            </span>
          </div>
        </div>

        {/* Real-time Watchlist Screener */}
        <div className="bg-theme-surface p-4 rounded-xl border border-theme-border space-y-3 shadow-sm transition-colors">
          <h2 className="font-space font-semibold text-sm text-theme-heading">
            Instant Sanctions &amp; Watchlist Screener (FIU-IND / OFAC / UN)
          </h2>
          <form onSubmit={handleScreen} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                gshield
              </span>
              <input
                type="text"
                value={screenerInput}
                onChange={(e) => setScreenerInput(e.target.value)}
                placeholder="Enter Address, Hash, Entity Name, or Syndicate Tag to screen against sanctions databases..."
                className="w-full h-10 pl-9 pr-3 bg-theme-surface-subtle border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-red-600 hover:bg-red-500 text-white font-space font-semibold text-xs rounded-md transition-colors shadow-sm"
            >
              Screen Target
            </button>
          </form>

          {screenerResult && (
            <div className="p-3 bg-red-500/15 rounded-md border border-red-500/30 text-xs font-mono text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-red-500">warning</span>
              <span>{screenerResult}</span>
            </div>
          )}
        </div>

        {/* Threat Vectors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THREAT_VECTORS.map((tv) => (
            <div
              key={tv.id}
              className="p-5 bg-theme-surface rounded-xl border border-theme-border hover:border-red-500/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">{tv.id}</span>
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    {tv.threatLevel}
                  </span>
                </div>
                <h3 className="font-space font-bold text-base text-theme-heading mt-1">
                  {tv.category}
                </h3>
                <p className="text-xs text-theme-text-secondary mt-1 leading-relaxed">
                  {tv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-theme-border space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">Tracked Volume (INR):</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{tv.totalVolumeINR}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">Active Intercept Nodes:</span>
                  <strong className="text-theme-accent">{tv.activeNodes} Cluster Nodes</strong>
                </div>
                <div className="p-2 bg-theme-surface-secondary rounded text-[11px] text-theme-fg border border-theme-border">
                  Status: <strong className="text-theme-heading">{tv.mitigationStatus}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Geographic Threat Corridor Matrix */}
        <div className="bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 transition-colors">
          <h3 className="font-space font-bold text-base text-theme-heading">
            High-Risk Geographic Flight Corridors (India &amp; Offshore)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-theme-surface-secondary border border-theme-border transition-colors">
              <div className="text-theme-accent font-bold">NCR - DUBAI CORRIDOR</div>
              <div className="text-theme-heading font-medium mt-1">₹42.8 Cr Layered Volume</div>
              <div className="text-theme-text-muted text-[10px] mt-1">P2P Hawala Desks &gt; OTC Escrows</div>
            </div>

            <div className="p-3 rounded bg-theme-surface-secondary border border-theme-border transition-colors">
              <div className="text-amber-500 font-bold">SURAT - CAMBODIA CORRIDOR</div>
              <div className="text-theme-heading font-medium mt-1">₹62.4 Cr Layered Volume</div>
              <div className="text-theme-text-muted text-[10px] mt-1">USDT-TRC20 Task Scam Laundering</div>
            </div>

            <div className="p-3 rounded bg-theme-surface-secondary border border-theme-border transition-colors">
              <div className="text-red-500 font-bold">MUMBAI - SEYCHELLES CORRIDOR</div>
              <div className="text-theme-heading font-medium mt-1">₹76.1 Cr Layered Volume</div>
              <div className="text-theme-text-muted text-[10px] mt-1">Unregistered Offshore Betting Nodes</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

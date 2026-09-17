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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C44536] animate-pulse"></span>
              <span className="font-mono text-xs text-[#C44536] uppercase tracking-wider font-semibold">
                NATIONAL CYBER THREAT MATRIX // SANCTIONS RADAR
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
              Risk Intelligence &amp; Threat Vectors
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Continuous mempool surveillance against darknet mixers, sanctions lists, and unlicensed VDA corridors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40 font-semibold shadow-signal-red">
              328 CRITICAL TARGETS FLAGGED
            </span>
          </div>
        </div>

        {/* Real-time Watchlist Screener */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] space-y-3 shadow-glass-card transition-colors">
          <h2 className="font-space font-semibold text-sm text-[#FAFAF5]">
            Instant Sanctions &amp; Watchlist Screener (FIU-IND / OFAC / UN)
          </h2>
          <form onSubmit={handleScreen} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#74736F] text-[18px]">
                gshield
              </span>
              <input
                type="text"
                value={screenerInput}
                onChange={(e) => setScreenerInput(e.target.value)}
                placeholder="Enter Address, Hash, Entity Name, or Syndicate Tag to screen against sanctions databases..."
                className="w-full h-10 pl-9 pr-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-gradient-to-r from-[#960018] to-[#C44536] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg transition-all shadow-glass-card shrink-0"
            >
              Screen Target
            </button>
          </form>

          {screenerResult && (
            <div className="p-3.5 bg-[#960018]/15 rounded-lg border border-[#960018]/30 text-xs font-mono text-[#FAFAF5] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-[#C44536]">warning</span>
              <span className="text-[#D8D3C7]">{screenerResult}</span>
            </div>
          )}
        </div>

        {/* Threat Vectors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THREAT_VECTORS.map((tv) => (
            <div
              key={tv.id}
              className="p-5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] hover:border-[#960018]/40 transition-all space-y-3 shadow-glass-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C44536]">{tv.id}</span>
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40">
                    {tv.threatLevel}
                  </span>
                </div>
                <h3 className="font-space font-bold text-base text-[#FAFAF5] mt-1">
                  {tv.category}
                </h3>
                <p className="text-xs text-[#9D9A92] mt-1 leading-relaxed">
                  {tv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#74736F]">Tracked Volume (INR):</span>
                  <strong className="text-[#ADC178] font-bold">{tv.totalVolumeINR}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74736F]">Active Intercept Nodes:</span>
                  <strong className="text-[#7CB9E8]">{tv.activeNodes} Cluster Nodes</strong>
                </div>
                <div className="p-2.5 bg-black/20 rounded-lg text-[11px] text-[#D8D3C7] border border-white/[0.04]">
                  Status: <strong className="text-[#FAFAF5]">{tv.mitigationStatus}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Geographic Threat Corridor Matrix */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 space-y-4 shadow-glass-card transition-colors">
          <h3 className="font-space font-bold text-base text-[#FAFAF5]">
            High-Risk Geographic Flight Corridors (India &amp; Offshore)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <div className="text-[#7CB9E8] font-bold">NCR - DUBAI CORRIDOR</div>
              <div className="text-[#FAFAF5] font-medium mt-1">₹42.8 Cr Layered Volume</div>
              <div className="text-[#74736F] text-[10px] mt-1">P2P Hawala Desks &gt; OTC Escrows</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <div className="text-amber-400 font-bold">SURAT - CAMBODIA CORRIDOR</div>
              <div className="text-[#FAFAF5] font-medium mt-1">₹62.4 Cr Layered Volume</div>
              <div className="text-[#74736F] text-[10px] mt-1">USDT-TRC20 Task Scam Laundering</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <div className="text-[#C44536] font-bold">MUMBAI - SEYCHELLES CORRIDOR</div>
              <div className="text-[#FAFAF5] font-medium mt-1">₹76.1 Cr Layered Volume</div>
              <div className="text-[#74736F] text-[10px] mt-1">Unregistered Offshore Betting Nodes</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import React from 'react';

export default function InvestigationJourney() {
  return (
    <div className="w-full bg-theme-surface rounded-2xl border border-theme-border p-6 sm:p-8 shadow-sm transition-colors relative overflow-hidden">
      {/* Symmetrical Grid Texture */}
      <div className="absolute inset-0 spatial-perspective-grid opacity-30 pointer-events-none"></div>

      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-theme-border relative z-10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
          <span className="font-bold text-theme-heading uppercase tracking-wider">
            ANATOMY OF A LAUNDERING HOP
          </span>
        </div>
        <div className="flex items-center gap-2 text-theme-text-muted text-[11px]">
          <span>SOURCE: TRON (TRC-20)</span>
          <span>→</span>
          <span>BRIDGE: LAYERZERO</span>
          <span>→</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">SETTLEMENT: POLYGON (POS)</span>
        </div>
      </div>

      {/* 3-Stage Investigation Journey Horizontal Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 relative z-10">
        {/* Stage 1: Unknown Target */}
        <div className="relative p-5 rounded-xl bg-theme-surface-subtle border border-red-500/30 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-red-500 uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
              01 // SUSPECT ORIGIN
            </span>
            <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-space font-bold text-base text-theme-heading">
              Unknown Suspect Wallet
            </h4>
            <div className="font-mono text-xs text-theme-text-muted bg-theme-surface px-2.5 py-1.5 rounded border border-theme-border flex items-center justify-between">
              <span>0x7A91...4F82</span>
              <span className="text-red-500 font-bold">₹28.15 Cr</span>
            </div>
          </div>

          <p className="font-sans text-xs text-theme-text-muted leading-relaxed">
            Darknet / extortion proceeds held in unattributed wallet with zero prior KYC or exchange registration.
          </p>
        </div>

        {/* Stage 2: Obfuscation & Multi-Hop Transit */}
        <div className="relative p-5 rounded-xl bg-theme-surface-subtle border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              02 // LAYERING &amp; BRIDGING
            </span>
            <span className="material-symbols-outlined text-amber-500 text-[20px]">account_tree</span>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-space font-bold text-base text-theme-heading">
              Mules &amp; Cross-Chain Relays
            </h4>
            <div className="font-mono text-xs text-theme-text-muted bg-theme-surface px-2.5 py-1.5 rounded border border-theme-border flex items-center justify-between">
              <span>3 Rapid Hops • Stargate</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Splitting</span>
            </div>
          </div>

          <p className="font-sans text-xs text-theme-text-muted leading-relaxed">
            Funds routed through peel chains, P2P mule networks, and cross-chain bridge contracts to sever direct link.
          </p>
        </div>

        {/* Stage 3: Regulated VASP Resolution */}
        <div className="relative p-5 rounded-xl bg-theme-surface-subtle border border-emerald-500/30 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              03 // ATTRIBUTION TARGET
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">verified</span>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-space font-bold text-base text-theme-heading">
              CoinDCX Regulated Custody
            </h4>
            <div className="font-mono text-xs text-theme-text-muted bg-theme-surface px-2.5 py-1.5 rounded border border-theme-border flex items-center justify-between">
              <span>FIU-IND Entity</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">96.8% Confidence</span>
            </div>
          </div>

          <p className="font-sans text-xs text-theme-text-muted leading-relaxed">
            Final deposit attributed to FIU-IND registered VASP with Section 65B court-admissible certificate.
          </p>
        </div>
      </div>
    </div>
  );
}

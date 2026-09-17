'use client';

import React, { useState, useEffect } from 'react';

export default function TraceCoreVisual() {
  const [activeNode, setActiveNode] = useState<'suspect' | 'bridge' | 'mule' | 'vasp'>('vasp');
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((p) => (p + 1) % 100);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none">
      {/* Ambient Depth Halo */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-amber-500/10 blur-3xl pointer-events-none"></div>

      {/* Outer Telemetry Compass Ring */}
      <div className="absolute inset-2 rounded-full border border-theme-border/40 dark:border-white/10 pointer-events-none animate-[spin_60s_linear_infinite]">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[9px] text-theme-text-muted shadow-xs">
          COORD: 0x7A91 // RESOLVING
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[9px] text-theme-text-muted shadow-xs">
          VASP CLUSTER: COINDCX-09
        </div>
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 px-1.5 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[8px] text-theme-text-muted -rotate-90">
          SEC-65B
        </div>
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 px-1.5 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[8px] text-theme-text-muted rotate-90">
          FIU-IND
        </div>
      </div>

      {/* Middle Orbital Coordinate Grid */}
      <div className="absolute inset-12 rounded-full border border-dashed border-theme-border/60 dark:border-cyan-500/20 pointer-events-none animate-[spin_40s_linear_infinite_reverse]"></div>

      {/* Core SVG Dynamic Transaction Network */}
      <svg viewBox="0 0 500 500" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          {/* Gradients */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="pathGradientSuspectToBridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="pathGradientBridgeToVasp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Marker Arrows */}
          <marker id="arrowCyan" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#F59E0B" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
          </marker>
        </defs>

        {/* Central Ledger Core Glow */}
        <circle cx="250" cy="250" r="140" fill="url(#coreGlow)" />
        <circle cx="250" cy="250" r="70" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
        <circle cx="250" cy="250" r="46" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />

        {/* Transaction Flow Vectors (Curved Bézier Paths) */}
        {/* Suspect (90, 160) -> Bridge (200, 100) */}
        <path
          d="M 115 170 Q 150 110 190 105"
          fill="none"
          stroke="url(#pathGradientSuspectToBridge)"
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />

        {/* Suspect (90, 160) -> Mule 1 (140, 310) */}
        <path
          d="M 105 185 Q 110 250 135 295"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Bridge (210, 95) -> Central Core (250, 250) */}
        <path
          d="M 220 115 Q 240 180 250 220"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          markerEnd="url(#arrowCyan)"
        />

        {/* Central Core (250, 250) -> Transit Mule 2 (340, 160) */}
        <path
          d="M 275 235 Q 310 200 330 170"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeDasharray="5 3"
          markerEnd="url(#arrowAmber)"
        />

        {/* Mule 1 (155, 320) -> Central Core (250, 250) */}
        <path
          d="M 165 320 Q 210 300 235 270"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.8"
        />

        {/* Transit Mule 2 (355, 160) -> VASP Endpoint (395, 320) */}
        <path
          d="M 355 175 Q 390 230 395 300"
          fill="none"
          stroke="url(#pathGradientBridgeToVasp)"
          strokeWidth="3"
          markerEnd="url(#arrowGreen)"
        />

        {/* Central Digital Forensic Ledger Hub */}
        <g className="cursor-pointer" onClick={() => setActiveNode('vasp')}>
          <circle cx="250" cy="250" r="28" className="fill-theme-surface stroke-theme-primary" strokeWidth="2.5" />
          <circle cx="250" cy="250" r="18" fill="#0284C7" fillOpacity="0.15" />
          <circle cx="250" cy="250" r="6" fill="#0284C7" className="animate-ping opacity-75" />
          <circle cx="250" cy="250" r="6" fill="#0284C7" />
          <text x="250" y="292" textAnchor="middle" className="fill-theme-heading font-space font-bold text-[10px]">
            FORENSIC CORE
          </text>
          <text x="250" y="303" textAnchor="middle" className="fill-theme-text-muted font-mono text-[8px]">
            7-SIGNAL ENGINE
          </text>
        </g>

        {/* NODE 1: Suspect Origin Wallet (Top Left) */}
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => setActiveNode('suspect')}
        >
          <circle cx="95" cy="165" r="24" className="fill-theme-surface stroke-red-500 shadow-md" strokeWidth="3" />
          <circle cx="95" cy="165" r="14" fill="#EF4444" fillOpacity="0.2" />
          <circle cx="95" cy="165" r="6" fill="#EF4444" />
          <text x="95" y="204" textAnchor="middle" className="fill-theme-heading font-space font-bold text-[10px]">
            SUSPECT ZERO
          </text>
          <text x="95" y="215" textAnchor="middle" className="fill-red-500 font-mono text-[8px] font-bold">
            0x7A91...4F82
          </text>
        </g>

        {/* NODE 2: LayerZero Cross-Chain Bridge (Top Middle) */}
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => setActiveNode('bridge')}
        >
          <circle cx="210" cy="95" r="20" className="fill-theme-surface stroke-purple-500" strokeWidth="2.5" />
          <circle cx="210" cy="95" r="10" fill="#8B5CF6" fillOpacity="0.2" />
          <circle cx="210" cy="95" r="5" fill="#8B5CF6" />
          <text x="210" y="68" textAnchor="middle" className="fill-theme-heading font-space font-bold text-[9.5px]">
            LayerZero Bridge
          </text>
          <text x="210" y="58" textAnchor="middle" className="fill-purple-500 font-mono text-[8px]">
            CROSS-CHAIN RELAY
          </text>
        </g>

        {/* NODE 3: Hawala Mule Splitter (Bottom Left) */}
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => setActiveNode('mule')}
        >
          <circle cx="145" cy="315" r="18" className="fill-theme-surface stroke-amber-500" strokeWidth="2" />
          <circle cx="145" cy="315" r="4" fill="#F59E0B" />
          <text x="145" y="348" textAnchor="middle" className="fill-theme-heading font-space font-semibold text-[9px]">
            Mule Layer A
          </text>
          <text x="145" y="358" textAnchor="middle" className="fill-amber-600 dark:text-amber-400 font-mono text-[8px]">
            HOP 1 (PEEL)
          </text>
        </g>

        {/* NODE 4: Intermediary Mule 2 (Top Right) */}
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => setActiveNode('mule')}
        >
          <circle cx="345" cy="155" r="18" className="fill-theme-surface stroke-amber-500" strokeWidth="2" />
          <circle cx="345" cy="155" r="4" fill="#F59E0B" />
          <text x="345" y="132" textAnchor="middle" className="fill-theme-heading font-space font-semibold text-[9px]">
            Surat Terminal
          </text>
          <text x="345" y="122" textAnchor="middle" className="fill-amber-600 dark:text-amber-400 font-mono text-[8px]">
            HOP 2 (SPLIT)
          </text>
        </g>

        {/* NODE 5: ATTRIBUTED VASP ENDPOINT (Bottom Right - CoinDCX) */}
        <g
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => setActiveNode('vasp')}
        >
          <circle cx="400" cy="325" r="34" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" className="animate-[spin_16s_linear_infinite]" />
          <circle cx="400" cy="325" r="28" className="fill-theme-surface stroke-emerald-500 shadow-xl" strokeWidth="3.5" />
          <circle cx="400" cy="325" r="16" fill="#10B981" fillOpacity="0.25" />
          <circle cx="400" cy="325" r="8" fill="#10B981" />
          <text x="400" y="372" textAnchor="middle" className="fill-theme-heading font-space font-extrabold text-[12px]">
            CoinDCX VASP
          </text>
          <text x="400" y="385" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[9px] font-bold">
            96.8% ATTRIBUTED
          </text>
        </g>
      </svg>

      {/* Floating Evidence Dossier Badge (Bottom Right) */}
      <div className="absolute -bottom-4 right-2 sm:right-6 bg-theme-surface/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-theme-border shadow-lg font-mono text-xs flex items-center gap-2.5 z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <div>
          <div className="text-[10px] text-theme-text-muted uppercase">Confidence Level</div>
          <div className="text-emerald-600 dark:text-emerald-400 font-bold font-space text-xs">
            96.8% • Section 65B Certified
          </div>
        </div>
      </div>

      {/* Floating Network Telemetry Badge (Top Left) */}
      <div className="absolute -top-3 left-2 sm:left-4 bg-theme-surface/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme-border shadow-md font-mono text-[10px] text-theme-text-muted flex items-center gap-2 z-20">
        <span className="material-symbols-outlined text-[14px] text-theme-primary">hub</span>
        <span className="text-theme-heading font-bold">6 Chains Supported</span>
      </div>
    </div>
  );
}

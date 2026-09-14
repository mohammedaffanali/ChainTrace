'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ChainTraceLogo from '@/components/common/ChainTraceLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import ChainTraceBackground from '@/components/common/ChainTraceBackground';

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 7);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg font-sans selection:bg-theme-primary selection:text-white flex flex-col relative overflow-x-hidden transition-colors duration-200">
      {/* GSAP Animated Living Blockchain Intelligence Network Background */}
      <ChainTraceBackground />

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-theme-surface/85 backdrop-blur-md border-b border-theme-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <ChainTraceLogo size="md" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-theme-text-secondary">
            <a href="#challenge" className="hover:text-theme-heading transition-colors">THE CHALLENGE</a>
            <a href="#workflow" className="hover:text-theme-heading transition-colors">ATTRIBUTION WORKFLOW</a>
            <a href="#capabilities" className="hover:text-theme-heading transition-colors">CAPABILITIES</a>
            <a href="#methodology" className="hover:text-theme-heading transition-colors">METHODOLOGY</a>
            <Link href="/dashboard" className="text-theme-primary hover:text-theme-primary-hover transition-colors font-semibold">
              COMMAND CENTER
            </Link>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="px-3.5 py-2 bg-theme-surface hover:bg-theme-surface-secondary text-theme-heading font-mono text-xs rounded-md border border-theme-border transition-colors shadow-sm"
            >
              Secure Access
            </Link>

            <Link
              href="/login?redirect=/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-semibold text-xs rounded-md shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>Analyze a Wallet</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Institutional Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-theme-surface border border-theme-gold/40 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-theme-gold"></span>
            <span className="font-mono text-xs text-theme-gold tracking-wider uppercase font-semibold">
              BLOCKCHAIN INTELLIGENCE // INSTITUTIONAL VASP ATTRIBUTION
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Copy */}
            <div className="lg:col-span-6 space-y-6">
              <h1 className="font-space font-extrabold text-4xl sm:text-5xl xl:text-6xl text-theme-heading tracking-tight leading-[1.1]">
                TRACE THE CHAIN. <br />
                <span className="bg-gradient-to-r from-[#155EEF] via-[#087F8C] to-[#A67C32] bg-clip-text text-transparent">
                  FIND THE VASP.
                </span>
              </h1>

              <p className="font-space text-lg text-theme-heading/90 font-medium leading-relaxed">
                Automated blockchain intelligence for attributing unknown cryptocurrency wallets to their nearest Virtual Asset Service Providers.
              </p>

              <p className="text-sm text-theme-text-secondary leading-relaxed">
                CHAINTRACE analyzes transaction paths, wallet relationships, deposit addresses and cross-chain activity to help investigators identify the VASP most closely associated with an unknown cryptocurrency wallet.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/login?redirect=/dashboard"
                  className="px-6 py-3.5 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-bold text-sm rounded-md shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all group"
                >
                  <span>Analyze a Wallet</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>

                <a
                  href="#workflow"
                  className="px-6 py-3.5 bg-theme-surface hover:bg-theme-surface-secondary text-theme-heading font-space font-semibold text-sm rounded-md border border-theme-border flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-theme-accent">account_tree</span>
                  <span>Explore Attribution Engine</span>
                </a>
              </div>

              {/* Verified Multi-Chain Support Bar */}
              <div className="pt-4 border-t border-theme-border flex items-center gap-3 flex-wrap font-mono text-[11px] text-theme-text-muted">
                <span className="text-theme-gold font-semibold uppercase">6+ BLOCKCHAIN NETWORKS:</span>
                {['BTC', 'ETH', 'TRON', 'BNB', 'SOL', 'MATIC'].map((chain) => (
                  <span key={chain} className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-heading font-semibold shadow-xs">
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Sophisticated Blockchain Network Visual & Demonstration Result Card */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Animated Network Visual Container */}
              <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-xl relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border font-mono text-xs">
                  <div className="flex items-center gap-2 text-theme-primary">
                    <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
                    <span className="font-bold">ATTRIBUTION TOPOLOGY // SIMULATION GRAPH</span>
                  </div>
                  <span className="text-theme-gold text-[10px] font-semibold px-2 py-0.5 rounded bg-theme-surface-secondary border border-theme-gold/30">
                    SIMULATED DEMONSTRATION DATA
                  </span>
                </div>

                {/* SVG Graph Animation */}
                <div className="py-4">
                  <svg viewBox="0 0 520 220" className="w-full h-auto">
                    <defs>
                      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#155EEF" />
                        <stop offset="50%" stopColor="#087F8C" />
                        <stop offset="100%" stopColor="#A67C32" />
                      </linearGradient>
                      <marker id="arrowHead" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#087F8C" />
                      </marker>
                    </defs>

                    {/* Connection lines */}
                    <line x1="80" y1="110" x2="180" y2="60" stroke="var(--border)" strokeWidth="2" />
                    <line x1="80" y1="110" x2="180" y2="160" stroke="var(--border)" strokeWidth="2" />
                    <line x1="180" y1="60" x2="280" y2="60" stroke="var(--border)" strokeWidth="2" />
                    <line x1="180" y1="160" x2="280" y2="160" stroke="var(--border)" strokeWidth="2" />
                    <line x1="280" y1="60" x2="380" y2="110" stroke="var(--border)" strokeWidth="2" />
                    <line x1="280" y1="160" x2="380" y2="110" stroke="var(--border)" strokeWidth="2" />
                    <line x1="380" y1="110" x2="460" y2="110" stroke="url(#flowGrad)" strokeWidth="3" strokeDasharray="6 3" className="animate-pulse" markerEnd="url(#arrowHead)" />

                    {/* Nodes */}
                    {/* Node 1: Suspect Unknown Wallet */}
                    <g transform="translate(80, 110)">
                      <circle r="22" fill="var(--surface-secondary)" stroke="var(--danger)" strokeWidth="2" />
                      <circle r="6" fill="var(--danger)" className="animate-ping" opacity="0.4" />
                      <circle r="4" fill="var(--danger)" />
                      <text y="34" textAnchor="middle" fill="var(--heading)" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        UNKNOWN WALLET
                      </text>
                      <text y="45" textAnchor="middle" fill="var(--danger)" fontSize="8" fontFamily="monospace">
                        0x7A91...4F82
                      </text>
                    </g>

                    {/* Node 2: Intermediary A */}
                    <g transform="translate(180, 60)">
                      <circle r="16" fill="var(--surface-secondary)" stroke="var(--primary)" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fill="var(--primary)" fontSize="7" fontFamily="monospace">MULE A</text>
                      <text y="26" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">1 Hop</text>
                    </g>

                    {/* Node 3: Intermediary B */}
                    <g transform="translate(180, 160)">
                      <circle r="16" fill="var(--surface-secondary)" stroke="var(--primary)" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fill="var(--primary)" fontSize="7" fontFamily="monospace">MULE B</text>
                      <text y="26" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">1 Hop</text>
                    </g>

                    {/* Node 4: Bridge / LayerZero */}
                    <g transform="translate(280, 60)">
                      <rect x="-16" y="-16" width="32" height="32" rx="4" fill="var(--surface-secondary)" stroke="#8B5CF6" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fill="#8B5CF6" fontSize="7" fontFamily="monospace">BRIDGE</text>
                      <text y="26" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">Stargate</text>
                    </g>

                    {/* Node 5: Mixer / Swap */}
                    <g transform="translate(280, 160)">
                      <rect x="-16" y="-16" width="32" height="32" rx="4" fill="var(--surface-secondary)" stroke="var(--warning)" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fill="var(--warning)" fontSize="7" fontFamily="monospace">SWAP</text>
                      <text y="26" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">DEX Router</text>
                    </g>

                    {/* Node 6: Deposit Wallet */}
                    <g transform="translate(380, 110)">
                      <circle r="18" fill="var(--surface-secondary)" stroke="var(--accent)" strokeWidth="2" />
                      <text y="3" textAnchor="middle" fill="var(--accent)" fontSize="7" fontFamily="monospace">DEPOSIT</text>
                      <text y="28" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">0x38b2...e9A1</text>
                    </g>

                    {/* Node 7: Attributed VASP Gateway */}
                    <g transform="translate(460, 110)">
                      <rect x="-24" y="-24" width="48" height="48" rx="6" fill="var(--surface-secondary)" stroke="var(--gold)" strokeWidth="2" />
                      <text y="-4" textAnchor="middle" fill="var(--gold)" fontSize="8" fontFamily="monospace" fontWeight="bold">VASP</text>
                      <text y="7" textAnchor="middle" fill="var(--success)" fontSize="9" fontFamily="monospace" fontWeight="bold">96.8%</text>
                      <text y="36" textAnchor="middle" fill="var(--gold)" fontSize="8" fontFamily="monospace">CoinDCX</text>
                    </g>
                  </svg>
                </div>

                {/* Flow Caption */}
                <div className="pt-2 border-t border-theme-border flex items-center justify-between text-[11px] font-mono text-theme-text-muted">
                  <span>PATH: Suspect Wallet → Intermediary Mule → Bridge → VASP Gateway</span>
                  <span className="text-theme-success font-bold">2 Hops Resolved</span>
                </div>
              </div>

              {/* Hero Result Card */}
              <div className="bg-theme-surface rounded-xl border border-theme-gold/50 p-5 shadow-lg space-y-3 relative transition-colors">
                <div className="flex items-center justify-between border-b border-theme-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-theme-gold text-[18px]">verified</span>
                    <span className="font-space font-bold text-xs uppercase tracking-wider text-theme-heading">
                      AUTOMATED ATTRIBUTION RESULT
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-theme-success bg-theme-surface-secondary px-2 py-0.5 rounded border border-theme-border font-bold">
                    RESOLVED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">UNKNOWN WALLET</span>
                    <strong className="text-theme-heading">0x7A91...4F82</strong>
                  </div>
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">NEAREST VASP</span>
                    <strong className="text-theme-gold">CoinDCX (Neblio)</strong>
                  </div>
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">CONFIDENCE</span>
                    <strong className="text-theme-success text-sm">96.8%</strong>
                  </div>
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">DISTANCE</span>
                    <strong className="text-theme-primary">2 HOPS</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-theme-border text-[11px] font-mono text-theme-text-secondary">
                  <div>Deposit Relation: <span className="text-theme-heading font-semibold">DIRECT DEPOSIT</span></div>
                  <div>Network: <span className="text-theme-heading font-semibold">TRON / POLYGON</span></div>
                  <div>Signals: <span className="text-theme-success font-bold">7 MATCHED</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE ATTRIBUTION CHALLENGE */}
      <section id="challenge" className="py-16 bg-theme-surface-secondary/50 border-y border-theme-border relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-theme-surface border border-theme-border font-mono text-xs text-theme-accent font-semibold shadow-xs">
              <span>THE ATTRIBUTION CHALLENGE</span>
            </div>
            <h2 className="font-space font-extrabold text-3xl sm:text-4xl text-theme-heading">
              FROM UNKNOWN TRANSACTION TO REGULATED ENTITY
            </h2>
            <p className="text-sm text-theme-text-secondary leading-relaxed">
              Investigators frequently identify a cryptocurrency wallet associated with illicit activity without knowing which Virtual Asset Service Provider controls or receives the funds.
            </p>
          </div>

          {/* Side-by-side contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Manual Tracing */}
            <div className="p-6 rounded-xl bg-theme-surface border border-theme-danger/30 flex flex-col justify-between space-y-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <h3 className="font-space font-bold text-base text-theme-danger flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">timer_off</span>
                    <span>Conventional Manual Tracing</span>
                  </h3>
                  <span className="font-mono text-[10px] text-theme-danger bg-theme-surface-secondary px-2 py-0.5 rounded border border-theme-border font-bold">
                    HOURS TO DAYS
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs text-theme-text-secondary">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Suspect wallet identified from FIR or incident log</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Manual blockchain explorer lookups per transaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Multi-hop layering creates exponential transaction volume</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">4</span>
                    <span>Cross-chain bridges obscure destination ledger</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">5</span>
                    <span>Delayed attribution risks asset dissipation &amp; off-ramping</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-theme-border text-xs font-mono text-theme-danger flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>Manual investigative bottleneck causes asset flight</span>
              </div>
            </div>

            {/* CHAINTRACE Automated Attribution */}
            <div className="p-6 rounded-xl bg-theme-surface border-2 border-theme-primary/40 shadow-md flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <h3 className="font-space font-bold text-base text-theme-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>CHAINTRACE Automated Engine</span>
                  </h3>
                  <span className="font-mono text-[10px] text-theme-success bg-theme-surface-secondary px-2 py-0.5 rounded border border-theme-border font-bold">
                    SECONDS
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs text-theme-fg">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Accept unknown wallet across 6 supported blockchains</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Blockchain Intelligence APIs map multi-hop transaction graph</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Entity &amp; address clustering de-cloaks intermediary mule groups</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">4</span>
                    <span>Deposit-address heuristics identify nearest candidate VASP</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">5</span>
                    <span>Confidence score, evidence trail &amp; statutory notice ready</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-theme-border text-xs font-mono text-theme-success flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Automated end-to-end VASP attribution</span>
                </span>
                <Link href="/login?redirect=/vasp-attribution" className="text-theme-primary hover:underline font-bold">
                  Test Engine →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUE PROPOSITION — 3 PILLARS */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-mono text-xs text-theme-gold uppercase tracking-widest font-semibold">
              PRODUCT PILLARS
            </span>
            <h2 className="font-space font-extrabold text-3xl sm:text-4xl text-theme-heading">
              THREE PILLARS OF CHAINTRACE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-primary transition-all space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-3xl text-theme-primary">01</span>
                <span className="material-symbols-outlined text-theme-primary text-[28px]">hub</span>
              </div>
              <h3 className="font-space font-bold text-xl text-theme-heading uppercase tracking-tight">
                TRACE
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Automatically analyze transaction paths from suspect wallets. Traverse multi-hop chains across Bitcoin, Ethereum, Tron, BNB Chain, Solana, and Polygon without manual explorer hopping.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl bg-theme-surface border border-theme-gold/50 hover:border-theme-gold transition-all space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-3xl text-theme-gold">02</span>
                <span className="material-symbols-outlined text-theme-gold text-[28px]">domain</span>
              </div>
              <h3 className="font-space font-bold text-xl text-theme-heading uppercase tracking-tight">
                ATTRIBUTE
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Identify the nearest VASP or exchange associated with the transaction flow. Map custody patterns, deposit contracts, and omnibus clusters to pinpoint reporting entities.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-accent transition-all space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-3xl text-theme-accent">03</span>
                <span className="material-symbols-outlined text-theme-accent text-[28px]">verified</span>
              </div>
              <h3 className="font-space font-bold text-xl text-theme-heading uppercase tracking-tight">
                EVIDENCE
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Provide transparent attribution confidence, supporting signals, and investigation-ready court dossiers with tamper-proof cryptographic audit checksums.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY FEATURE — WORKFLOW: FROM UNKNOWN WALLET TO ATTRIBUTED VASP */}
      <section id="workflow" className="py-16 bg-theme-surface-secondary/50 border-y border-theme-border relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="font-mono text-xs text-theme-accent uppercase tracking-widest font-semibold">
                END-TO-END PIPELINE
              </span>
              <h2 className="font-space font-extrabold text-3xl sm:text-4xl text-theme-heading">
                FROM UNKNOWN WALLET TO ATTRIBUTED VASP
              </h2>
              <p className="text-xs text-theme-text-secondary">
                Six structured analytical phases executed automatically via blockchain intelligence abstractions.
              </p>
            </div>

            <Link
              href="/login?redirect=/vasp-attribution"
              className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded-md shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Run Attribution Demo</span>
            </Link>
          </div>

          {/* 6 Step Visual Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { num: '01', title: 'IDENTIFY', desc: 'Accept suspect wallet address and validate network syntax.' },
              { num: '02', title: 'TRACE', desc: 'Traverse multi-hop ledger transaction paths and bridges.' },
              { num: '03', title: 'CLUSTER', desc: 'Group co-spending addresses into entity clusters.' },
              { num: '04', title: 'MATCH', desc: 'Compare deposit addresses with VASP custody records.' },
              { num: '05', title: 'SCORE', desc: 'Calculate transparent 7-signal confidence percentage.' },
              { num: '06', title: 'REPORT', desc: 'Synthesize court-ready intelligence and freeze notices.' },
            ].map((step, idx) => (
              <div
                key={step.num}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  activeStep === idx
                    ? 'bg-theme-surface border-theme-primary shadow-md shadow-blue-500/10'
                    : 'bg-theme-surface border-theme-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-theme-primary">{step.num}</span>
                  <span className={`w-2 h-2 rounded-full ${activeStep === idx ? 'bg-theme-primary animate-ping' : 'bg-theme-border'}`}></span>
                </div>
                <div>
                  <h4 className="font-space font-bold text-sm text-theme-heading">{step.title}</h4>
                  <p className="text-[11px] text-theme-text-muted mt-1 leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 CORE CAPABILITY CARDS */}
      <section id="capabilities" className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-mono text-xs text-theme-gold uppercase tracking-widest font-semibold">
              PRODUCT CAPABILITIES
            </span>
            <h2 className="font-space font-extrabold text-3xl sm:text-4xl text-theme-heading">
              ENGINEERED FOR INSTITUTIONAL INVESTIGATIONS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: 'domain',
                title: 'Automated VASP Attribution',
                desc: 'Identify the nearest VASP associated with an unknown wallet within seconds.',
                badge: 'CORE ENGINE',
                badgeColor: 'text-theme-gold bg-amber-50 dark:bg-amber-950/40 border-theme-gold/30',
                link: '/vasp-attribution',
              },
              {
                icon: 'api',
                title: 'Blockchain Intelligence APIs',
                desc: 'Connect transaction intelligence from multiple blockchain networks seamlessly.',
                badge: '6 NETWORKS',
                badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-500/30',
                link: '/transaction-explorer',
              },
              {
                icon: 'timeline',
                title: 'Multi-Hop Tracing',
                desc: 'Follow funds through intermediary mule wallets, mixers, and consolidation accounts.',
                badge: 'FORENSIC HOPS',
                badgeColor: 'text-teal-600 dark:text-cyan-400 bg-teal-50 dark:bg-cyan-950/40 border-teal-500/30',
                link: '/wallet-intelligence',
              },
              {
                icon: 'shuffle',
                title: 'Cross-Chain Analysis',
                desc: 'Correlate fund movement across bridges including Wormhole, Stargate, and Thorchain.',
                badge: 'BRIDGE RELAY',
                badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-500/30',
                link: '/cross-chain-analysis',
              },
              {
                icon: 'workspaces',
                title: 'Wallet Clustering',
                desc: 'Identify relationships between addresses and known entities via co-spending heuristics.',
                badge: 'DE-ANONYMIZATION',
                badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30',
                link: '/wallet-intelligence',
              },
              {
                icon: 'fact_check',
                title: 'Confidence Scoring',
                desc: 'Transparently explain why a VASP attribution was generated across 7 analytical signals.',
                badge: 'AUDITABLE',
                badgeColor: 'text-theme-gold bg-amber-50 dark:bg-amber-950/40 border-theme-gold/30',
                link: '/vasp-attribution',
              },
              {
                icon: 'hub',
                title: 'Fund Flow Intelligence',
                desc: 'Visualize the path from source wallet to destination with interactive studio controls.',
                badge: 'GRAPH STUDIO',
                badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-500/30',
                link: '/fund-flow-graph',
              },
              {
                icon: 'summarize',
                title: 'Investigation Reports',
                desc: 'Turn analytical results into structured court-ready intelligence dossiers.',
                badge: 'EVIDENCE 65B',
                badgeColor: 'text-teal-600 dark:text-cyan-400 bg-teal-50 dark:bg-cyan-950/40 border-teal-500/30',
                link: '/reports',
              },
            ].map((c) => (
              <Link
                key={c.title}
                href={c.link}
                className="p-5 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-primary transition-all flex flex-col justify-between space-y-4 group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-theme-primary text-[24px] group-hover:scale-110 transition-transform">
                      {c.icon}
                    </span>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="font-space font-bold text-sm text-theme-heading mt-3 group-hover:text-theme-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-theme-text-muted mt-1.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
                <div className="font-mono text-[10px] text-theme-primary flex items-center gap-1 font-semibold">
                  <span>Explore Module</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL "WHY CHAINTRACE" */}
      <section id="methodology" className="py-16 bg-theme-surface-secondary/50 border-y border-theme-border relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="font-mono text-xs text-theme-gold uppercase tracking-widest font-semibold">
              EDITORIAL STATEMENT
            </span>
            <h2 className="font-space font-extrabold text-3xl sm:text-4xl text-theme-heading">
              FROM BLOCKCHAIN DATA TO INVESTIGATIVE INTELLIGENCE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 border-l-2 border-theme-primary pl-4">
              <h3 className="font-space font-bold text-lg text-theme-heading">
                Less manual tracing.
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Automate repetitive transaction-path analysis across complex multi-hop peel chains, eliminating hours of manual explorer correlation.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-theme-gold pl-4">
              <h3 className="font-space font-bold text-lg text-theme-heading">
                Faster attribution.
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Surface the nearest VASP candidate with supporting evidence, enabling statutory information disclosure and asset freeze notices before funds leave the ecosystem.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-theme-accent pl-4">
              <h3 className="font-space font-bold text-lg text-theme-heading">
                Better investigative context.
              </h3>
              <p className="text-xs text-theme-text-secondary leading-relaxed">
                Combine wallet, transaction, graph, entity clustering, and cross-chain intelligence into one seamless, court-admissible workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-theme-surface border border-theme-gold/40 font-mono text-xs text-theme-gold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-gold"></span>
            <span>SIH 2026 DEMONSTRATION PLATFORM</span>
          </div>

          <h2 className="font-space font-extrabold text-3xl sm:text-5xl text-theme-heading tracking-tight leading-tight">
            FIND THE VASP BEHIND THE UNKNOWN WALLET.
          </h2>

          <p className="text-sm sm:text-base text-theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            Move from an unidentified blockchain address to structured VASP intelligence through automated transaction tracing, attribution and evidence analysis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-bold text-sm rounded-md shadow-lg shadow-blue-600/25 transition-all"
            >
              ENTER CHAINTRACE
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-theme-surface hover:bg-theme-surface-secondary text-theme-heading font-space font-semibold text-sm rounded-md border border-theme-border transition-colors shadow-sm"
            >
              VIEW COMMAND CENTER
            </Link>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="bg-theme-surface border-t border-theme-border pt-12 pb-8 text-xs font-mono text-theme-text-muted relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <ChainTraceLogo size="md" />
              <p className="text-[11px] text-theme-text-muted leading-relaxed">
                Automated Blockchain Intelligence &amp; VASP Attribution for Unknown Cryptocurrency Wallets.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-2">
              <span className="text-theme-heading font-bold block uppercase">Platform</span>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/vasp-attribution" className="hover:text-theme-primary transition-colors">VASP Attribution Engine</Link></li>
                <li><Link href="/wallet-intelligence" className="hover:text-theme-primary transition-colors">Wallet Intelligence</Link></li>
                <li><Link href="/transaction-explorer" className="hover:text-theme-primary transition-colors">Transaction Analysis</Link></li>
                <li><Link href="/cross-chain-analysis" className="hover:text-theme-primary transition-colors">Cross-Chain Intelligence</Link></li>
              </ul>
            </div>

            {/* Column 3: Investigation */}
            <div className="space-y-2">
              <span className="text-theme-heading font-bold block uppercase">Investigation</span>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/fund-flow-graph" className="hover:text-theme-primary transition-colors">Fund Flow Graph</Link></li>
                <li><Link href="/risk-intelligence" className="hover:text-theme-primary transition-colors">Risk Intelligence</Link></li>
                <li><Link href="/investigations" className="hover:text-theme-primary transition-colors">Investigations Register</Link></li>
                <li><Link href="/reports" className="hover:text-theme-primary transition-colors">Section 65B Dossiers</Link></li>
              </ul>
            </div>

            {/* Column 4: Access */}
            <div className="space-y-2">
              <span className="text-theme-heading font-bold block uppercase">Access &amp; Audit</span>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/login" className="hover:text-theme-primary transition-colors">Secure Access Enclave</Link></li>
                <li><Link href="/dashboard" className="hover:text-theme-primary transition-colors">Command Center</Link></li>
                <li><Link href="/audit-logs" className="hover:text-theme-primary transition-colors">Chain-of-Custody Logs</Link></li>
                <li><Link href="/administration" className="hover:text-theme-primary transition-colors">Node Administration</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-theme-text-muted">
            <span>© 2026 CHAINTRACE • AUTOMATED BLOCKCHAIN INTELLIGENCE PLATFORM</span>
            <span className="text-theme-gold font-semibold">CONTROLLED DEMONSTRATION ENVIRONMENT</span>
            <span>SMART INDIA HACKATHON PROTOTYPE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

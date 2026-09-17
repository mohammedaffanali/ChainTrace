'use client';

import React from 'react';
import Link from 'next/link';
import ChainTraceLogo from '@/components/common/ChainTraceLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import TraceCoreVisual from '@/components/landing/TraceCoreVisual';
import InvestigationJourney from '@/components/landing/InvestigationJourney';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg font-space flex flex-col relative overflow-x-hidden selection:bg-theme-primary selection:text-white transition-colors scroll-smooth">
      {/* Symmetrical High-Precision Background Grid */}
      <div className="fixed inset-0 spatial-perspective-grid opacity-50 dark:opacity-25 pointer-events-none z-0"></div>

      {/* Global Forensic Navigation Header (Full Width Fluid Layout) */}
      <header className="sticky top-0 z-40 bg-theme-surface/90 border-b border-theme-border backdrop-blur-md transition-colors w-full">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <ChainTraceLogo size="md" />
          </div>

          {/* Centered Structured Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-2 p-1.5 rounded-full bg-theme-surface-secondary/70 border border-theme-border backdrop-blur-sm shadow-xs">
            <a
              href="#unknown"
              className="px-5 py-2 rounded-full font-mono text-xs font-semibold tracking-wider text-theme-text-secondary hover:text-theme-heading hover:bg-theme-surface transition-all duration-200"
            >
              UNKNOWN
            </a>
            <a
              href="#trace"
              className="px-5 py-2 rounded-full font-mono text-xs font-semibold tracking-wider text-theme-text-secondary hover:text-theme-heading hover:bg-theme-surface transition-all duration-200"
            >
              TRACE
            </a>
            <a
              href="#connect"
              className="px-5 py-2 rounded-full font-mono text-xs font-semibold tracking-wider text-theme-text-secondary hover:text-theme-heading hover:bg-theme-surface transition-all duration-200"
            >
              CONNECT
            </a>
            <a
              href="#explain"
              className="px-5 py-2 rounded-full font-mono text-xs font-semibold tracking-wider text-theme-text-secondary hover:text-theme-heading hover:bg-theme-surface transition-all duration-200"
            >
              EXPLAIN
            </a>
          </nav>

          {/* Action Header Group */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            <ThemeToggle />

            <Link
              href="/login"
              className="px-4 py-2.5 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-mono text-xs rounded-xl border border-theme-border transition-colors font-semibold shadow-xs"
            >
              Officer Login
            </Link>

            <Link
              href="/login?redirect=/vasp-attribution"
              className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-theme-primary/25 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>ANALYZE A WALLET</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 sm:pt-16 sm:pb-32 z-10">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Brand Statement & CTA */}
            <div className="lg:col-span-7 space-y-7">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-primary-dim border border-theme-primary/30 font-mono text-xs text-theme-primary shadow-xs">
                <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
                <span className="font-bold tracking-wider uppercase">CHAINTRACE FORENSIC ENGINE</span>
                <span className="text-theme-border">•</span>
                <span className="text-theme-text-muted">SIH 2026</span>
              </div>

              {/* Commanding Headline */}
              <div className="space-y-4">
                <h1 className="font-extrabold text-5xl sm:text-6xl xl:text-7xl 2xl:text-8xl text-theme-heading tracking-tight leading-[1.02]">
                  TRACE
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary via-cyan-500 to-emerald-500">
                    THE UNKNOWN.
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl 2xl:text-3xl text-theme-text-secondary font-medium tracking-tight">
                  Turn blockchain activity into explainable intelligence.
                </p>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-theme-text-muted leading-relaxed font-sans max-w-2xl">
                Investigate suspicious cryptocurrency wallets, trace multi-hop transaction paths, and uncover likely VASP connections through evidence-backed, court-admissible blockchain intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <Link
                  href="/login?redirect=/vasp-attribution"
                  className="px-7 py-4 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-theme-primary/25 transition-all flex items-center gap-2.5"
                >
                  <span>ANALYZE A WALLET</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>

                <a
                  href="#unknown"
                  className="px-7 py-4 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-space font-semibold text-sm sm:text-base rounded-xl border border-theme-border transition-colors flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  <span>HOW IT WORKS</span>
                </a>
              </div>

              {/* Supported Ledgers Strip */}
              <div className="pt-6 border-t border-theme-border/60 flex items-center gap-2.5 flex-wrap font-mono text-xs text-theme-text-muted">
                <span className="text-theme-heading font-semibold uppercase tracking-wider">SUPPORTED PROTOCOLS:</span>
                {['ETHEREUM', 'TRON (TRC20)', 'POLYGON', 'BITCOIN', 'SOLANA', 'LAYERZERO'].map((chain) => (
                  <span key={chain} className="px-3 py-1 rounded-lg bg-theme-surface-secondary border border-theme-border text-theme-fg text-xs font-medium">
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: THE TRACE CORE */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[580px]">
                <TraceCoreVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: UNKNOWN */}
      <section id="unknown" className="relative py-24 bg-theme-surface-subtle/50 border-t border-theme-border z-10 transition-colors scroll-mt-20">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
              UNKNOWN WALLETS
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-heading tracking-tight leading-tight">
              UNKNOWN WALLETS.
              <br />
              HIDDEN CONNECTIONS.
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary font-sans leading-relaxed">
              Illicit actors route funds through unhosted wallets, peel chains, and decentralized cross-chain bridges to sever investigative links. CHAINTRACE establishes the initial forensic entrypoint, analyzing transaction cadence, unhosted counterparty exposure, and volume dispersion.
            </p>
          </div>

          {/* Minimal Transaction Journey Visual */}
          <InvestigationJourney />
        </div>
      </section>

      {/* SECTION 2: TRACE */}
      <section id="trace" className="relative py-24 bg-theme-surface border-t border-theme-border z-10 transition-colors scroll-mt-20">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-14">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-theme-primary-dim border border-theme-primary/30 font-mono text-xs font-bold text-theme-primary uppercase tracking-widest">
              LEDGER TRACING
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-heading tracking-tight leading-tight">
              MULTI-HOP LEDGER TRAVERSAL.
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary font-sans leading-relaxed">
              Explore wallet activity across EVM, Tron, Polygon, Bitcoin, and Solana networks. CHAINTRACE applies bounded BFS multi-hop graph algorithms to track rapid splitting, cycle detection, mixer peeling, and bridge relays without data loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-theme-primary text-[32px]">account_tree</span>
                  <span className="font-mono text-xs font-bold text-theme-primary px-2.5 py-1 rounded bg-theme-primary-dim border border-theme-primary/20">
                    1 - 4 HOPS
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Bounded BFS Traversal</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Follows transaction paths dynamically up to 4 hops with cycle deduplication, preventing infinite loops while preserving transaction fidelity.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Cycle Guard</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-cyan-500 text-[32px]">sync_alt</span>
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                    CROSS-CHAIN
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Cross-Chain Bridge Tracking</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Correlates cross-chain message passing events across LayerZero, Stargate, Wormhole, and Tron bridge contracts to maintain link continuity.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Bridge Protocols</span>
                <span className="font-bold text-theme-heading">LayerZero / Wormhole</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-amber-500 text-[32px]">filter_alt</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                    HEURISTICS
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Peeling &amp; Mule Detection</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Identifies rapid peeling structures, fan-out money mule splitting, and high-velocity layering maneuvers used to obfuscate illicit fund origins.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Mule Splitting</span>
                <span className="font-bold text-theme-heading">Cluster Grouping</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CONNECT */}
      <section id="connect" className="relative py-24 bg-theme-surface-subtle/50 border-t border-theme-border z-10 transition-colors scroll-mt-20">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-14">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-purple-500/15 border border-purple-500/25 font-mono text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              VASP RESOLUTION
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-heading tracking-tight leading-tight">
              VASP CLUSTER IDENTIFICATION.
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary font-sans leading-relaxed">
              Connect intermediary addresses directly to verified custodial Virtual Asset Service Providers (VASPs). Match deposit addresses against our curated repository of 46+ verified domestic and global exchanges registered with FIU-IND.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Entity 1 */}
            <div className="p-8 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-4 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-purple-500 text-[32px]">domain</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                    FIU-IND COMPLIANT
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Verified VASP Registry</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Comprehensive database of regulated Indian entities (CoinDCX, WazirX, CoinSwitch) and major international custodial platforms (Binance, OKX, Bybit).
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Verified Entities</span>
                <span className="font-bold text-theme-heading">46+ Registered</span>
              </div>
            </div>

            {/* Entity 2 */}
            <div className="p-8 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-4 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-purple-500 text-[32px]">scatter_plot</span>
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20">
                    CO-SPEND ALGORITHMS
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Deposit Cluster Correlation</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Aggregates hot wallets, sweeping addresses, and co-spending transaction clusters into unified custodial entity profiles.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Cluster Resolution</span>
                <span className="font-bold text-theme-heading">Sweeping / Aggregation</span>
              </div>
            </div>

            {/* Entity 3 */}
            <div className="p-8 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-4 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                  <span className="material-symbols-outlined text-purple-500 text-[32px]">security</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                    ANTI-GUESSING
                  </span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">Zero-Guessing Refusal</h3>
                <p className="text-sm text-theme-text-muted leading-relaxed font-sans">
                  Adheres strictly to the NO_RELIABLE_ATTRIBUTION protocol when evidence fails strict thresholds, preventing false positives in legal proceedings.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-xs text-theme-text-secondary flex items-center justify-between">
                <span>Evidence Threshold</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Strict Math Barrier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: EXPLAIN */}
      <section id="explain" className="relative py-24 bg-theme-surface border-t border-theme-border z-10 transition-colors scroll-mt-20">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-14">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              MATHEMATICAL PROOF
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-heading tracking-tight leading-tight">
              7-SIGNAL MATHEMATICAL PROOF.
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary font-sans leading-relaxed">
              Every attribution is computed with mathematical rigor. Transparent weights calculate proximity decay, volume proportion, temporal velocity, counterparty purity, and behavioral consistency, outputting court-ready Section 65B certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* 7 Signals Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">1. Proximity Decay (w=0.25)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Hop distance attenuation factor over multi-hop paths.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">2. Volume Proportion (w=0.20)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Percentage of total traced fund value captured.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">3. Direct Deposit Link (w=0.15)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">1-hop direct deposit interaction with known VASP hot wallet.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">4. Temporal Velocity (w=0.15)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Time elapsed between suspect egress and VASP ingress.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">5. Counterparty Purity (w=0.10)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Ratio of regulated vs. unverified intermediaries.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5">
                <div className="text-theme-primary font-bold text-sm">6. Multi-Hop Continuity (w=0.10)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Unbroken chain of custody throughout the transit graph.</div>
              </div>
              <div className="p-5 rounded-2xl bg-theme-surface-subtle border border-theme-border space-y-1.5 sm:col-span-2">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">7. Behavioral Consistency (w=0.05)</div>
                <div className="text-xs text-theme-text-muted font-sans leading-relaxed">Transaction fingerprint matching known exchange deposit patterns.</div>
              </div>
            </div>

            {/* Admissibility Certificate Card */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-theme-surface-subtle border border-emerald-500/30 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-theme-border font-mono text-xs">
                  <span className="font-bold text-theme-heading uppercase text-sm">LEGAL ADMISSIBILITY</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    SECTION 65B READY
                  </span>
                </div>

                <div className="space-y-4 font-sans text-sm text-theme-text-muted">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px] shrink-0 mt-0.5">check_circle</span>
                    <span className="leading-relaxed">Cryptographic hash verification of all ingested raw blockchain records.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px] shrink-0 mt-0.5">check_circle</span>
                    <span className="leading-relaxed">Immutable audit log trail compliant with Bharatiya Sakshya Adhiniyam standards.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px] shrink-0 mt-0.5">check_circle</span>
                    <span className="leading-relaxed">Direct export to official Law Enforcement Notice templates.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/reports"
                  className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  <span>View Sample Section 65B Notice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT WORKSPACE PREVIEW: THE INTELLIGENCE WORKBENCH */}
      <section className="relative py-24 bg-theme-surface-subtle/50 border-t border-theme-border z-10 transition-colors">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
                FORENSIC INTERFACE
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-heading tracking-tight">
                THE INTELLIGENCE WORKBENCH.
              </h2>
            </div>
            <Link
              href="/login?redirect=/vasp-attribution"
              className="text-sm font-mono text-theme-primary hover:underline flex items-center gap-1.5 font-bold"
            >
              <span>Launch Live Investigation Desk</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Scaled Product Preview Mockup */}
          <div className="rounded-3xl border border-theme-border bg-theme-surface p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Mini Preview 1: Graph Topology */}
              <div className="lg:col-span-7 bg-theme-surface-subtle rounded-2xl border border-theme-border p-6 space-y-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-theme-border pb-4 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-theme-heading text-sm">FUND FLOW GRAPH • TOPOLOGY MATRIX</span>
                  </div>
                  <span className="px-3 py-1 rounded bg-theme-surface-secondary text-theme-text-muted text-xs font-bold">
                    6 NODES • 3 HOPS
                  </span>
                </div>

                <div className="py-8 flex items-center justify-between gap-3 overflow-x-auto font-mono text-xs">
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center shrink-0">
                    <div className="font-bold">SUSPECT ZERO</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">0x7A91...4F82</div>
                  </div>
                  <span className="text-theme-border text-lg font-bold">→</span>
                  <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-center shrink-0">
                    <div className="font-bold">LAYERZERO</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">Bridge Hop 1</div>
                  </div>
                  <span className="text-theme-border text-lg font-bold">→</span>
                  <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-center shrink-0">
                    <div className="font-bold">MULE LAYER</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">Split Hop 2</div>
                  </div>
                  <span className="text-theme-border text-lg font-bold">→</span>
                  <div className="px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-center shrink-0">
                    <div className="font-bold">COINDCX</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">96.8% VASP</div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-theme-text-muted flex items-center justify-between">
                  <span>Routing Protocol: Dynamic BFS Ingestion</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Multi-Chain Synced</span>
                </div>
              </div>

              {/* Mini Preview 2: Forensic Score & Evidence */}
              <div className="lg:col-span-5 bg-theme-surface-subtle rounded-2xl border border-theme-border p-6 space-y-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-theme-border pb-4 font-mono text-xs">
                  <span className="font-bold text-theme-heading uppercase text-sm">7-Signal Score</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Court Admissible</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-space font-extrabold text-5xl text-emerald-600 dark:text-emerald-400">96.8%</span>
                    <span className="font-mono text-xs text-theme-text-muted">Weighted Confidence</span>
                  </div>

                  <div className="w-full bg-theme-surface-secondary h-3 rounded-full overflow-hidden border border-theme-border">
                    <div className="h-full bg-gradient-to-r from-theme-primary via-cyan-500 to-emerald-500 w-[96.8%]"></div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-theme-text-muted space-y-2">
                  <div>Entity: <strong className="text-theme-heading">CoinDCX (Neblio Tech Pvt Ltd)</strong></div>
                  <div>Provenance: <strong className="text-emerald-600 dark:text-emerald-400">Section 65B Certificate Verified</strong></div>
                  <div>Jurisdiction: <strong className="text-theme-heading">India (FIU-IND Reg. #VASP-IND-0042)</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA & INSTITUTIONAL FOOTER */}
      <section className="relative py-28 bg-theme-surface border-t border-theme-border z-10 transition-colors text-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
              READY FOR INVESTIGATION
            </span>
            <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-theme-heading tracking-tight leading-tight">
              EVERY WALLET
              <br />
              LEAVES A TRACE.
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary font-sans max-w-2xl mx-auto leading-relaxed">
              Turn complex blockchain activity into actionable investigative intelligence with court-admissible VASP attribution.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/login?redirect=/vasp-attribution"
              className="inline-flex items-center gap-2.5 px-9 py-4 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-bold text-base rounded-xl shadow-xl shadow-theme-primary/30 transition-all"
            >
              <span>ANALYZE A WALLET</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="mt-auto border-t border-theme-border bg-theme-surface/90 backdrop-blur-md py-10 z-10 transition-colors w-full">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-theme-text-muted">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-theme-heading text-sm">CHAINTRACE • BLOCKCHAIN INTELLIGENCE</span>
              <span>•</span>
              <span>SMART INDIA HACKATHON 2026</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-theme-heading transition-colors font-medium">Officer Enclave</Link>
              <span>•</span>
              <Link href="/dashboard" className="hover:text-theme-heading transition-colors font-medium">Investigation Desk</Link>
              <span>•</span>
              <Link href="/reports" className="hover:text-theme-heading transition-colors font-medium">Section 65B Notices</Link>
            </div>
          </div>
          <div className="text-xs font-mono text-theme-text-muted text-center sm:text-left border-t border-theme-border/60 pt-5">
            FIU-IND &amp; PMLA Compliant Digital Evidence Architecture • Bharatiya Sakshya Adhiniyam Section 65B Standard.
          </div>
        </div>
      </footer>
    </div>
  );
}

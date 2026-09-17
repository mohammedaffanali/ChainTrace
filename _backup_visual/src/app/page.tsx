'use client';

import React from 'react';
import Link from 'next/link';
import ChainTraceLogo from '@/components/common/ChainTraceLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import TraceCoreVisual from '@/components/landing/TraceCoreVisual';
import InvestigationJourney from '@/components/landing/InvestigationJourney';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg font-space flex flex-col relative overflow-x-hidden selection:bg-theme-primary selection:text-white transition-colors">
      {/* Symmetrical High-Precision Background Grid */}
      <div className="fixed inset-0 spatial-perspective-grid opacity-50 dark:opacity-25 pointer-events-none z-0"></div>

      {/* Global Forensic Navigation Header */}
      <header className="sticky top-0 z-40 bg-theme-surface/90 border-b border-theme-border backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <ChainTraceLogo size="md" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-theme-text-secondary">
            <a href="#unknown" className="hover:text-theme-heading transition-colors">01 // UNKNOWN</a>
            <a href="#trace" className="hover:text-theme-heading transition-colors">02 // TRACE</a>
            <a href="#connect" className="hover:text-theme-heading transition-colors">03 // CONNECT</a>
            <a href="#explain" className="hover:text-theme-heading transition-colors">04 // EXPLAIN</a>
          </nav>

          {/* Action Header */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="px-3.5 py-2 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-mono text-xs rounded-xl border border-theme-border transition-colors font-semibold"
            >
              Officer Login
            </Link>

            <Link
              href="/login?redirect=/vasp-attribution"
              className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-theme-primary/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>ANALYZE A WALLET</span>
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO — THE MAIN WOW MOMENT */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Commanding Editorial Brand Identity */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-primary-dim border border-theme-primary/30 font-mono text-xs text-theme-primary shadow-xs">
                <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
                <span className="font-bold tracking-wider uppercase">CHAINTRACE FORENSIC ENGINE</span>
                <span className="text-theme-border">•</span>
                <span className="text-theme-text-muted">SIH 2026</span>
              </div>

              {/* Commanding Large Headline */}
              <div className="space-y-3">
                <h1 className="font-extrabold text-5xl sm:text-6xl xl:text-7xl text-theme-heading tracking-tight leading-[1.02]">
                  TRACE
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary via-cyan-500 to-emerald-500">
                    THE UNKNOWN.
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-theme-text-secondary font-medium tracking-tight">
                  Turn blockchain activity into explainable intelligence.
                </p>
              </div>

              {/* Short Clean Description */}
              <p className="text-sm sm:text-base text-theme-text-muted leading-relaxed font-sans max-w-xl">
                Investigate suspicious cryptocurrency wallets, trace transaction relationships, and uncover likely VASP connections through evidence-backed blockchain intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <Link
                  href="/login?redirect=/vasp-attribution"
                  className="px-6 py-3.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-bold text-sm rounded-xl shadow-lg shadow-theme-primary/25 transition-all flex items-center gap-2"
                >
                  <span>ANALYZE A WALLET</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>

                <a
                  href="#problem"
                  className="px-6 py-3.5 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-space font-semibold text-sm rounded-xl border border-theme-border transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  <span>EXPLORE THE ENGINE</span>
                </a>
              </div>

              {/* Supported Ledgers Strip */}
              <div className="pt-4 border-t border-theme-border/60 flex items-center gap-2 flex-wrap font-mono text-[11px] text-theme-text-muted">
                <span className="text-theme-heading font-semibold uppercase tracking-wider">SUPPORTED PROTOCOLS:</span>
                {['ETHEREUM', 'TRON (TRC20)', 'POLYGON', 'BITCOIN', 'SOLANA', 'LAYERZERO'].map((chain) => (
                  <span key={chain} className="px-2.5 py-1 rounded-lg bg-theme-surface-secondary border border-theme-border text-theme-fg text-[10px] font-medium">
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: THE TRACE CORE (Hero 3D-Inspired Visual) */}
            <div className="lg:col-span-5 relative">
              <TraceCoreVisual />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE INVESTIGATION PROBLEM */}
      <section id="problem" className="relative py-20 bg-theme-surface-subtle/50 border-t border-theme-border z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
              01 // THE INVESTIGATION CHALLENGE
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-theme-heading tracking-tight">
              UNKNOWN WALLETS.
              <br />
              HIDDEN CONNECTIONS.
            </h2>
            <p className="text-base text-theme-text-secondary font-sans leading-relaxed">
              Suspicious crypto wallets can move funds across multiple transactions, chains, and intermediary addresses. Identifying the relevant Virtual Asset Service Provider (VASP) requires structured, evidence-backed blockchain investigation.
            </p>
          </div>

          {/* Minimal Transaction Journey Visual */}
          <InvestigationJourney />
        </div>
      </section>

      {/* SECTION 3: HOW CHAINTRACE WORKS (3-STEP PROCESS) */}
      <section id="unknown" className="relative py-20 bg-theme-surface border-t border-theme-border z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
              02 // METHODOLOGY
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-theme-heading tracking-tight">
              FROM TRANSACTIONS
              <br />
              TO INTELLIGENCE.
            </h2>
            <p className="text-sm text-theme-text-muted">
              How CHAINTRACE converts raw ledger event streams into court-admissible VASP attribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Trace */}
            <div id="trace" className="p-7 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/50 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-theme-primary-dim text-theme-primary font-mono text-xs font-bold border border-theme-primary/20">
                    01 — TRACE
                  </span>
                  <span className="material-symbols-outlined text-theme-primary text-[24px]">account_tree</span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">
                  Multi-Hop Ledger Ingestion
                </h3>
                <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                  Explore wallet activity across EVM, Tron, Polygon, and UTXO networks. Detect rapid peeling, cyclic splitting, and mixer obfuscation via bounded BFS graph traversal.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-[11px] text-theme-text-secondary flex items-center justify-between">
                <span>BFS Multi-Hop Depth</span>
                <span className="font-bold text-theme-heading">1 - 4 Hops</span>
              </div>
            </div>

            {/* Step 2: Connect */}
            <div id="connect" className="p-7 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/50 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                    02 — CONNECT
                  </span>
                  <span className="material-symbols-outlined text-purple-500 text-[24px]">shuffle</span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">
                  Bridge &amp; Cluster Correlation
                </h3>
                <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                  Correlate cross-chain bridge events (LayerZero, Stargate, Wormhole) and co-spending clusters to bridge money mule layers directly to regulated custodial deposit gateways.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-[11px] text-theme-text-secondary flex items-center justify-between">
                <span>VASP Database Registry</span>
                <span className="font-bold text-theme-heading">46+ Entities</span>
              </div>
            </div>

            {/* Step 3: Explain */}
            <div id="explain" className="p-7 rounded-2xl bg-theme-surface-subtle border border-theme-border shadow-sm space-y-4 hover:border-theme-primary/50 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                    03 — EXPLAIN
                  </span>
                  <span className="material-symbols-outlined text-emerald-500 text-[24px]">gavel</span>
                </div>
                <h3 className="font-space font-bold text-xl text-theme-heading">
                  7-Signal Mathematical Proof
                </h3>
                <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                  Generate evidence-backed attribution with confidence bands, signal breakdown, and zero-guessing refusal protocol. Output court-admissible Section 65B PDF certificates.
                </p>
              </div>
              <div className="pt-4 border-t border-theme-border font-mono text-[11px] text-theme-text-secondary flex items-center justify-between">
                <span>Statutory Compliance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Section 65B</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE INTELLIGENCE ENGINE (CAPABILITY SHOWCASE) */}
      <section id="architecture" className="relative py-20 bg-theme-surface-subtle/50 border-t border-theme-border z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
              03 // CORE CAPABILITIES
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-theme-heading tracking-tight">
              BUILT FOR
              <br />
              INVESTIGATION.
            </h2>
            <p className="text-base text-theme-text-secondary font-sans leading-relaxed">
              Designed to meet the stringent standards of law enforcement agencies, FIU-IND compliance units, and digital forensics laboratories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
            {/* Capability 1 */}
            <div className="p-6 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-3 hover:border-theme-primary/40 transition-colors">
              <span className="material-symbols-outlined text-theme-primary text-[28px]">hub</span>
              <h3 className="font-space font-bold text-lg text-theme-heading">Multi-Chain Tracing</h3>
              <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                Native normalization for Ethereum, Polygon, Tron, Bitcoin, Solana, and cross-chain bridge protocols with zero data loss.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-3 hover:border-theme-primary/40 transition-colors">
              <span className="material-symbols-outlined text-theme-accent text-[28px]">account_balance</span>
              <h3 className="font-space font-bold text-lg text-theme-heading">VASP Attribution</h3>
              <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                Automated matching against verified Indian and global VASP deposit clusters with entity ownership verification.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-3 hover:border-theme-primary/40 transition-colors">
              <span className="material-symbols-outlined text-amber-500 text-[28px]">analytics</span>
              <h3 className="font-space font-bold text-lg text-theme-heading">Explainable Confidence</h3>
              <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                Deterministic mathematical scoring with transparent signal weights and anti-overclaiming threshold containment.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 rounded-2xl bg-theme-surface border border-theme-border shadow-sm space-y-3 hover:border-theme-primary/40 transition-colors">
              <span className="material-symbols-outlined text-emerald-500 text-[28px]">verified_user</span>
              <h3 className="font-space font-bold text-lg text-theme-heading">Court-Ready Reports</h3>
              <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
                Export cryptographic Section 65B certificates formatted for Bharatiya Sakshya Adhiniyam court admissibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRODUCT PREVIEW — THE INTELLIGENCE WORKBENCH */}
      <section className="relative py-20 bg-theme-surface border-t border-theme-border z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
                04 // PRODUCT WORKSPACE
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-theme-heading tracking-tight">
                THE INTELLIGENCE WORKBENCH.
              </h2>
            </div>
            <Link
              href="/login?redirect=/vasp-attribution"
              className="text-xs font-mono text-theme-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Launch Live Investigation Desk</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Scaled Product Preview Mockup */}
          <div className="rounded-2xl border border-theme-border bg-theme-surface-subtle p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Mini Preview 1: Graph Topology */}
              <div className="lg:col-span-7 bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-theme-border pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-theme-heading">FUND FLOW GRAPH // TOPOLOGY MATRIX</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-theme-surface-secondary text-theme-text-muted text-[10px] font-bold">
                    6 NODES • 3 HOPS
                  </span>
                </div>

                <div className="py-6 flex items-center justify-between gap-2 overflow-x-auto font-mono text-xs">
                  <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-center shrink-0">
                    <div className="font-bold">SUSPECT ZERO</div>
                    <div className="text-[10px] text-theme-text-muted">0x7A91...4F82</div>
                  </div>
                  <span className="text-theme-border">→</span>
                  <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-center shrink-0">
                    <div className="font-bold">LAYERZERO</div>
                    <div className="text-[10px] text-theme-text-muted">Bridge Hop 1</div>
                  </div>
                  <span className="text-theme-border">→</span>
                  <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-center shrink-0">
                    <div className="font-bold">MULE LAYER</div>
                    <div className="text-[10px] text-theme-text-muted">Split Hop 2</div>
                  </div>
                  <span className="text-theme-border">→</span>
                  <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-center shrink-0">
                    <div className="font-bold">COINDCX</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">96.8% VASP</div>
                  </div>
                </div>
              </div>

              {/* Mini Preview 2: Forensic Score & Evidence */}
              <div className="lg:col-span-5 bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-theme-border pb-3 font-mono text-xs">
                  <span className="font-bold text-theme-heading uppercase">7-Signal Score</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Court Admissible</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-space font-extrabold text-4xl text-emerald-600 dark:text-emerald-400">96.8%</span>
                  <span className="font-mono text-xs text-theme-text-muted">Weighted Confidence</span>
                </div>

                <div className="w-full bg-theme-surface-secondary h-2.5 rounded-full overflow-hidden border border-theme-border">
                  <div className="h-full bg-gradient-to-r from-theme-primary to-emerald-500 w-[96.8%]"></div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-theme-text-muted space-y-1">
                  <div>Entity: <strong className="text-theme-heading">CoinDCX (Neblio Tech Pvt Ltd)</strong></div>
                  <div>Provenance: <strong className="text-emerald-600 dark:text-emerald-400">Section 65B Certificate Verified</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA & INSTITUTIONAL FOOTER */}
      <section className="relative py-24 bg-theme-surface-subtle/70 border-t border-theme-border z-10 transition-colors text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-theme-primary font-bold">
              READY FOR INVESTIGATION
            </span>
            <h2 className="font-extrabold text-4xl sm:text-5xl text-theme-heading tracking-tight">
              EVERY WALLET
              <br />
              LEAVES A TRACE.
            </h2>
            <p className="text-base text-theme-text-secondary font-sans max-w-xl mx-auto leading-relaxed">
              Turn complex blockchain activity into actionable investigative intelligence with court-admissible VASP attribution.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?redirect=/vasp-attribution"
              className="inline-flex items-center gap-2 px-8 py-4 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-bold text-sm rounded-xl shadow-xl shadow-theme-primary/30 transition-all"
            >
              <span>ANALYZE A WALLET</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="mt-auto border-t border-theme-border bg-theme-surface/90 backdrop-blur-md py-8 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-theme-text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-theme-heading">CHAINTRACE // BLOCKCHAIN INTELLIGENCE</span>
              <span>•</span>
              <span>SMART INDIA HACKATHON 2026</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-theme-heading transition-colors">Officer Enclave</Link>
              <span>•</span>
              <Link href="/dashboard" className="hover:text-theme-heading transition-colors">Investigation Desk</Link>
              <span>•</span>
              <Link href="/reports" className="hover:text-theme-heading transition-colors">Section 65B Notices</Link>
            </div>
          </div>
          <div className="text-[11px] font-mono text-theme-text-muted text-center sm:text-left border-t border-theme-border/60 pt-4">
            FIU-IND &amp; PMLA Compliant Digital Evidence Architecture • Bharatiya Sakshya Adhiniyam Section 65B Standard.
          </div>
        </div>
      </footer>
    </div>
  );
}

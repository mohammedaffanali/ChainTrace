'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { CASES, WALLETS, TRANSACTIONS, VASP_LIST, KPIS } from '@/lib/data';
import { PRIMARY_DEMO_WALLET, DemoChain } from '@/lib/blockchain';
type SupportedChain = DemoChain;

export default function DashboardPage() {
  const router = useRouter();
  const [selectedChainFilter, setSelectedChainFilter] = useState('ALL');

  // VASP Attribution Quick Bar State
  const [quickWallet, setQuickWallet] = useState(PRIMARY_DEMO_WALLET.address);
  const [quickChain, setQuickChain] = useState<SupportedChain>('AUTO');

  const handleQuickAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    const targetWallet = quickWallet.trim() || PRIMARY_DEMO_WALLET.address;
    router.push(`/vasp-attribution?wallet=${encodeURIComponent(targetWallet)}&chain=${encodeURIComponent(quickChain)}`);
  };

  const filteredTransactions = selectedChainFilter === 'ALL'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(t => t.chain.toLowerCase().includes(selectedChainFilter.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Operational Telemetry Bar & Context Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-theme-accent animate-pulse"></span>
              <span className="font-mono text-[11px] text-theme-accent uppercase tracking-wider font-semibold">
                OPERATIONAL NODE // CLUSTER-04 // VASP ATTRIBUTION DESK
              </span>
              <span className="text-theme-border">•</span>
              <span className="font-mono text-[11px] text-theme-text-muted">CONTROLLED DEMONSTRATION ENVIRONMENT</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <h1 className="font-space font-bold text-2xl text-theme-heading tracking-tight">
                Intelligence Command Center
              </h1>
              <span className="font-mono text-[11px] text-theme-text-muted bg-theme-surface-secondary px-2.5 py-0.5 rounded border border-theme-border">
                EPOCH: 18,294,002
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
            <div className="flex items-center bg-theme-surface-secondary px-3 py-1.5 rounded-md border border-theme-border gap-2">
              <span className="material-symbols-outlined text-theme-accent text-[16px] animate-spin">
                sync
              </span>
              <span className="font-mono text-[11px] text-theme-fg">
                API INGESTION ACTIVE (3s ago)
              </span>
            </div>
            <Link
              href="/vasp-attribution"
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-semibold text-xs px-4 py-2 rounded-md shadow-md shadow-blue-600/20 transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Launch Attribution Engine</span>
            </Link>
          </div>
        </div>

        {/* SECTION 33: PRIMARY DASHBOARD ACTION — AUTOMATED VASP ATTRIBUTION */}
        <div className="relative overflow-hidden rounded-xl border-2 border-theme-primary/40 bg-gradient-to-br from-theme-surface via-theme-surface to-theme-surface-secondary p-5 shadow-lg transition-colors">
          {/* Subtle background tech grid */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-theme-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-theme-primary animate-ping"></span>
                  <span className="font-mono text-[11px] text-theme-primary font-bold uppercase tracking-widest">
                    PRIMARY FORENSIC ACTION // CHAINTRACE
                  </span>
                  <span className="px-2 py-0.5 rounded bg-theme-surface-secondary text-theme-gold font-mono text-[10px] border border-theme-border font-semibold">
                    AUTOMATED ATTRIBUTION
                  </span>
                </div>
                <h2 className="font-space font-bold text-xl text-theme-heading mt-1">
                  AUTOMATED VASP ATTRIBUTION
                </h2>
                <p className="text-xs text-theme-text-secondary mt-0.5">
                  Start with an unknown wallet and automatically determine its nearest attributed Virtual Asset Service Provider.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickWallet(PRIMARY_DEMO_WALLET.address)}
                  className="px-2.5 py-1 rounded bg-theme-surface-secondary hover:bg-theme-surface text-theme-primary font-mono text-[11px] border border-theme-border transition-colors font-medium shadow-xs"
                >
                  Load Demo Suspect Wallet (0x7A91...4F82)
                </button>
              </div>
            </div>

            {/* Quick Action Form */}
            <form onSubmit={handleQuickAttribute} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-7 relative">
                <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                  Enter Cryptocurrency Wallet Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                    account_balance_wallet
                  </span>
                  <input
                    type="text"
                    required
                    value={quickWallet}
                    onChange={(e) => setQuickWallet(e.target.value)}
                    placeholder="Enter suspect wallet address (e.g. 0x7A91...4F82, TWk93zM..., bc1q...)"
                    className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border focus:border-theme-primary rounded-md text-theme-fg font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                  Blockchain Network
                </label>
                <select
                  value={quickChain}
                  onChange={(e) => setQuickChain(e.target.value as SupportedChain)}
                  className="w-full h-10 px-3 bg-theme-surface-secondary border border-theme-border focus:border-theme-primary rounded-md text-theme-fg font-mono text-xs focus:outline-none transition-colors"
                >
                  <option value="AUTO">AUTO DETECT</option>
                  <option value="BITCOIN">BITCOIN (BTC)</option>
                  <option value="ETHEREUM">ETHEREUM (ETH)</option>
                  <option value="TRON">TRON (TRC20)</option>
                  <option value="BNB CHAIN">BNB CHAIN (BSC)</option>
                  <option value="SOLANA">SOLANA (SOL)</option>
                  <option value="POLYGON">POLYGON (MATIC)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-5">
                <button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-bold text-xs uppercase tracking-wider rounded-md shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]">radar</span>
                  <span>TRACE &amp; ATTRIBUTE</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIH Core Problem KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* KPI 1 */}
          <div className="flex flex-col justify-between p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-theme-text-muted uppercase font-semibold">Wallets Analyzed</span>
              <span className="px-2 py-0.5 rounded-full bg-theme-surface-secondary text-theme-primary font-mono text-[10px] border border-theme-border font-bold">
                6 Chains
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space font-bold text-3xl text-theme-heading">{KPIS.walletsAnalyzed}</span>
              <span className="font-mono text-xs text-theme-primary flex items-center">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Automated
              </span>
            </div>
            <div className="mt-2 text-theme-text-muted text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-theme-text-muted">hub</span>
              <span>Multi-hop cluster mapping</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col justify-between p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-theme-text-muted uppercase font-semibold">VASP Attributions</span>
              <span className="px-2 py-0.5 rounded-full bg-theme-surface-secondary text-theme-success font-mono text-[10px] border border-theme-border font-bold">
                Resolved
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space font-bold text-3xl text-theme-success">{KPIS.vaspAttributions}</span>
              <span className="font-mono text-xs text-theme-success font-bold">
                512 Exit Nodes
              </span>
            </div>
            <div className="mt-2 text-theme-text-muted text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-theme-success">verified</span>
              <span>Deposit Pattern Matching</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col justify-between p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-theme-text-muted uppercase font-semibold">High Confidence (&gt;90%)</span>
              <span className="px-2 py-0.5 rounded-full bg-theme-surface-secondary text-theme-accent font-mono text-[10px] border border-theme-border font-bold">
                {KPIS.vaspConfidence}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space font-bold text-3xl text-theme-accent">468</span>
              <span className="font-mono text-xs text-theme-accent font-bold">91.4% Avg</span>
            </div>
            <div className="mt-2 text-theme-text-muted text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-theme-text-muted">fact_check</span>
              <span>7-Signal Corroboration</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="flex flex-col justify-between p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-theme-text-muted uppercase font-semibold">Multi-Chain Traces</span>
              <span className="px-2 py-0.5 rounded-full bg-theme-surface-secondary text-purple-600 dark:text-purple-400 font-mono text-[10px] border border-theme-border font-bold">
                Bridge Relays
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space font-bold text-3xl text-purple-600 dark:text-purple-400">184</span>
              <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">LayerZero / Wormhole</span>
            </div>
            <div className="mt-2 text-theme-text-muted text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-theme-text-muted">shuffle</span>
              <span>Cross-ledger correlation</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="flex flex-col justify-between p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-theme-text-muted uppercase font-semibold">Active Investigations</span>
              <span className="px-2 py-0.5 rounded-full bg-theme-surface-secondary text-theme-gold font-mono text-[10px] border border-theme-border font-bold">
                {KPIS.activeCasesTrend}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-space font-bold text-3xl text-theme-gold">{KPIS.activeCases}</span>
              <span className="font-mono text-xs text-theme-gold font-bold">Priority Dockets</span>
            </div>
            <div className="mt-2 text-theme-text-muted text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-theme-text-muted">folder_open</span>
              <span>Evidentiary Freezes</span>
            </div>
          </div>
        </div>

        {/* STATUTORY VASP REPOSITORY COVERAGE BANNER */}
        <div className="bg-theme-surface p-4 rounded-xl border border-theme-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-space font-bold text-sm text-theme-heading">Statutory VASP Intelligence Vault Coverage</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  EXPANDED DATASET ACTIVE
                </span>
              </div>
              <p className="text-xs text-theme-text-muted mt-0.5 font-mono">
                Real-time registry index of FIU-registered Indian reporting entities, notified offshore exchanges, and custody clusters.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-theme-border pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Indexed VASPs</div>
              <div className="text-xl font-space font-bold text-emerald-600 dark:text-emerald-400">46 VASPs</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Attributed Clusters</div>
              <div className="text-xl font-space font-bold text-blue-600 dark:text-blue-400">28 Clusters</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Deposit Nodes</div>
              <div className="text-xl font-space font-bold text-cyan-600 dark:text-cyan-400">47 Addresses</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Active Cases & Target Wallets Under Trace */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Active Investigations Register (2 Cols) */}
          <div className="xl:col-span-2 bg-theme-surface rounded-xl border border-theme-border shadow-sm flex flex-col overflow-hidden transition-colors">
            <div className="p-4 bg-theme-surface-secondary/70 border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-theme-primary text-[20px]">folder_supervised</span>
                <div>
                  <h2 className="font-space font-semibold text-sm text-theme-heading">Active Case Dossiers</h2>
                  <p className="text-[11px] font-mono text-theme-text-muted">Forensic Inquiries with Attributed Virtual Asset Gateways</p>
                </div>
              </div>
              <Link
                href="/investigations"
                className="font-mono text-xs text-theme-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full Register</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="divide-y divide-theme-border overflow-x-auto">
              {CASES.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-theme-surface-secondary/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-theme-primary px-1.5 py-0.5 rounded bg-theme-surface-secondary border border-theme-border">
                        {c.id}
                      </span>
                      <span className="font-space font-semibold text-sm text-theme-heading truncate">
                        {c.title}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded border font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700/50'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-theme-text-secondary flex-wrap">
                      <span>Lead: <strong className="text-theme-heading">{c.leadOfficer}</strong></span>
                      <span>•</span>
                      <span>{c.agency}</span>
                      <span>•</span>
                      <span>Attributed VASP: <strong className="text-theme-accent">{c.associatedVasp}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-between">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-theme-success">
                        {c.totalExposureINR}
                      </div>
                      <div className="font-mono text-[10px] text-theme-text-muted">Total Exposure</div>
                    </div>
                    <Link
                      href={`/investigations/${c.id}`}
                      className="px-3 py-1 rounded bg-theme-surface-secondary hover:bg-theme-primary hover:text-white text-xs font-mono text-theme-fg border border-theme-border transition-all"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Wallets & Counterparty Radar (1 Col) */}
          <div className="bg-theme-surface rounded-xl border border-theme-border shadow-sm flex flex-col overflow-hidden transition-colors">
            <div className="p-4 bg-theme-surface-secondary/70 border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-theme-danger animate-ping"></span>
                <h2 className="font-space font-semibold text-sm text-theme-heading">Target Wallets Under Trace</h2>
              </div>
              <Link href="/wallet-intelligence" className="font-mono text-xs text-theme-primary hover:underline font-semibold">
                Matrix →
              </Link>
            </div>

            <div className="p-3 space-y-2.5 overflow-y-auto max-h-[420px]">
              {WALLETS.slice(0, 4).map((w) => (
                <div
                  key={w.address}
                  className="p-3 rounded-lg bg-theme-surface-secondary/60 border border-theme-border hover:border-theme-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-theme-surface text-theme-accent border border-theme-border font-semibold">
                        {w.chain}
                      </span>
                      <CopyBadge text={w.address} />
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        w.threatLevel === 'CRITICAL'
                          ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700/50'
                          : w.threatLevel === 'VERIFIED'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
                      }`}
                    >
                      {w.threatLevel}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-medium text-theme-heading">
                    {w.clusterLabel}
                  </div>

                  <div className="mt-2 pt-2 border-t border-theme-border flex items-center justify-between text-xs font-mono">
                    <span className="text-theme-text-muted">Hops to VASP: <strong className="text-theme-accent">{w.hopsToCashout}</strong></span>
                    <Link
                      href={`/vasp-attribution?wallet=${encodeURIComponent(w.address)}&chain=${encodeURIComponent(w.chain)}`}
                      className="text-xs text-theme-primary hover:underline font-mono font-semibold"
                    >
                      Attribute →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Forensic Ledger Stream */}
        <div className="bg-theme-surface rounded-xl border border-theme-border shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="p-4 bg-theme-surface-secondary/70 border-b border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-theme-accent text-[20px]">receipt_long</span>
              <div>
                <h2 className="font-space font-semibold text-sm text-theme-heading">
                  Live Intercept Feed &amp; High-Velocity Hops
                </h2>
                <p className="text-[11px] font-mono text-theme-text-muted">
                  Automated Mempool Ingestion across TRON (TRC20), ETH, BTC, and SOL
                </p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'TRON', 'ETHEREUM', 'BITCOIN', 'CROSS-CHAIN'].map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedChainFilter(chain)}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-medium border transition-colors ${
                    selectedChainFilter === chain
                      ? 'bg-theme-primary text-white border-theme-primary'
                      : 'bg-theme-surface-secondary text-theme-text-secondary border-theme-border hover:text-theme-heading'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-surface-secondary/60 border-b border-theme-border font-mono text-[11px] text-theme-text-muted uppercase">
                <tr>
                  <th className="py-2.5 px-4">TX Hash / Network</th>
                  <th className="py-2.5 px-4">Origin Entity</th>
                  <th className="py-2.5 px-4">Destination Counterparty</th>
                  <th className="py-2.5 px-4 text-right">Crypto Volume</th>
                  <th className="py-2.5 px-4 text-right">Valuation (INR)</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border font-mono">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.txHash} className="hover:bg-theme-surface-secondary/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <CopyBadge text={tx.txHash} display={tx.txHash.slice(0, 14) + '...'} />
                        <span className="text-[10px] text-theme-accent mt-1">{tx.chain}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-theme-heading font-sans text-xs font-medium">{tx.fromLabel}</div>
                      <span className="text-[10px] text-theme-text-muted">{tx.fromAddress}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-theme-heading font-sans text-xs font-medium">{tx.toLabel}</div>
                      <span className="text-[10px] text-theme-text-muted">{tx.toAddress}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-theme-heading font-semibold">
                      {tx.amountCrypto}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-theme-success">
                      {tx.amountINR}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-theme-surface-secondary text-theme-primary text-[10px] border border-theme-border font-semibold">
                        {tx.riskCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.status === 'INTERCEPTED'
                            ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700/50'
                            : tx.status === 'FLAGGED_MIXER'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitored VASP Compliance Registry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VASP_LIST.slice(0, 3).map((v) => (
            <div
              key={v.id}
              className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-xs flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40 font-semibold">
                    REGULATED VASP
                  </span>
                  <span className="font-mono text-xs text-theme-success font-bold">
                    KYC: {v.kycComplianceScore}%
                  </span>
                </div>
                <h3 className="font-space font-semibold text-sm text-theme-heading mt-2">
                  {v.name}
                </h3>
                <p className="font-mono text-[10px] text-theme-text-muted mt-0.5">
                  Registration: {v.fiuRegNo}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs font-mono">
                <span className="text-theme-text-muted">24h Volume: <strong className="text-theme-heading">{v.estimatedVolume24hINR}</strong></span>
                <Link
                  href={`/vasp-attribution#directory`}
                  className="text-theme-primary hover:underline text-xs font-semibold"
                >
                  Inspect Gateway →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

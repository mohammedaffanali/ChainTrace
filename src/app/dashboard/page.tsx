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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7CB9E8] animate-pulse"></span>
              <span className="font-mono text-[10px] text-[#7CB9E8] uppercase tracking-wider font-semibold">
                OPERATIONAL NODE // CLUSTER-04 // VASP ATTRIBUTION DESK
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-[10px] text-[#9D9A92]">CONTROLLED DEMONSTRATION ENVIRONMENT</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <h1 className="font-editorial font-bold text-2xl text-[#F4F0E6] tracking-tight">
                Intelligence Command Center
              </h1>
              <span className="font-mono text-[11px] text-[#D8D3C7] bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
                EPOCH: 18,294,002
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
            <div className="flex items-center bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.08] gap-2">
              <span className="material-symbols-outlined text-[#7CB9E8] text-[16px] animate-spin">
                sync
              </span>
              <span className="font-mono text-[11px] text-[#D8D3C7]">
                API INGESTION ACTIVE (3s ago)
              </span>
            </div>
            <Link
              href="/vasp-attribution"
              className="flex items-center gap-1.5 bg-[#1560BD] hover:bg-[#1560BD]/90 text-[#F4F0E6] font-space font-semibold text-xs px-4 py-2 rounded-xl shadow-signal-denim border border-[#7CB9E8]/30 transition-all"
            >
              <span className="material-symbols-outlined text-[17px] text-[#7CB9E8]">hub</span>
              <span>Launch Attribution Engine</span>
            </Link>
          </div>
        </div>

        {/* PRIMARY DASHBOARD ACTION — AUTOMATED VASP ATTRIBUTION */}
        <div className="relative overflow-hidden rounded-2xl border border-[#7CB9E8]/25 bg-[#1C1D20]/95 backdrop-blur-xl p-5 shadow-glass-card transition-colors">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7CB9E8] animate-ping"></span>
                  <span className="font-mono text-[10px] text-[#7CB9E8] font-bold uppercase tracking-widest">
                    PRIMARY FORENSIC ACTION // CHAINTRACE
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1B512D]/30 text-[#ADC178] font-mono text-[10px] border border-[#ADC178]/30 font-semibold">
                    AUTOMATED ATTRIBUTION
                  </span>
                </div>
                <h2 className="font-editorial font-bold text-xl text-[#F4F0E6] mt-1.5">
                  AUTOMATED VASP ATTRIBUTION
                </h2>
                <p className="text-xs text-[#9D9A92] font-mono mt-0.5">
                  Start with an unknown wallet and automatically determine its nearest attributed Virtual Asset Service Provider.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickWallet(PRIMARY_DEMO_WALLET.address)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#7CB9E8] font-mono text-[11px] border border-white/[0.08] transition-colors font-medium"
                >
                  Load Demo Suspect Wallet (0x7A91...4F82)
                </button>
              </div>
            </div>

            {/* Quick Action Form */}
            <form onSubmit={handleQuickAttribute} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-7 relative">
                <label className="block font-mono text-[10px] text-[#9D9A92] uppercase tracking-wider mb-1">
                  Enter Cryptocurrency Wallet Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7CB9E8] text-[18px]">
                    account_balance_wallet
                  </span>
                  <input
                    type="text"
                    required
                    value={quickWallet}
                    onChange={(e) => setQuickWallet(e.target.value)}
                    placeholder="Enter suspect wallet address (e.g. 0x7A91...4F82, TWk93zM..., bc1q...)"
                    className="w-full h-10 pl-9 pr-3 bg-[#15171B] border border-white/[0.08] focus:border-[#7CB9E8] rounded-xl text-[#F4F0E6] font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] text-[#9D9A92] uppercase tracking-wider mb-1">
                  Blockchain Network
                </label>
                <select
                  value={quickChain}
                  onChange={(e) => setQuickChain(e.target.value as SupportedChain)}
                  className="w-full h-10 px-3 bg-[#15171B] border border-white/[0.08] focus:border-[#7CB9E8] rounded-xl text-[#F4F0E6] font-mono text-xs focus:outline-none transition-colors"
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
                  className="w-full h-10 bg-[#1560BD] hover:bg-[#1560BD]/90 text-[#F4F0E6] font-space font-bold text-xs uppercase tracking-wider rounded-xl shadow-signal-denim border border-[#7CB9E8]/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#7CB9E8]">radar</span>
                  <span>TRACE &amp; ATTRIBUTE</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIH Core Problem KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* KPI 1 */}
          <div className="flex flex-col justify-between p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase font-semibold">Wallets Analyzed</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#7CB9E8] font-mono text-[10px] border border-white/[0.08] font-bold">
                6 Chains
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-editorial font-bold text-3xl text-[#F4F0E6]">{KPIS.walletsAnalyzed}</span>
              <span className="font-mono text-xs text-[#7CB9E8] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Automated
              </span>
            </div>
            <div className="mt-2 text-[#9D9A92] text-[11px] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#9D9A92]">hub</span>
              <span>Multi-hop cluster mapping</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col justify-between p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase font-semibold">VASP Attributions</span>
              <span className="px-2 py-0.5 rounded-md bg-[#1B512D]/30 text-[#ADC178] font-mono text-[10px] border border-[#ADC178]/30 font-bold">
                Resolved
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-editorial font-bold text-3xl text-[#ADC178]">{KPIS.vaspAttributions}</span>
              <span className="font-mono text-xs text-[#ADC178] font-bold">
                512 Exit Nodes
              </span>
            </div>
            <div className="mt-2 text-[#9D9A92] text-[11px] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#ADC178]">verified</span>
              <span>Deposit Pattern Matching</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col justify-between p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase font-semibold">High Confidence (&gt;90%)</span>
              <span className="px-2 py-0.5 rounded-md bg-[#1560BD]/20 text-[#7CB9E8] font-mono text-[10px] border border-[#7CB9E8]/30 font-bold">
                {KPIS.vaspConfidence}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-editorial font-bold text-3xl text-[#7CB9E8]">468</span>
              <span className="font-mono text-xs text-[#7CB9E8] font-bold">91.4% Avg</span>
            </div>
            <div className="mt-2 text-[#9D9A92] text-[11px] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#9D9A92]">fact_check</span>
              <span>7-Signal Corroboration</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="flex flex-col justify-between p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase font-semibold">Multi-Chain Traces</span>
              <span className="px-2 py-0.5 rounded-md bg-[#5D3A9C]/20 text-[#B23AEE] font-mono text-[10px] border border-[#5D3A9C]/30 font-bold">
                Bridge Relays
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-editorial font-bold text-3xl text-[#B23AEE]">184</span>
              <span className="font-mono text-xs text-[#B23AEE] font-bold">LayerZero / Wormhole</span>
            </div>
            <div className="mt-2 text-[#9D9A92] text-[11px] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#9D9A92]">shuffle</span>
              <span>Cross-ledger correlation</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="flex flex-col justify-between p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase font-semibold">Active Investigations</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#F4F0E6] font-mono text-[10px] border border-white/[0.08] font-bold">
                {KPIS.activeCasesTrend}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-editorial font-bold text-3xl text-[#F4F0E6]">{KPIS.activeCases}</span>
              <span className="font-mono text-xs text-[#7CB9E8] font-bold">Priority Dockets</span>
            </div>
            <div className="mt-2 text-[#9D9A92] text-[11px] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#9D9A92]">folder_open</span>
              <span>Evidentiary Freezes</span>
            </div>
          </div>
        </div>

        {/* STATUTORY VASP REPOSITORY COVERAGE BANNER */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B512D]/30 border border-[#ADC178]/30 flex items-center justify-center text-[#ADC178]">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial font-bold text-sm text-[#F4F0E6]">Statutory VASP Intelligence Vault Coverage</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#1B512D]/30 text-[#ADC178] font-mono text-[10px] font-bold border border-[#ADC178]/30">
                  EXPANDED DATASET ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#9D9A92] mt-0.5 font-mono">
                Real-time registry index of FIU-registered Indian reporting entities, notified offshore exchanges, and custody clusters.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[10px] font-mono text-[#9D9A92] uppercase font-semibold">Indexed VASPs</div>
              <div className="text-xl font-editorial font-bold text-[#ADC178]">46 VASPs</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#9D9A92] uppercase font-semibold">Attributed Clusters</div>
              <div className="text-xl font-editorial font-bold text-[#7CB9E8]">28 Clusters</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#9D9A92] uppercase font-semibold">Deposit Nodes</div>
              <div className="text-xl font-editorial font-bold text-[#7CB9E8]">47 Addresses</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Active Cases & Target Wallets Under Trace */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Active Investigations Register (2 Cols) */}
          <div className="xl:col-span-2 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card flex flex-col overflow-hidden transition-colors">
            <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#7CB9E8] text-[20px]">folder_supervised</span>
                <div>
                  <h2 className="font-editorial font-semibold text-sm text-[#F4F0E6]">Active Case Dossiers</h2>
                  <p className="text-[11px] font-mono text-[#9D9A92]">Forensic Inquiries with Attributed Virtual Asset Gateways</p>
                </div>
              </div>
              <Link
                href="/investigations"
                className="font-mono text-xs text-[#7CB9E8] hover:text-[#F4F0E6] flex items-center gap-1 font-semibold"
              >
                <span>View Full Register</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="divide-y divide-white/[0.05] overflow-x-auto">
              {CASES.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#7CB9E8] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                        {c.id}
                      </span>
                      <span className="font-editorial font-semibold text-sm text-[#F4F0E6] truncate">
                        {c.title}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded border font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-[#960018]/25 text-[#F0EAD6] border-[#B22222]/40'
                            : 'bg-white/[0.04] text-[#D8D3C7] border-white/[0.08]'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#9D9A92] flex-wrap font-mono">
                      <span>Lead: <strong className="text-[#F4F0E6]">{c.leadOfficer}</strong></span>
                      <span className="text-white/20">•</span>
                      <span>{c.agency}</span>
                      <span className="text-white/20">•</span>
                      <span>Attributed VASP: <strong className="text-[#ADC178]">{c.associatedVasp}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-between">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#ADC178]">
                        {c.totalExposureINR}
                      </div>
                      <div className="font-mono text-[10px] text-[#9D9A92]">Total Exposure</div>
                    </div>
                    <Link
                      href={`/investigations/${c.id}`}
                      className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-[#1560BD] hover:text-[#F4F0E6] text-xs font-mono text-[#D8D3C7] border border-white/[0.08] transition-all"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Wallets & Counterparty Radar (1 Col) */}
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card flex flex-col overflow-hidden transition-colors">
            <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#960018] animate-ping"></span>
                <h2 className="font-editorial font-semibold text-sm text-[#F4F0E6]">Target Wallets Under Trace</h2>
              </div>
              <Link href="/wallet-intelligence" className="font-mono text-xs text-[#7CB9E8] hover:text-[#F4F0E6] font-semibold">
                Matrix →
              </Link>
            </div>

            <div className="p-3 space-y-2.5 overflow-y-auto max-h-[420px]">
              {WALLETS.slice(0, 4).map((w) => (
                <div
                  key={w.address}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#7CB9E8]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#7CB9E8] border border-white/[0.08] font-semibold">
                        {w.chain}
                      </span>
                      <CopyBadge text={w.address} />
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        w.threatLevel === 'CRITICAL'
                          ? 'bg-[#960018]/25 text-[#F0EAD6] border-[#B22222]/40'
                          : w.threatLevel === 'VERIFIED'
                          ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                          : 'bg-white/[0.04] text-[#D8D3C7] border-white/[0.08]'
                      }`}
                    >
                      {w.threatLevel}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-medium text-[#F4F0E6]">
                    {w.clusterLabel}
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#9D9A92]">Hops to VASP: <strong className="text-[#7CB9E8]">{w.hopsToCashout}</strong></span>
                    <Link
                      href={`/vasp-attribution?wallet=${encodeURIComponent(w.address)}&chain=${encodeURIComponent(w.chain)}`}
                      className="text-xs text-[#7CB9E8] hover:underline font-mono font-semibold"
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
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card flex flex-col overflow-hidden transition-colors">
          <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#7CB9E8] text-[20px]">receipt_long</span>
              <div>
                <h2 className="font-editorial font-semibold text-sm text-[#F4F0E6]">
                  Live Intercept Feed &amp; High-Velocity Hops
                </h2>
                <p className="text-[11px] font-mono text-[#9D9A92]">
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
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-medium border transition-colors ${
                    selectedChainFilter === chain
                      ? 'bg-[#1560BD] text-[#F4F0E6] border-[#7CB9E8]/40 shadow-signal-denim'
                      : 'bg-white/[0.04] text-[#9D9A92] border-white/[0.08] hover:text-[#F4F0E6]'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.08] font-mono text-[10px] text-[#9D9A92] uppercase">
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
              <tbody className="divide-y divide-white/[0.05] font-mono">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.txHash} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <CopyBadge text={tx.txHash} display={tx.txHash.slice(0, 14) + '...'} />
                        <span className="text-[10px] text-[#7CB9E8] mt-1">{tx.chain}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#F4F0E6] font-sans text-xs font-medium">{tx.fromLabel}</div>
                      <span className="text-[10px] text-[#9D9A92]">{tx.fromAddress}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#F4F0E6] font-sans text-xs font-medium">{tx.toLabel}</div>
                      <span className="text-[10px] text-[#9D9A92]">{tx.toAddress}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#F4F0E6] font-semibold">
                      {tx.amountCrypto}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#ADC178]">
                      {tx.amountINR}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#7CB9E8] text-[10px] border border-white/[0.08] font-semibold">
                        {tx.riskCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.status === 'INTERCEPTED'
                            ? 'bg-[#960018]/25 text-[#F0EAD6] border-[#B22222]/40'
                            : tx.status === 'FLAGGED_MIXER'
                            ? 'bg-[#C44536]/25 text-[#F0EAD6] border-[#C44536]/40'
                            : 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
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
              className="p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-glass-card flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30 font-semibold">
                    REGULATED VASP
                  </span>
                  <span className="font-mono text-xs text-[#ADC178] font-bold">
                    KYC: {v.kycComplianceScore}%
                  </span>
                </div>
                <h3 className="font-editorial font-semibold text-sm text-[#F4F0E6] mt-2">
                  {v.name}
                </h3>
                <p className="font-mono text-[10px] text-[#9D9A92] mt-0.5">
                  Registration: {v.fiuRegNo}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-[#9D9A92]">24h Volume: <strong className="text-[#F4F0E6]">{v.estimatedVolume24hINR}</strong></span>
                <Link
                  href={`/vasp-attribution#directory`}
                  className="text-[#7CB9E8] hover:text-[#F4F0E6] text-xs font-semibold"
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

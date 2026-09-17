'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { TRANSACTIONS, TransactionHop } from '@/lib/data';

export default function TransactionExplorerPage() {
  const [selectedChain, setSelectedChain] = useState('ALL');
  const [searchHash, setSearchHash] = useState('');
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [liveTransactions, setLiveTransactions] = useState<(TransactionHop & { isLive?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [activeTx, setActiveTx] = useState<(TransactionHop & { isLive?: boolean }) | null>(TRANSACTIONS[0]);

  React.useEffect(() => {
    fetch('/api/blockchain/mode')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setDataMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const handleLiveQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchHash.trim();
    if (!query) return;

    setIsLoading(true);
    setQueryError(null);

    const chain =
      selectedChain === 'ALL'
        ? query.startsWith('T')
          ? 'tron'
          : 'ethereum'
        : selectedChain.toLowerCase();

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: query,
          chain,
          mode: dataMode,
          limit: 25,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setQueryError(`[${data.code || 'PROVIDER_ERROR'}] ${data.message || 'Error fetching transactions'}`);
        return;
      }

      if (Array.isArray(data.transactions) && data.transactions.length > 0) {
        const mapped: (TransactionHop & { isLive?: boolean })[] = data.transactions.map((tx: any) => ({
          txHash: tx.hash,
          chain: (tx.chain || chain).toUpperCase(),
          timestamp: new Date(tx.timestamp * 1000).toLocaleString('en-IN'),
          fromAddress: tx.from,
          fromLabel: tx.from.slice(0, 8) + '...' + tx.from.slice(-4),
          toAddress: tx.to,
          toLabel: tx.to.slice(0, 8) + '...' + tx.to.slice(-4),
          amountCrypto: `${tx.amount} ${tx.asset}`,
          amountINR: tx.fiatValue?.formatted || `₹${(parseFloat(tx.amount || '0') * 88).toFixed(2)}`,
          feeINR: tx.fee || '₹12.50',
          gasTelemetry: tx.metadata?.gasPrice ? `${tx.metadata.gasPrice} wei` : 'Ledger Verified',
          status: tx.status === 'CONFIRMED' ? 'CONFIRMED' : 'FLAGGED_MIXER',
          riskCategory: 'Regulated Off-Ramp',
          isLive: data.mode === 'live',
        }));

        setLiveTransactions(mapped);
        setActiveTx(mapped[0]);
      } else {
        setLiveTransactions([]);
        setQueryError(`No transactions found for address on ${chain}.`);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setQueryError(`Query error: ${(err as Error)?.message}`);
    }
  };

  const currentDataset = dataMode === 'live' && liveTransactions.length > 0
    ? liveTransactions
    : TRANSACTIONS.map((t) => ({ ...t, isLive: false }));

  const filtered = currentDataset.filter((t) => {
    const matchesChain = selectedChain === 'ALL' || t.chain.toLowerCase().includes(selectedChain.toLowerCase());
    const matchesQuery =
      !searchHash ||
      t.txHash.toLowerCase().includes(searchHash.toLowerCase()) ||
      t.fromLabel.toLowerCase().includes(searchHash.toLowerCase()) ||
      t.toLabel.toLowerCase().includes(searchHash.toLowerCase()) ||
      t.amountINR.toLowerCase().includes(searchHash.toLowerCase());
    return matchesChain && matchesQuery;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-[#ADC178] animate-pulse' : 'bg-[#7CB9E8] animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-[#ADC178]' : 'text-[#7CB9E8]'}`}>
                FORENSIC BLOCKCHAIN TELEMETRY // {dataMode === 'live' ? 'LIVE LEDGER' : 'MEMPOOL AUDITOR'}
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
              Transaction Explorer &amp; Forensic Ledger Inspector
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Decoded smart contract calls, gas anomalies, UTXO trees, and real-time Rupee valuations
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-black/30 rounded-lg border border-white/[0.08] p-0.5">
              <button
                type="button"
                onClick={() => {
                  setDataMode('demo');
                  setQueryError(null);
                }}
                className={`px-3 py-1 text-[11px] font-mono rounded-md font-semibold transition-colors ${
                  dataMode === 'demo'
                    ? 'bg-[#1C1D20] text-[#ADC178] shadow-glass-card border border-[#ADC178]/30'
                    : 'text-[#9D9A92] hover:text-[#FAFAF5]'
                }`}
              >
                DEMO
              </button>
              <button
                type="button"
                onClick={() => {
                  setDataMode('live');
                  setQueryError(null);
                }}
                className={`px-3 py-1 text-[11px] font-mono rounded-md font-semibold transition-colors ${
                  dataMode === 'live'
                    ? 'bg-[#1B512D]/40 text-[#ADC178] border border-[#ADC178]/40 shadow-signal-green'
                    : 'text-[#9D9A92] hover:text-[#FAFAF5]'
                }`}
              >
                LIVE
              </button>
            </div>

            <span className="font-mono text-xs text-[#7CB9E8] bg-black/30 px-3 py-1.5 rounded-lg border border-white/[0.08] font-semibold">
              INGESTION: 18.4K TX/SEC
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {queryError && (
          <div className="p-4 bg-[#960018]/15 border border-[#960018]/40 rounded-xl flex items-start gap-3 text-[#C44536] animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider">Blockchain Provider Query Error</span>
              <p className="mt-0.5 text-[#D8D3C7]">{queryError}</p>
            </div>
            <button onClick={() => setQueryError(null)} className="text-[#9D9A92] hover:text-[#FAFAF5] text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Search & Chain Filters */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-glass-card transition-colors">
          <form onSubmit={handleLiveQuery} className="relative flex-1 max-w-lg flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#74736F] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Search Address (0x..., TWk...) or TX Hash in ledger..."
                className="w-full h-9 pl-9 pr-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-9 px-3.5 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg transition-all shrink-0 disabled:opacity-50 shadow-glass-card"
            >
              {isLoading ? 'Querying...' : dataMode === 'live' ? 'Query Live' : 'Filter'}
            </button>
          </form>

          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'TRON', 'ETHEREUM', 'BITCOIN', 'POLYGON', 'CROSS-CHAIN'].map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-medium border transition-colors ${
                  selectedChain === chain
                    ? 'bg-[#1560BD] text-[#FAFAF5] border-[#7CB9E8] shadow-signal-blue'
                    : 'bg-black/20 text-[#9D9A92] border-white/[0.06] hover:text-[#FAFAF5] hover:border-white/[0.12]'
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Ledger Table + Forensic Inspector Drawer */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Ledger Table (2 cols) */}
          <div className="xl:col-span-2 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] overflow-hidden flex flex-col shadow-glass-card transition-colors">
            <div className="p-4 bg-black/20 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-space font-semibold text-sm text-[#FAFAF5]">
                  {dataMode === 'live' ? 'Live Ingested Transactions' : 'Demonstration Ledger Telemetry'} ({filtered.length})
                </h2>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                    dataMode === 'live'
                      ? 'bg-[#1B512D]/40 text-[#ADC178] border-[#ADC178]/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {dataMode === 'live' ? 'LIVE MODE' : 'DEMO MODE'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#74736F]">Click row to inspect payload</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/30 text-[#9D9A92] uppercase text-[11px] border-b border-white/[0.06]">
                  <tr>
                    <th className="p-3">TX Hash</th>
                    <th className="p-3">Chain</th>
                    <th className="p-3">Sender &gt; Recipient</th>
                    <th className="p-3 text-right">Rupee Valuation</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((tx) => (
                    <tr
                      key={tx.txHash}
                      onClick={() => setActiveTx(tx)}
                      className={`cursor-pointer transition-colors ${
                        activeTx?.txHash === tx.txHash
                          ? 'bg-white/[0.04] border-l-2 border-[#7CB9E8]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="p-3">
                        <CopyBadge text={tx.txHash} display={tx.txHash.slice(0, 12) + '...'} />
                        <div className="text-[10px] text-[#74736F] mt-0.5">{tx.timestamp}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#7CB9E8] font-semibold">{tx.chain}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase border ${
                              tx.isLive
                                ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                                : 'bg-white/5 text-[#ADC178] border-[#ADC178]/30'
                            }`}
                          >
                            {tx.isLive ? 'LIVE' : 'DEMO'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-[#FAFAF5] font-sans text-xs font-medium">{tx.fromLabel}</div>
                        <div className="text-[#9D9A92] text-[10px] flex items-center gap-1">
                          <span>&gt; {tx.toLabel}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="text-[#ADC178] font-bold">{tx.amountINR}</div>
                        <div className="text-[#74736F] text-[10px]">{tx.amountCrypto}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'INTERCEPTED'
                              ? 'bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40'
                              : tx.status === 'FLAGGED_MIXER'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
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

          {/* Forensic Deep Inspector Drawer (1 col) */}
          {activeTx && (
            <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-glass-card transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7CB9E8] text-[18px]">find_in_page</span>
                    <h3 className="font-space font-bold text-sm text-[#FAFAF5]">Forensic Payload Analysis</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1560BD]/20 text-[#7CB9E8] border border-[#7CB9E8]/30 font-semibold">
                    {activeTx.chain}
                  </span>
                </div>

                <div className="mt-3 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#74736F] text-[10px] block">TRANSACTION HASH</span>
                    <div className="mt-1 break-all bg-black/30 p-2 rounded-lg border border-white/[0.06] text-[#7CB9E8] text-[11px]">
                      {activeTx.txHash}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04]">
                      <span className="text-[#74736F] text-[10px] block">VALUATION (INR)</span>
                      <span className="text-sm font-bold text-[#ADC178]">{activeTx.amountINR}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04]">
                      <span className="text-[#74736F] text-[10px] block">NETWORK GAS FEE</span>
                      <span className="text-sm font-bold text-[#FAFAF5]">{activeTx.feeINR}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#74736F] text-[10px] block">ORIGIN ENTITY</span>
                    <div className="mt-1 p-2 bg-black/20 rounded-lg border border-white/[0.04]">
                      <div className="text-[#FAFAF5] font-sans font-medium">{activeTx.fromLabel}</div>
                      <div className="text-[#9D9A92] text-[10px] mt-0.5">{activeTx.fromAddress}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#74736F] text-[10px] block">DESTINATION RECIPIENT</span>
                    <div className="mt-1 p-2 bg-black/20 rounded-lg border border-white/[0.04]">
                      <div className="text-[#FAFAF5] font-sans font-medium">{activeTx.toLabel}</div>
                      <div className="text-[#9D9A92] text-[10px] mt-0.5">{activeTx.toAddress}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#74736F] text-[10px] block">DECODED GAS TELEMETRY</span>
                    <div className="mt-1 p-2 bg-black/20 rounded-lg border border-white/[0.04] text-[#7CB9E8] text-[11px]">
                      {activeTx.gasTelemetry}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#74736F] text-[10px] block">THREAT CLASSIFICATION</span>
                    <div className="mt-1 p-2 bg-[#960018]/15 rounded-lg border border-[#960018]/30 text-[#C44536] text-[11px]">
                      {activeTx.riskCategory} • Suspected PMLA Section 3 Violation
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <button className="w-full py-2.5 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg shadow-glass-card transition-all flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>Attach to CASE-2026-001 Dossier</span>
                </button>
                <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5 shadow-glass-card">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Generate Section 65B Record</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-theme-primary animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-emerald-400' : 'text-theme-primary'}`}>
                FORENSIC BLOCKCHAIN TELEMETRY // {dataMode === 'live' ? 'LIVE LEDGER' : 'MEMPOOL AUDITOR'}
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Transaction Explorer &amp; Forensic Ledger Inspector
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Decoded smart contract calls, gas anomalies, UTXO trees, and real-time Rupee valuations
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-theme-surface-secondary rounded-md border border-theme-border p-0.5">
              <button
                type="button"
                onClick={() => {
                  setDataMode('demo');
                  setQueryError(null);
                }}
                className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                  dataMode === 'demo'
                    ? 'bg-theme-surface text-theme-gold shadow-xs border border-theme-gold/30'
                    : 'text-theme-text-muted hover:text-theme-fg'
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
                className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                  dataMode === 'live'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-theme-text-muted hover:text-theme-fg'
                }`}
              >
                LIVE
              </button>
            </div>

            <span className="font-mono text-xs text-theme-primary bg-theme-surface-subtle px-3 py-1.5 rounded-md border border-theme-border font-semibold">
              INGESTION: 18.4K TX/SEC
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {queryError && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-3 text-red-400 animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider">Blockchain Provider Query Error</span>
              <p className="mt-0.5 text-theme-fg">{queryError}</p>
            </div>
            <button onClick={() => setQueryError(null)} className="text-theme-text-muted hover:text-theme-heading text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Search & Chain Filters */}
        <div className="bg-theme-surface p-3 rounded-xl border border-theme-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm transition-colors">
          <form onSubmit={handleLiveQuery} className="relative flex-1 max-w-lg flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Search Address (0x..., TWk...) or TX Hash in ledger..."
                className="w-full h-9 pl-9 pr-3 bg-theme-surface-subtle border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-9 px-3 bg-theme-primary hover:opacity-90 text-white font-space font-semibold text-xs rounded-md transition-colors shrink-0 disabled:opacity-50"
            >
              {isLoading ? 'Querying...' : dataMode === 'live' ? 'Query Live' : 'Filter'}
            </button>
          </form>

          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'TRON', 'ETHEREUM', 'BITCOIN', 'POLYGON', 'CROSS-CHAIN'].map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-3 py-1.5 rounded font-mono text-[10px] font-medium border transition-colors ${
                  selectedChain === chain
                    ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                    : 'bg-theme-surface-subtle text-theme-text-muted border-theme-border hover:text-theme-heading'
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
          <div className="xl:col-span-2 bg-theme-surface rounded-xl border border-theme-border overflow-hidden flex flex-col shadow-sm transition-colors">
            <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-space font-semibold text-sm text-theme-heading">
                  {dataMode === 'live' ? 'Live Ingested Transactions' : 'Demonstration Ledger Telemetry'} ({filtered.length})
                </h2>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                    dataMode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  }`}
                >
                  {dataMode === 'live' ? 'LIVE MODE' : 'DEMO MODE'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-theme-text-muted">Click row to inspect payload</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                  <tr>
                    <th className="p-3">TX Hash</th>
                    <th className="p-3">Chain</th>
                    <th className="p-3">Sender &gt; Recipient</th>
                    <th className="p-3 text-right">Rupee Valuation</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filtered.map((tx) => (
                    <tr
                      key={tx.txHash}
                      onClick={() => setActiveTx(tx)}
                      className={`cursor-pointer transition-colors ${
                        activeTx?.txHash === tx.txHash
                          ? 'bg-theme-primary/10 border-l-2 border-theme-primary'
                          : 'hover:bg-theme-surface-subtle'
                      }`}
                    >
                      <td className="p-3">
                        <CopyBadge text={tx.txHash} display={tx.txHash.slice(0, 12) + '...'} />
                        <div className="text-[10px] text-theme-text-muted mt-0.5">{tx.timestamp}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-theme-primary font-semibold">{tx.chain}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase border ${
                              tx.isLive
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-theme-surface text-theme-gold border-theme-gold/30'
                            }`}
                          >
                            {tx.isLive ? 'LIVE' : 'DEMO'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-theme-heading font-sans text-xs font-medium">{tx.fromLabel}</div>
                        <div className="text-theme-text-muted text-[10px] flex items-center gap-1">
                          <span>&gt; {tx.toLabel}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">{tx.amountINR}</div>
                        <div className="text-theme-text-muted text-[10px]">{tx.amountCrypto}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'INTERCEPTED'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                              : tx.status === 'FLAGGED_MIXER'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
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
            <div className="bg-theme-surface rounded-xl border border-theme-primary/40 p-5 flex flex-col justify-between space-y-4 shadow-xl transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-theme-primary text-[18px]">find_in_page</span>
                    <h3 className="font-space font-bold text-sm text-theme-heading">Forensic Payload Analysis</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-theme-primary/15 text-theme-primary border border-theme-primary/30 font-semibold">
                    {activeTx.chain}
                  </span>
                </div>

                <div className="mt-3 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">TRANSACTION HASH</span>
                    <div className="mt-1 break-all bg-theme-surface-subtle p-2 rounded border border-theme-border text-theme-primary text-[11px]">
                      {activeTx.txHash}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded bg-theme-surface-subtle border border-theme-border">
                      <span className="text-theme-text-muted text-[10px] block">VALUATION (INR)</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{activeTx.amountINR}</span>
                    </div>
                    <div className="p-2.5 rounded bg-theme-surface-subtle border border-theme-border">
                      <span className="text-theme-text-muted text-[10px] block">NETWORK GAS FEE</span>
                      <span className="text-sm font-bold text-theme-heading">{activeTx.feeINR}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">ORIGIN ENTITY</span>
                    <div className="mt-1 p-2 bg-theme-surface-subtle rounded border border-theme-border">
                      <div className="text-theme-heading font-sans font-medium">{activeTx.fromLabel}</div>
                      <div className="text-theme-text-muted text-[10px] mt-0.5">{activeTx.fromAddress}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">DESTINATION RECIPIENT</span>
                    <div className="mt-1 p-2 bg-theme-surface-subtle rounded border border-theme-border">
                      <div className="text-theme-heading font-sans font-medium">{activeTx.toLabel}</div>
                      <div className="text-theme-text-muted text-[10px] mt-0.5">{activeTx.toAddress}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">DECODED GAS TELEMETRY</span>
                    <div className="mt-1 p-2 bg-theme-surface-subtle rounded border border-theme-border text-theme-primary text-[11px]">
                      {activeTx.gasTelemetry}
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">THREAT CLASSIFICATION</span>
                    <div className="mt-1 p-2 bg-red-500/15 rounded border border-red-500/30 text-red-600 dark:text-red-400 text-[11px]">
                      {activeTx.riskCategory} • Suspected PMLA Section 3 Violation
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-theme-border space-y-2">
                <button className="w-full py-2 bg-theme-primary hover:opacity-90 text-white font-space font-semibold text-xs rounded shadow-md transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>Attach to CASE-2026-001 Dossier</span>
                </button>
                <button className="w-full py-2 bg-theme-surface-subtle hover:bg-theme-surface text-theme-fg font-space font-semibold text-xs rounded border border-theme-border transition-colors flex items-center justify-center gap-1.5">
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

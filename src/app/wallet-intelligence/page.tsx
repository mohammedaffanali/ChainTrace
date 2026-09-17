'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { WALLETS, WalletEntity } from '@/lib/data';

export default function WalletIntelligencePage() {
  const [selectedWallet, setSelectedWallet] = useState<WalletEntity & { isLive?: boolean }>(WALLETS[0]);
  const [searchAddress, setSearchAddress] = useState(WALLETS[0].address);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [vaspLookup, setVaspLookup] = useState<any | null>(null);
  const [liveAttribution, setLiveAttribution] = useState<any | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [latestBlock, setLatestBlock] = useState<number | null>(null);
  const [liveCounterparties, setLiveCounterparties] = useState<any[] | null>(null);

  const queryVaspLookup = async (address: string, chain: string) => {
    try {
      const res = await fetch('/api/vasp/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chain: chain.toLowerCase() }),
      });
      if (res.ok) {
        const data = await res.json();
        setVaspLookup(data);
      }
    } catch {
      // Non-blocking
    }
  };

  React.useEffect(() => {
    if (selectedWallet?.address) {
      queryVaspLookup(selectedWallet.address, selectedWallet.chain);
    }
  }, [selectedWallet]);

  React.useEffect(() => {
    fetch('/api/blockchain/mode')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setDataMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const handleSelectWallet = (w: WalletEntity) => {
    setSelectedWallet({ ...w, isLive: false });
    setSearchAddress(w.address);
    setQueryError(null);
    setLiveAttribution(null);
    setDataSource(null);
    setLatestBlock(null);
    setLiveCounterparties(null);
  };

  const detectChain = (addr: string): 'ETHEREUM' | 'TRON' | 'POLYGON' | 'BITCOIN' | 'SOLANA' => {
    const clean = addr.trim();
    if (clean.startsWith('T')) return 'TRON';
    if (clean.startsWith('bc1') || clean.startsWith('1') || clean.startsWith('3')) return 'BITCOIN';
    if (clean.startsWith('0x')) return 'ETHEREUM';
    return 'ETHEREUM';
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryError(null);
    const clean = searchAddress.trim();
    if (!clean) return;

    // Check if matching preset demo wallet first when in DEMO mode
    if (dataMode === 'demo') {
      const found = WALLETS.find(
        (w) => w.address.toLowerCase().includes(clean.toLowerCase())
      );
      if (found) {
        setSelectedWallet({ ...found, isLive: false });
        return;
      }
    }

    // Query live or dynamic address from API
    setIsLoading(true);
    const chain = detectChain(clean);

    try {
      const res = await fetch('/api/v1/analysis/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: clean,
          network: chain.toLowerCase(),
          direction: 'outgoing',
          max_hops: 3,
          limit: 25,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setQueryError(`[${data.code || 'PROVIDER_ERROR'}] ${data.message || 'Error querying blockchain data'}`);
        return;
      }

      // Synthesize wallet entity from normalized blockchain response
      const isLiveQuery = data.data_source ? !data.data_source.includes('Local Standalone') : data.mode === 'live';
      const txCount = data.transactions?.length || 0;
      const formattedBal = data.balance?.fiatValueINR || (data.balance?.formatted ? `${data.balance.formatted} ${data.balance.symbol || ''}` : '₹0');

      const liveWallet: WalletEntity & { isLive?: boolean } = {
        address: data.address,
        chain: chain,
        clusterLabel: data.attribution?.nearest_vasp && data.attribution.nearest_vasp !== 'Unknown / Unverified'
          ? `Attributed -> ${data.attribution.nearest_vasp}`
          : isLiveQuery
          ? `On-Chain Address (${data.data_source || chain})`
          : `Dynamic Node (#${data.address.slice(-4)})`,
        entityType: txCount > 10 ? 'High-Velocity Hawala' : (data.attribution?.nearest_vasp && data.attribution.nearest_vasp !== 'Unknown / Unverified' ? 'FIU-Registered VASP' : 'Unlicensed VASP'),
        riskScore: data.risk_score ? Math.round(data.risk_score) : (isLiveQuery ? 68 : 82),
        threatLevel: data.risk_score && data.risk_score > 70 ? 'HIGH' : (data.risk_score && data.risk_score < 40 ? 'VERIFIED' : 'MEDIUM'),
        balanceINR: formattedBal,
        volume24hINR: txCount > 0 ? `${(txCount * 1.8).toFixed(2)} Lakh` : '₹0',
        jurisdiction: isLiveQuery ? 'Live Public Ledger' : 'Simulated Entity',
        firstSeen: data.transactions && data.transactions.length > 0
          ? new Date(data.transactions[data.transactions.length - 1].timestamp * 1000).toLocaleDateString('en-IN')
          : 'Recently Observed',
        lastActive: data.transactions && data.transactions.length > 0
          ? new Date(data.transactions[0].timestamp * 1000).toLocaleTimeString('en-IN')
          : 'Live State',
        hopsToCashout: data.attribution?.hop_distance ?? 2,
        attributionConfidence: data.attribution?.confidence_score ?? (isLiveQuery ? 88.5 : 74.0),
        isLive: isLiveQuery,
      };

      setSelectedWallet(liveWallet);
      setDataSource(data.data_source || null);
      setLatestBlock(data.latest_block || null);
      if (data.attribution) {
        setLiveAttribution(data.attribution);
      }

      if (data.graph?.nodes && data.graph.nodes.length > 1) {
        const counterparties = data.graph.nodes
          .filter((n: any) => n.address.toLowerCase() !== clean.toLowerCase())
          .map((n: any) => ({
            address: n.address,
            chain: (n.chain || chain).toUpperCase(),
            clusterLabel: n.label || (n.vaspAssociation ? n.vaspAssociation.vasp?.name : `Counterparty (#${n.address.slice(-4)})`),
            balanceINR: n.balanceINR || 'On-chain Peer',
            threatLevel: n.threatLevel || 'MEDIUM',
          }));
        setLiveCounterparties(counterparties.length > 0 ? counterparties : null);
      } else {
        setLiveCounterparties(null);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setQueryError(`Query failed: ${(err as Error)?.message || 'Network error'}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-theme-primary animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-emerald-400' : 'text-theme-primary'}`}>
                COUNTERPARTY FORENSICS // {dataMode === 'live' ? 'LIVE TELEMETRY' : 'DE-ANONYMIZATION SUITE'}
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Wallet Intelligence &amp; Counterparty Matrix
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Heuristic cluster de-cloaking, behavioral flow scoring, and Indian VASP off-ramp probability
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

            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3.5 py-2 rounded-md font-mono text-xs font-semibold border flex items-center gap-2 transition-all ${
                isMonitoring
                  ? 'bg-theme-primary text-white border-theme-primary shadow-md shadow-theme-primary/20'
                  : 'bg-theme-surface-subtle text-theme-text-muted border-theme-border'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-cyan-300 animate-ping' : 'bg-gray-500'}`}></span>
              <span>{isMonitoring ? 'LIVE MEMPOOL INTERCEPT: ON' : 'INTERCEPT PAUSED'}</span>
            </button>
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

        {/* Address Search Bar & Quick Seeds */}
        <div className="bg-theme-surface p-4 rounded-xl border border-theme-border space-y-3 shadow-sm transition-colors">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter any EVM (0x...), TRON (TWk...), Bitcoin (bc1...), or Solana target address..."
                className="w-full h-10 pl-9 pr-3 bg-theme-surface-subtle border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-theme-primary hover:opacity-90 text-white font-space font-semibold text-xs rounded-md transition-colors shadow-sm"
            >
              Analyze Target
            </button>
          </form>

          {/* Quick Target Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="font-mono text-[11px] text-theme-text-muted">SAMPLE SUSPECT TARGETS:</span>
            {WALLETS.map((w) => (
              <button
                key={w.address}
                onClick={() => handleSelectWallet(w)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] border transition-all ${
                  selectedWallet.address === w.address
                    ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                    : 'bg-theme-surface-subtle text-theme-fg border-theme-border hover:border-theme-primary/50'
                }`}
              >
                {w.clusterLabel.slice(0, 20)}... ({w.chain})
              </button>
            ))}
          </div>
        </div>

        {/* Target Profile Master Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Master Dossier (2 Cols) */}
          <div className="lg:col-span-2 bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 shadow-sm transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-theme-accent/15 text-theme-accent border border-theme-accent/30 font-semibold">
                    {selectedWallet.chain}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                      selectedWallet.isLive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {selectedWallet.isLive ? 'LIVE TELEMETRY' : 'DEMO TARGET'}
                  </span>
                  {dataSource && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
                      PROVIDER: {dataSource}
                    </span>
                  )}
                  {latestBlock && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold">
                      BLOCK #{latestBlock.toLocaleString()}
                    </span>
                  )}
                  <span className="font-mono text-xs text-theme-text-muted">TARGET ADDRESS</span>
                  <CopyBadge text={selectedWallet.address} />
                  {vaspLookup && (
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                          : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                        ? 'KNOWN VASP ADDRESS'
                        : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                        ? 'KNOWN VASP CLUSTER'
                        : 'UNATTRIBUTED'}
                    </span>
                  )}
                </div>
                <h2 className="font-space font-bold text-xl text-theme-heading mt-1.5">
                  {selectedWallet.clusterLabel}
                </h2>
                <div className="text-xs text-theme-text-secondary mt-0.5">
                  Classification: <strong className="text-theme-heading">{selectedWallet.entityType}</strong> • Jurisdiction: <strong className="text-theme-primary">{selectedWallet.jurisdiction}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <span
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    selectedWallet.threatLevel === 'CRITICAL'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                      : selectedWallet.threatLevel === 'VERIFIED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {selectedWallet.threatLevel} RISK
                </span>
                <div className="text-[10px] text-theme-text-muted mt-1">
                  Confidence: {selectedWallet.attributionConfidence}%
                </div>
              </div>
            </div>

            {/* Financial Telemetry in INR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-theme-surface-subtle rounded-lg border border-theme-border text-xs font-mono">
              <div>
                <span className="text-theme-text-muted text-[10px] block">CURRENT BALANCE</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {selectedWallet.balanceINR}
                </span>
              </div>
              <div>
                <span className="text-theme-text-muted text-[10px] block">24H VOLUME (INR)</span>
                <span className="text-base font-bold text-theme-heading mt-1 block">
                  {selectedWallet.volume24hINR}
                </span>
              </div>
              <div>
                <span className="text-theme-text-muted text-[10px] block">HOPS TO VASP EXIT</span>
                <span className="text-base font-bold text-theme-primary mt-1 block">
                  {selectedWallet.hopsToCashout} Hops
                </span>
              </div>
              <div>
                <span className="text-theme-text-muted text-[10px] block">FIRST IDENTIFIED</span>
                <span className="text-sm font-semibold text-theme-fg mt-1 block">
                  {selectedWallet.firstSeen}
                </span>
              </div>
            </div>

            {/* Behavioral Anomaly Signals */}
            <div className="space-y-2">
              <h3 className="font-space font-semibold text-sm text-theme-heading">Forensic Anomaly Signals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 bg-theme-surface-subtle rounded border border-red-500/30">
                  <div className="flex items-center justify-between text-red-600 dark:text-red-400 font-mono text-[10px] font-semibold">
                    <span>HIGH VELOCITY LAYERING</span>
                    <span>ACTIVE</span>
                  </div>
                  <p className="text-theme-fg mt-1 font-medium text-[11px]">
                    48 rapid structured hops within 18 minutes of deposit.
                  </p>
                </div>

                <div className="p-3 bg-theme-surface-subtle rounded border border-amber-500/30">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-mono text-[10px] font-semibold">
                    <span>ROUND NUMBER STRUCTURING</span>
                    <span>DETECTED</span>
                  </div>
                  <p className="text-theme-fg mt-1 font-medium text-[11px]">
                    Repeated transfers of exactly 50,000 USDT to avoid threshold alerts.
                  </p>
                </div>

                <div className="p-3 bg-theme-surface-subtle rounded border border-theme-primary/30">
                  <div className="flex items-center justify-between text-theme-primary font-mono text-[10px] font-semibold">
                    <span>REGULATED VASP INTERACTION</span>
                    <span>99.4% CONF</span>
                  </div>
                  <p className="text-theme-fg mt-1 font-medium text-[11px]">
                    Direct deposit link to CoinDCX hot wallet 0x38b2...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Threat Breakdown Radar & Subpoena Action (1 Col) */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 flex flex-col justify-between space-y-4 shadow-sm transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-space font-semibold text-sm text-theme-heading">Risk Score Telemetry</h3>
                <span className="font-mono text-lg font-bold text-red-600 dark:text-red-400">{selectedWallet.riskScore}/100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-theme-surface-subtle h-2.5 rounded-full overflow-hidden mt-2 border border-theme-border">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500"
                  style={{ width: `${selectedWallet.riskScore}%` }}
                ></div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">Darknet / Mixer Ties</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">Hawala Mule Routing</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">Cross-Chain Bridge Volume</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted">KYC Compliance Status</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">UNVERIFIED (0%)</span>
                </div>
              </div>
            </div>

            {/* VASP Provenance Intelligence */}
            <div className="p-3.5 bg-theme-surface-subtle rounded-lg border border-theme-border space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-theme-text-muted uppercase font-semibold">
                  VASP Intelligence Record
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    (liveAttribution?.nearest_vasp && liveAttribution.nearest_vasp !== 'Unknown / Unverified') || vaspLookup?.associationType === 'KNOWN_VASP_ADDRESS'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : vaspLookup?.associationType === 'KNOWN_VASP_CLUSTER'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                  }`}
                >
                  {liveAttribution
                    ? (liveAttribution.nearest_vasp !== 'Unknown / Unverified' ? 'ATTRIBUTED VASP' : 'UNKNOWN / UNVERIFIED')
                    : vaspLookup?.associationType === 'KNOWN_VASP_ADDRESS'
                    ? 'KNOWN VASP ADDRESS'
                    : vaspLookup?.associationType === 'KNOWN_VASP_CLUSTER'
                    ? 'KNOWN VASP CLUSTER'
                    : 'UNATTRIBUTED'}
                </span>
              </div>
              <p className="text-theme-fg text-[11px] leading-relaxed">
                {liveAttribution
                  ? (liveAttribution.nearest_vasp !== 'Unknown / Unverified'
                      ? `Nearest identified VASP off-ramp: ${liveAttribution.nearest_vasp} at ${liveAttribution.hop_distance ?? 'direct'} hop(s).`
                      : 'No verified VASP attribution evidence found in immediate hops. Marked Unknown / Unverified under strict evidentiary standards.')
                  : vaspLookup?.factualSummary || vaspLookup?.associationDescription || 'Querying VASP intelligence database...'}
              </p>
              {liveAttribution?.legal_limitations && (
                <p className="text-[10px] text-theme-text-muted italic border-t border-theme-border pt-1.5 leading-normal">
                  {liveAttribution.legal_limitations}
                </p>
              )}
              {(liveAttribution || vaspLookup?.vasp) && (
                <div className="pt-1.5 border-t border-theme-border flex items-center justify-between text-[10px] text-theme-text-muted">
                  <span>Entity: <strong className="text-theme-heading">{liveAttribution?.nearest_vasp || vaspLookup?.vasp?.name}</strong></span>
                  <span>Conf: <strong className="text-theme-primary">{liveAttribution ? `${liveAttribution.confidence_score}%` : `${vaspLookup?.confidence}%`}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Action Block */}
            <div className="p-3 bg-theme-surface-subtle rounded-lg border border-theme-border space-y-2">
              <span className="font-mono text-[10px] text-theme-text-muted uppercase block">
                Statutory Intercept Actions
              </span>
              <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-space font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>Issue Freezing Requisition</span>
              </button>
              <button className="w-full py-2 bg-theme-surface hover:bg-theme-surface-subtle text-theme-fg font-space font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 border border-theme-border">
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Wallet Dossier (Sec 65B)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Counterparty Clusters Table */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
          <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex items-center justify-between">
            <h3 className="font-space font-semibold text-sm text-theme-heading">
              Direct Counterparty Network &amp; Clustered Wallets
            </h3>
            {liveCounterparties && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                {liveCounterparties.length} Real On-Chain Counterparties
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                <tr>
                  <th className="p-3">Counterparty Address</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Cluster Label</th>
                  <th className="p-3 text-right">Transacted Volume (INR)</th>
                  <th className="p-3 text-center">Threat Level</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {(liveCounterparties || WALLETS).map((w: any) => (
                  <tr key={w.address} className="hover:bg-theme-surface-subtle transition-colors">
                    <td className="p-3">
                      <CopyBadge text={w.address} />
                    </td>
                    <td className="p-3 text-theme-primary font-semibold">{w.chain}</td>
                    <td className="p-3 font-sans text-theme-heading font-medium">{w.clusterLabel}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{w.balanceINR}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.threatLevel === 'CRITICAL'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                            : w.threatLevel === 'VERIFIED' || w.threatLevel === 'LOW'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {w.threatLevel}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSearchAddress(w.address);
                          handleSelectWallet(w);
                        }}
                        className="px-2 py-1 rounded bg-theme-surface-subtle hover:bg-theme-primary hover:text-white text-[11px] text-theme-fg border border-theme-border transition-colors"
                      >
                        Inspect Node
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

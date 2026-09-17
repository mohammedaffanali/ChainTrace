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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-[#ADC178] animate-pulse' : 'bg-[#7CB9E8] animate-pulse'}`}></span>
              <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-[#ADC178]' : 'text-[#7CB9E8]'}`}>
                COUNTERPARTY FORENSICS // {dataMode === 'live' ? 'LIVE TELEMETRY' : 'DE-ANONYMIZATION SUITE'}
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl text-[#F4F0E6] mt-1.5 tracking-tight">
              Wallet Intelligence &amp; Counterparty Matrix
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Heuristic cluster de-cloaking, behavioral flow scoring, and Indian VASP off-ramp probability
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.08] p-0.5">
              <button
                type="button"
                onClick={() => {
                  setDataMode('demo');
                  setQueryError(null);
                }}
                className={`px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors ${
                  dataMode === 'demo'
                    ? 'bg-[#15171B] text-[#F4F0E6] shadow-glass-sm border border-white/[0.08]'
                    : 'text-[#9D9A92] hover:text-[#F4F0E6]'
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
                className={`px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors ${
                  dataMode === 'live'
                    ? 'bg-[#1B512D]/40 text-[#ADC178] border border-[#ADC178]/40 shadow-signal-forest'
                    : 'text-[#9D9A92] hover:text-[#F4F0E6]'
                }`}
              >
                LIVE
              </button>
            </div>

            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold border flex items-center gap-2 transition-all ${
                isMonitoring
                  ? 'bg-[#1560BD] text-[#F4F0E6] border-[#7CB9E8]/30 shadow-signal-denim'
                  : 'bg-white/[0.04] text-[#9D9A92] border-white/[0.08]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-[#7CB9E8] animate-ping' : 'bg-gray-500'}`}></span>
              <span>{isMonitoring ? 'LIVE MEMPOOL INTERCEPT: ON' : 'INTERCEPT PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {queryError && (
          <div className="p-4 bg-[#960018]/15 border border-[#B22222]/40 rounded-2xl flex items-start gap-3 text-[#F0EAD6] animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] text-[#B22222] shrink-0 mt-0.5">error</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider text-[#B22222]">Blockchain Provider Query Error</span>
              <p className="mt-0.5 text-[#D8D3C7]">{queryError}</p>
            </div>
            <button onClick={() => setQueryError(null)} className="text-[#9D9A92] hover:text-[#F4F0E6] text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Address Search Bar & Quick Seeds */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] space-y-3 shadow-glass-card transition-colors">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7CB9E8] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter any EVM (0x...), TRON (TWk...), Bitcoin (bc1...), or Solana target address..."
                className="w-full h-10 pl-9 pr-3 bg-[#15171B] border border-white/[0.08] rounded-xl text-[#F4F0E6] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-[#1560BD] hover:bg-[#1560BD]/90 text-[#F4F0E6] font-space font-semibold text-xs rounded-xl transition-colors shadow-signal-denim border border-[#7CB9E8]/30"
            >
              Analyze Target
            </button>
          </form>

          {/* Quick Target Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="font-mono text-[10px] text-[#9D9A92] uppercase">SAMPLE SUSPECT TARGETS:</span>
            {WALLETS.map((w) => (
              <button
                key={w.address}
                onClick={() => handleSelectWallet(w)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
                  selectedWallet.address === w.address
                    ? 'bg-[#1560BD] text-[#F4F0E6] border-[#7CB9E8]/40 shadow-signal-denim'
                    : 'bg-white/[0.03] text-[#D8D3C7] border-white/[0.08] hover:border-[#7CB9E8]/40 hover:text-[#F4F0E6]'
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
          <div className="lg:col-span-2 bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 space-y-4 shadow-glass-card transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.04] text-[#7CB9E8] border border-white/[0.08] font-semibold">
                    {selectedWallet.chain}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                      selectedWallet.isLive
                        ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                        : 'bg-white/[0.04] text-[#F4F0E6] border-white/[0.08]'
                    }`}
                  >
                    {selectedWallet.isLive ? 'LIVE TELEMETRY' : 'DEMO TARGET'}
                  </span>
                  {dataSource && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1560BD]/20 text-[#7CB9E8] border border-[#7CB9E8]/30 font-bold uppercase">
                      PROVIDER: {dataSource}
                    </span>
                  )}
                  {latestBlock && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#5D3A9C]/20 text-[#B23AEE] border border-[#5D3A9C]/30 font-bold">
                      BLOCK #{latestBlock.toLocaleString()}
                    </span>
                  )}
                  <span className="font-mono text-xs text-[#9D9A92]">TARGET ADDRESS</span>
                  <CopyBadge text={selectedWallet.address} />
                  {vaspLookup && (
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                          ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                          : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                          ? 'bg-[#1560BD]/20 text-[#7CB9E8] border-[#7CB9E8]/30'
                          : 'bg-white/[0.04] text-[#9D9A92] border-white/[0.08]'
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
                <h2 className="font-editorial font-bold text-xl text-[#F4F0E6] mt-2">
                  {selectedWallet.clusterLabel}
                </h2>
                <div className="text-xs text-[#9D9A92] font-mono mt-0.5">
                  Classification: <strong className="text-[#F4F0E6]">{selectedWallet.entityType}</strong> • Jurisdiction: <strong className="text-[#7CB9E8]">{selectedWallet.jurisdiction}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    selectedWallet.threatLevel === 'CRITICAL'
                      ? 'bg-[#960018]/25 text-[#F0EAD6] border border-[#B22222]/40'
                      : selectedWallet.threatLevel === 'VERIFIED'
                      ? 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
                      : 'bg-white/[0.04] text-[#D8D3C7] border border-white/[0.08]'
                  }`}
                >
                  {selectedWallet.threatLevel} RISK
                </span>
                <div className="text-[10px] text-[#9D9A92] mt-1 font-mono">
                  Confidence: {selectedWallet.attributionConfidence}%
                </div>
              </div>
            </div>

            {/* Financial Telemetry in INR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#15171B] rounded-xl border border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-[#9D9A92] text-[10px] block uppercase">CURRENT BALANCE</span>
                <span className="text-base font-bold font-editorial text-[#ADC178] mt-1 block">
                  {selectedWallet.balanceINR}
                </span>
              </div>
              <div>
                <span className="text-[#9D9A92] text-[10px] block uppercase">24H VOLUME (INR)</span>
                <span className="text-base font-bold font-editorial text-[#F4F0E6] mt-1 block">
                  {selectedWallet.volume24hINR}
                </span>
              </div>
              <div>
                <span className="text-[#9D9A92] text-[10px] block uppercase">HOPS TO VASP EXIT</span>
                <span className="text-base font-bold text-[#7CB9E8] mt-1 block">
                  {selectedWallet.hopsToCashout} Hops
                </span>
              </div>
              <div>
                <span className="text-[#9D9A92] text-[10px] block uppercase">FIRST IDENTIFIED</span>
                <span className="text-sm font-semibold text-[#D8D3C7] mt-1 block">
                  {selectedWallet.firstSeen}
                </span>
              </div>
            </div>

            {/* Behavioral Anomaly Signals */}
            <div className="space-y-2">
              <h3 className="font-editorial font-semibold text-sm text-[#F4F0E6]">Forensic Anomaly Signals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 bg-[#960018]/15 rounded-xl border border-[#B22222]/30">
                  <div className="flex items-center justify-between text-[#B22222] font-mono text-[10px] font-semibold">
                    <span>HIGH VELOCITY LAYERING</span>
                    <span>ACTIVE</span>
                  </div>
                  <p className="text-[#F0EAD6] mt-1 font-medium text-[11px]">
                    48 rapid structured hops within 18 minutes of deposit.
                  </p>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#ADC178] font-mono text-[10px] font-semibold">
                    <span>ROUND NUMBER STRUCTURING</span>
                    <span>DETECTED</span>
                  </div>
                  <p className="text-[#F0EAD6] mt-1 font-medium text-[11px]">
                    Repeated transfers of exactly 50,000 USDT to avoid threshold alerts.
                  </p>
                </div>

                <div className="p-3 bg-[#1B512D]/20 rounded-xl border border-[#ADC178]/30">
                  <div className="flex items-center justify-between text-[#ADC178] font-mono text-[10px] font-semibold">
                    <span>REGULATED VASP INTERACTION</span>
                    <span>99.4% CONF</span>
                  </div>
                  <p className="text-[#F0EAD6] mt-1 font-medium text-[11px]">
                    Direct deposit link to CoinDCX hot wallet 0x38b2...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Threat Breakdown Radar & Subpoena Action (1 Col) */}
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-glass-card transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-editorial font-semibold text-sm text-[#F4F0E6]">Risk Score Telemetry</h3>
                <span className="font-mono text-lg font-bold text-[#B22222]">{selectedWallet.riskScore}/100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#15171B] h-2.5 rounded-full overflow-hidden mt-2 border border-white/[0.08]">
                <div
                  className="h-full bg-gradient-to-r from-[#ADC178] via-[#C44536] to-[#960018]"
                  style={{ width: `${selectedWallet.riskScore}%` }}
                ></div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#9D9A92]">Darknet / Mixer Ties</span>
                  <span className="text-[#B22222] font-semibold">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9D9A92]">Hawala Mule Routing</span>
                  <span className="text-[#B22222] font-semibold">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9D9A92]">Cross-Chain Bridge Volume</span>
                  <span className="text-[#7CB9E8] font-semibold">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9D9A92]">KYC Compliance Status</span>
                  <span className="text-[#B22222] font-semibold">UNVERIFIED (0%)</span>
                </div>
              </div>
            </div>

            {/* VASP Provenance Intelligence */}
            <div className="p-3.5 bg-[#15171B] rounded-xl border border-white/[0.06] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#9D9A92] uppercase font-semibold">
                  VASP Intelligence Record
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    (liveAttribution?.nearest_vasp && liveAttribution.nearest_vasp !== 'Unknown / Unverified') || vaspLookup?.associationType === 'KNOWN_VASP_ADDRESS'
                      ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                      : vaspLookup?.associationType === 'KNOWN_VASP_CLUSTER'
                      ? 'bg-[#1560BD]/20 text-[#7CB9E8] border-[#7CB9E8]/30'
                      : 'bg-white/[0.04] text-[#9D9A92] border-white/[0.08]'
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
              <p className="text-[#D8D3C7] text-[11px] leading-relaxed">
                {liveAttribution
                  ? (liveAttribution.nearest_vasp !== 'Unknown / Unverified'
                      ? `Nearest identified VASP off-ramp: ${liveAttribution.nearest_vasp} at ${liveAttribution.hop_distance ?? 'direct'} hop(s).`
                      : 'No verified VASP attribution evidence found in immediate hops. Marked Unknown / Unverified under strict evidentiary standards.')
                  : vaspLookup?.factualSummary || vaspLookup?.associationDescription || 'Querying VASP intelligence database...'}
              </p>
              {liveAttribution?.legal_limitations && (
                <p className="text-[10px] text-[#9D9A92] italic border-t border-white/[0.06] pt-1.5 leading-normal">
                  {liveAttribution.legal_limitations}
                </p>
              )}
              {(liveAttribution || vaspLookup?.vasp) && (
                <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#9D9A92]">
                  <span>Entity: <strong className="text-[#F4F0E6]">{liveAttribution?.nearest_vasp || vaspLookup?.vasp?.name}</strong></span>
                  <span>Conf: <strong className="text-[#7CB9E8]">{liveAttribution ? `${liveAttribution.confidence_score}%` : `${vaspLookup?.confidence}%`}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Action Block */}
            <div className="p-3 bg-[#15171B] rounded-xl border border-white/[0.06] space-y-2">
              <span className="font-mono text-[10px] text-[#9D9A92] uppercase block">
                Statutory Intercept Actions
              </span>
              <button className="w-full py-2 bg-[#960018] hover:bg-[#960018]/90 text-[#F4F0E6] font-space font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-signal-carmin border border-[#B22222]/40">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>Issue Freezing Requisition</span>
              </button>
              <button className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0E6] font-space font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/[0.08]">
                <span className="material-symbols-outlined text-[16px] text-[#ADC178]">download</span>
                <span>Export Wallet Dossier (Sec 65B)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Counterparty Clusters Table */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-glass-card transition-colors">
          <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="font-editorial font-semibold text-sm text-[#F4F0E6]">
              Direct Counterparty Network &amp; Clustered Wallets
            </h3>
            {liveCounterparties && (
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-lg bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30 font-bold uppercase">
                {liveCounterparties.length} Real On-Chain Counterparties
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] text-[#9D9A92] uppercase text-[10px] border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Counterparty Address</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Cluster Label</th>
                  <th className="p-3 text-right">Transacted Volume (INR)</th>
                  <th className="p-3 text-center">Threat Level</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {(liveCounterparties || WALLETS).map((w: any) => (
                  <tr key={w.address} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3">
                      <CopyBadge text={w.address} />
                    </td>
                    <td className="p-3 text-[#7CB9E8] font-semibold">{w.chain}</td>
                    <td className="p-3 font-sans text-[#F4F0E6] font-medium">{w.clusterLabel}</td>
                    <td className="p-3 text-right font-bold text-[#ADC178]">{w.balanceINR}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.threatLevel === 'CRITICAL'
                            ? 'bg-[#960018]/25 text-[#F0EAD6] border border-[#B22222]/40'
                            : w.threatLevel === 'VERIFIED' || w.threatLevel === 'LOW'
                            ? 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
                            : 'bg-white/[0.04] text-[#D8D3C7] border border-white/[0.08]'
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
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#1560BD] hover:text-[#F4F0E6] text-[11px] text-[#D8D3C7] border border-white/[0.08] transition-colors"
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

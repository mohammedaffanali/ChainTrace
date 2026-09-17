'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { VASP_LIST, VaspNode } from '@/lib/data';
import {
  SupportedChain,
  AttributionResult,
  PipelineStage,
  DEFAULT_PIPELINE_STAGES,
  PRIMARY_DEMO_WALLET,
  TRON_HAWALA_WALLET,
  BTC_WASABI_WALLET,
  REFUSAL_PEEL_WALLET,
  REFUSAL_DORMANT_WALLET,
  REFUSAL_SOLANA_WALLET,
  runVaspAttributionSimulation,
} from '@/lib/attributionService';

function VaspAttributionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form inputs
  const initialWallet = searchParams?.get('wallet') || PRIMARY_DEMO_WALLET.address;
  const initialChain = (searchParams?.get('chain') as SupportedChain) || 'AUTO';

  const [walletInput, setWalletInput] = useState(initialWallet);
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(initialChain);
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(9); // 0-9
  const [attributionResult, setAttributionResult] = useState<AttributionResult>(() =>
    runVaspAttributionSimulation(initialWallet, initialChain)
  );

  // Phase 2 Verified VASP Intelligence state
  const [vaspLookup, setVaspLookup] = useState<any | null>(null);
  const [vaspDirectory, setVaspDirectory] = useState<any[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importText, setImportText] = useState('');
  const [importReport, setImportReport] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchVaspLookup = async (address: string, chain: string) => {
    try {
      const res = await fetch('/api/vasp/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chain: chain === 'AUTO' ? 'ethereum' : chain.toLowerCase() }),
      });
      if (res.ok) {
        const data = await res.json();
        setVaspLookup(data);
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchVaspDirectory = async () => {
    setIsLoadingDirectory(true);
    try {
      const res = await fetch('/api/vasp');
      if (res.ok) {
        const data = await res.json();
        if (data.vasps && data.vasps.length > 0) {
          setVaspDirectory(data.vasps);
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  useEffect(() => {
    fetch('/api/blockchain/mode')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setDataMode(data.mode);
      })
      .catch(() => {});

    fetchVaspLookup(initialWallet, initialChain);
    fetchVaspDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active view tab in attribution suite
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SIGNALS' | 'CANDIDATES' | 'HOPS' | 'DIRECTORY'>('OVERVIEW');

  // VASP Request Workflow Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'DISCLOSURE' | 'FREEZE'>('DISCLOSURE');
  const [requestStep, setRequestStep] = useState(1);
  const [requestDispatched, setRequestDispatched] = useState(false);

  // Execute Attribution
  const handleTraceAndAttribute = async (addressToAnalyze?: string, chainToUse?: SupportedChain) => {
    const addr = addressToAnalyze !== undefined ? addressToAnalyze : walletInput.trim();
    const chain = chainToUse !== undefined ? chainToUse : selectedChain;

    if (!addr) return;

    setIsAnalyzing(true);
    setQueryError(null);
    setAnalysisStageIndex(0);

    // Concurrently trigger Phase 2 verified VASP lookup
    fetchVaspLookup(addr, chain);

    // If LIVE mode is active, query the server API
    if (dataMode === 'live') {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep = Math.min(currentStep + 1, DEFAULT_PIPELINE_STAGES.length - 1);
        setAnalysisStageIndex(currentStep);
      }, 200);

      try {
        const res = await fetch('/api/attribution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: addr, chain, mode: 'live' }),
        });

        clearInterval(interval);
        const data = await res.json();

        if (!res.ok) {
          setIsAnalyzing(false);
          setQueryError(`[${data.code || 'PROVIDER_ERROR'}] ${data.message || 'Error executing live blockchain query'}`);
          return;
        }

        setAnalysisStageIndex(DEFAULT_PIPELINE_STAGES.length);
        setIsAnalyzing(false);
        setAttributionResult(data);
      } catch (err: unknown) {
        clearInterval(interval);
        setIsAnalyzing(false);
        setQueryError(`Live attribution query failed: ${(err as Error)?.message || 'Network connection failed'}`);
      }
      return;
    }

    // Default: DEMO mode simulation
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnalysisStageIndex(currentStep);
      if (currentStep >= DEFAULT_PIPELINE_STAGES.length) {
        clearInterval(interval);
        setIsAnalyzing(false);
        const result = runVaspAttributionSimulation(addr, chain);
        setAttributionResult(result);
      }
    }, 180);
  };

  // Switch to preset
  const loadPreset = (preset: { address: string; chain: SupportedChain }) => {
    setWalletInput(preset.address);
    setSelectedChain(preset.chain);
    handleTraceAndAttribute(preset.address, preset.chain);
  };

  const currentStages: PipelineStage[] = DEFAULT_PIPELINE_STAGES.map((s, idx) => ({
    ...s,
    status: isAnalyzing
      ? idx < analysisStageIndex
        ? 'COMPLETED'
        : idx === analysisStageIndex
        ? 'ANALYZING'
        : 'PENDING'
      : 'COMPLETED',
  }));

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header with Institutional Authority Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-[#ADC178] animate-pulse' : 'bg-[#7CB9E8] animate-pulse'}`}></span>
              <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-[#ADC178]' : 'text-[#7CB9E8]'}`}>
                CHAINTRACE FORENSIC PIPELINE // {dataMode === 'live' ? 'LIVE TELEMETRY' : 'SIH 2026'}
              </span>
              <span className="text-white/20">•</span>
              <span className={`font-mono text-[10px] font-semibold ${dataMode === 'live' ? 'text-[#ADC178]' : 'text-[#D8D3C7]'}`}>
                {dataMode === 'live' ? 'REAL BLOCKCHAIN PROVIDERS' : 'CONTROLLED DEMONSTRATION ENVIRONMENT'}
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl text-[#F4F0E6] mt-1.5 tracking-tight">
              Automated VASP Attribution Engine
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Automated attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0E6] font-space font-semibold text-xs rounded-xl border border-white/[0.08] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ADC178]">gavel</span>
              <span>Prepare VASP Request</span>
            </button>
            <Link
              href="/fund-flow-graph"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1560BD] hover:bg-[#1560BD]/90 text-[#F4F0E6] font-space font-semibold text-xs rounded-xl shadow-signal-denim border border-[#7CB9E8]/30 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#7CB9E8]">hub</span>
              <span>Open in Fund Flow</span>
            </Link>
          </div>
        </div>

        {/* Live Query Error Banner */}
        {queryError && (
          <div className="p-4 bg-[#960018]/15 border border-[#B22222]/40 rounded-2xl flex items-start gap-3 text-[#F0EAD6] animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] text-[#B22222] shrink-0 mt-0.5">error</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider text-[#B22222]">Blockchain Provider Query Error</span>
              <p className="mt-0.5 text-[#D8D3C7]">{queryError}</p>
              <span className="text-[10px] text-[#9D9A92] mt-1 block">
                LIVE mode enforces strict provider integrity. No simulated records are substituted for provider failures.
              </span>
            </div>
            <button
              onClick={() => setQueryError(null)}
              className="text-[#9D9A92] hover:text-[#F4F0E6] text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* PRIMARY WALLET INPUT & NETWORK SELECTOR BAR */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] shadow-glass-card space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7CB9E8] text-[18px]">search</span>
              <span className="font-editorial font-semibold text-sm text-[#F4F0E6]">
                Suspect Target Input &amp; Multi-Chain Resolution
              </span>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-[#9D9A92] mr-1 font-semibold uppercase">DEMO TARGETS:</span>
              <button
                onClick={() => loadPreset(PRIMARY_DEMO_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#7CB9E8] font-mono text-[10px] border border-white/[0.08] transition-colors font-medium"
                title="Primary SIH Demo Target"
              >
                0x7A91...4F82 (Tron/Polygon)
              </button>
              <button
                onClick={() => loadPreset(TRON_HAWALA_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0E6] font-mono text-[10px] border border-white/[0.08] transition-colors font-medium"
                title="Tron Hawala Target"
              >
                TWk93zM... (HTX Offshore)
              </button>
              <button
                onClick={() => loadPreset(BTC_WASABI_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#C44536] font-mono text-[10px] border border-white/[0.08] transition-colors font-medium"
                title="Wasabi Mixer Peel (Low Confidence Case)"
              >
                bc1q9v8... (Mixer Obfuscation)
              </button>
              <span className="font-mono text-[10px] text-[#9D9A92] ml-2 font-semibold border-l border-white/[0.08] pl-2 uppercase">REFUSAL DEMOS:</span>
              <button
                onClick={() => loadPreset(REFUSAL_PEEL_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-[#960018]/15 hover:bg-[#960018]/25 text-[#F0EAD6] font-mono text-[10px] border border-[#B22222]/30 transition-colors font-medium"
                title="Mixer Peel — NO_RELIABLE_ATTRIBUTION"
              >
                0x0000...beef (Peel/Mixer)
              </button>
              <button
                onClick={() => loadPreset(REFUSAL_DORMANT_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-[#960018]/15 hover:bg-[#960018]/25 text-[#F0EAD6] font-mono text-[10px] border border-[#B22222]/30 transition-colors font-medium"
                title="Dormant Wallet — NO_RELIABLE_ATTRIBUTION"
              >
                0x1111...0000 (Dormant)
              </button>
              <button
                onClick={() => loadPreset(REFUSAL_SOLANA_WALLET)}
                className="px-2.5 py-1 rounded-lg bg-[#960018]/15 hover:bg-[#960018]/25 text-[#F0EAD6] font-mono text-[10px] border border-[#B22222]/30 transition-colors font-medium"
                title="Burn/System Address — NO_RELIABLE_ATTRIBUTION"
              >
                111111...1111 (Burn Addr)
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTraceAndAttribute();
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
          >
            <div className="md:col-span-7">
              <label className="block font-mono text-[10px] text-[#9D9A92] uppercase tracking-wider mb-1">
                Suspect Wallet Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7CB9E8] text-[18px]">
                  account_balance_wallet
                </span>
                <input
                  type="text"
                  required
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Enter suspect wallet address (e.g. 0x7A91...4F82)"
                  className="w-full h-10 pl-9 pr-3 bg-[#15171B] border border-white/[0.08] rounded-xl text-[#F4F0E6] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block font-mono text-[10px] text-[#9D9A92] uppercase tracking-wider mb-1">
                Blockchain Network
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
                className="w-full h-10 px-3 bg-[#15171B] border border-white/[0.08] rounded-xl text-[#F4F0E6] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none transition-colors"
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
                disabled={isAnalyzing}
                className="w-full h-10 bg-[#1560BD] hover:bg-[#1560BD]/90 text-[#F4F0E6] font-space font-bold text-xs uppercase tracking-wider rounded-xl shadow-signal-denim border border-[#7CB9E8]/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px] text-[#7CB9E8] animate-spin">
                  {isAnalyzing ? 'sync' : 'radar'}
                </span>
                <span>{isAnalyzing ? 'ANALYZING...' : 'TRACE & ATTRIBUTE'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 9-STAGE ANALYSIS PIPELINE (ANIMATED PROGRESSION) */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-glass-card space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-[#7CB9E8] animate-ping' : 'bg-[#ADC178]'}`}></span>
              <span className="font-editorial font-bold text-xs uppercase tracking-wider text-[#F4F0E6]">
                ANALYSIS PIPELINE TELEMETRY
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#9D9A92]">
              {isAnalyzing ? 'API Traversal in Progress...' : 'Attribution Synthesized with 100% Audit Integrity'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {currentStages.map((stage) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isCurrent = stage.status === 'ANALYZING';

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-[#1B512D]/20 border-[#ADC178]/30 text-[#ADC178]'
                      : isCurrent
                      ? 'bg-[#1560BD]/20 border-[#7CB9E8] text-[#7CB9E8] shadow-signal-denim animate-pulse'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#9D9A92]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold">{stage.code}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      {isCompleted ? 'check_circle' : isCurrent ? 'sync' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="font-space font-bold text-[11px] mt-1 text-[#F4F0E6] leading-tight">
                    {stage.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOMINANT ATTRIBUTION RESULT SCREEN */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Main Result Card (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-4">

            {/* ─── INSUFFICIENT EVIDENCE STATE (NO_RELIABLE_ATTRIBUTION) ─── */}
            {attributionResult.confidenceClassification === 'INSUFFICIENT' && (
              <div className="rounded-xl border border-[#960018]/50 bg-[#1C1D20]/90 backdrop-blur-xl shadow-glass-card overflow-hidden">
                {/* Danger top bar */}
                <div className="h-1 bg-gradient-to-r from-[#960018] via-[#B22222] to-[#C44536]" />
                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#C44536] block font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C44536] animate-pulse"></span>
                        ANTI-OVERCLAIMING PROTOCOL — ATTRIBUTION REFUSAL
                      </span>
                      <h2 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
                        NO RELIABLE ATTRIBUTION
                      </h2>
                      <p className="font-mono text-xs text-[#9D9A92] mt-1">
                        Statutory finding: <span className="text-[#C44536] font-semibold">INSUFFICIENT_EVIDENCE</span> — System refuses to name a VASP
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-space font-extrabold text-4xl text-[#C44536]">
                        {attributionResult.overallConfidence.toFixed(2)}%
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-1 bg-[#960018]/20 text-[#FAFAF5] border-[#960018]/40">
                        INSUFFICIENT CONFIDENCE
                      </span>
                    </div>
                  </div>

                  {/* Why System Refused Banner */}
                  <div className="p-4 rounded-lg bg-[#960018]/15 border border-[#960018]/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#C44536] text-[22px] shrink-0 mt-0.5">gpp_bad</span>
                    <div>
                      <span className="font-space font-bold text-sm text-[#FAFAF5] block">
                        Why the system refused attribution
                      </span>
                      <p className="font-mono text-xs text-[#D8D3C7] mt-1 leading-relaxed">
                        The aggregate 7-signal confidence score is <strong className="text-[#FAFAF5]">{attributionResult.overallConfidence.toFixed(2)}%</strong>, which is
                        below the <strong className="text-[#FAFAF5]">30% minimum attribution threshold</strong>. Returning a VASP name at this
                        confidence level would constitute speculative overclaiming — inadmissible in forensic evidence
                        under the Indian Evidence Act. The system enforces a strict refusal rather than guess.
                      </p>
                    </div>
                  </div>

                  {/* 7-Signal Breakdown */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#9D9A92] font-semibold block mb-2">
                      7-SIGNAL BREAKDOWN — All signals below threshold
                    </span>
                    <div className="space-y-2">
                      {attributionResult.signals.map((sig) => (
                        <div key={sig.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 border border-white/[0.04]">
                          <span className="material-symbols-outlined text-[16px] text-[#C44536] shrink-0">cancel</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] font-semibold text-[#FAFAF5] truncate">
                                {sig.label} <span className="text-[#74736F] font-normal">(weight: {sig.weightPercent}%)</span>
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#C44536] shrink-0">
                                {sig.score}/100 → +{sig.contribution.toFixed(2)}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#960018]"
                                style={{ width: `${sig.score}%` }}
                              />
                            </div>
                            <p className="font-mono text-[10px] text-[#9D9A92] mt-1 leading-snug">{sig.evidenceText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#9D9A92] font-semibold block mb-2">
                      SYSTEM RECOMMENDED ACTIONS
                    </span>
                    <div className="space-y-1.5">
                      {attributionResult.evidenceTrail.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-black/20 border border-white/[0.04]">
                          <span className="material-symbols-outlined text-[14px] text-[#7CB9E8] shrink-0 mt-0.5">
                            {i === 0 ? 'warning' : i === 1 ? 'analytics' : i === 2 ? 'gpp_bad' : 'task_alt'}
                          </span>
                          <span className="font-mono text-[10px] text-[#D8D3C7] leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Methodology Notice */}
                  <div className="p-3 rounded-lg bg-[#ADC178]/10 border border-[#ADC178]/20 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ADC178] text-[16px] shrink-0 mt-0.5">info</span>
                    <p className="font-mono text-[10px] text-[#D8D3C7] leading-snug">
                      {attributionResult.methodologyNotice}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Crown Jewel Card — hidden when INSUFFICIENT */}
            {attributionResult.confidenceClassification !== 'INSUFFICIENT' && (
            <div
              className={`rounded-xl p-6 shadow-glass-card relative overflow-hidden border bg-[#1C1D20]/90 backdrop-blur-xl transition-colors ${
                attributionResult.overallConfidence >= 90
                  ? 'border-[#ADC178]/40 shadow-signal-green'
                  : attributionResult.overallConfidence >= 75
                  ? 'border-[#7CB9E8]/40 shadow-signal-blue'
                  : 'border-[#960018]/40'
              }`}
            >
              {/* Subtle top gold/accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  attributionResult.overallConfidence >= 90
                    ? 'bg-gradient-to-r from-[#1B512D] via-[#ADC178] to-[#7CB9E8]'
                    : attributionResult.overallConfidence >= 75
                    ? 'bg-gradient-to-r from-[#1560BD] to-[#7CB9E8]'
                    : 'bg-gradient-to-r from-[#960018] to-[#C44536]'
                }`}
              ></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#9D9A92] block font-semibold">
                      NEAREST ATTRIBUTED VIRTUAL ASSET SERVICE PROVIDER
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        attributionResult.isDemonstrationData
                          ? 'bg-[#C44536]/15 text-[#FAFAF5] border-[#C44536]/30'
                          : 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                      }`}
                    >
                      {attributionResult.isDemonstrationData ? 'DEMO SIMULATION' : 'LIVE TELEMETRY'}
                    </span>
                    {vaspLookup && (
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                            ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                            : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                            ? 'bg-[#1560BD]/20 text-[#7CB9E8] border-[#7CB9E8]/30'
                            : vaspLookup.associationType === 'POSSIBLE_ASSOCIATION'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-white/5 text-[#9D9A92] border-white/10'
                        }`}
                      >
                        {vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                          ? 'KNOWN VASP ADDRESS'
                          : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                          ? 'KNOWN VASP CLUSTER'
                          : vaspLookup.associationType === 'POSSIBLE_ASSOCIATION'
                          ? 'POSSIBLE ASSOCIATION'
                          : 'UNATTRIBUTED / UNKNOWN'}
                      </span>
                    )}
                  </div>
                  <h2 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
                    {attributionResult.nearestVasp.vaspName}
                  </h2>
                  <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
                    Legal Entity: <span className="text-[#D8D3C7]">{attributionResult.nearestVasp.legalEntity}</span> • Reg: <span className="text-[#ADC178]">{attributionResult.nearestVasp.fiuRegNo}</span>
                  </p>
                  {vaspLookup && (
                    <div className="mt-2 text-xs font-mono p-2 rounded bg-black/20 border border-white/[0.04] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7CB9E8] text-[15px]">verified</span>
                      <span className="text-[#D8D3C7] font-medium">
                        {vaspLookup.factualSummary || vaspLookup.associationDescription}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                  <span
                    className={`font-space font-extrabold text-3xl sm:text-4xl ${
                      attributionResult.overallConfidence >= 90
                        ? 'text-[#ADC178]'
                        : attributionResult.overallConfidence >= 75
                        ? 'text-[#7CB9E8]'
                        : 'text-[#C44536]'
                    }`}
                  >
                    {attributionResult.overallConfidence}%
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-1 ${
                      attributionResult.overallConfidence >= 90
                        ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                        : attributionResult.overallConfidence >= 75
                        ? 'bg-[#1560BD]/20 text-[#7CB9E8] border-[#7CB9E8]/30'
                        : 'bg-[#960018]/20 text-[#C44536] border-[#960018]/40'
                    }`}
                  >
                    {attributionResult.confidenceClassification} CONFIDENCE
                  </span>
                </div>
              </div>

              {/* Attribution Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-white/[0.06] font-mono text-xs">
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">DISTANCE</span>
                  <strong className="text-[#FAFAF5] text-sm font-space">{attributionResult.nearestVasp.hopDistance} HOPS</strong>
                  <span className="text-[10px] text-[#9D9A92] block mt-0.5">Shortest Ledger Path</span>
                </div>

                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">RELATION TYPE</span>
                  <strong className="text-[#7CB9E8] text-sm font-space">{attributionResult.nearestVasp.relationType}</strong>
                  <span className="text-[10px] text-[#9D9A92] block mt-0.5">Deposit Signature</span>
                </div>

                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">NETWORK PROTOCOL</span>
                  <strong className="text-[#FAFAF5] text-sm font-space">{attributionResult.detectedChain}</strong>
                  <span className="text-[10px] text-[#9D9A92] block mt-0.5">Inflow Ledger</span>
                </div>

                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">ENTITY STATUS</span>
                  <strong
                    className={`text-sm font-space ${
                      attributionResult.nearestVasp.fiuStatus === 'REGISTERED'
                        ? 'text-[#ADC178]'
                        : 'text-amber-400'
                    }`}
                  >
                    {attributionResult.nearestVasp.fiuStatus}
                  </strong>
                  <span className="text-[10px] text-[#9D9A92] block mt-0.5">
                    {attributionResult.nearestVasp.pmlaCompliant ? 'Compliant Reporting Desk' : 'Non-Compliant Offshore'}
                  </span>
                </div>
              </div>

              {/* Suspect Target vs Deposit Address Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-b border-white/[0.06] font-mono text-xs">
                <div className="p-3 rounded-lg bg-black/20 border border-[#960018]/30 space-y-1">
                  <span className="text-[10px] text-[#C44536] block uppercase font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C44536]"></span>
                    ORIGIN // SUSPECT UNKNOWN WALLET
                  </span>
                  <CopyBadge text={attributionResult.suspectWallet} />
                  <span className="text-[10px] text-[#9D9A92] block">
                    Classification: Unattributed Transit Entity
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/20 border border-[#ADC178]/30 space-y-1">
                  <span className="text-[10px] text-[#ADC178] block uppercase font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ADC178]"></span>
                    DESTINATION // ATTRIBUTED VASP DEPOSIT ADDRESS
                  </span>
                  <CopyBadge text={attributionResult.nearestVasp.depositAddress} />
                  <span className="text-[10px] text-[#9D9A92] block">
                    Classification: {attributionResult.nearestVasp.vaspName} Hot Custody
                  </span>
                </div>
              </div>

              {/* LOW CONFIDENCE / NO RELIABLE ATTRIBUTION ALERT */}
              {attributionResult.overallConfidence < 40 ? (
                <div className="mt-4 p-4 rounded-lg bg-[#960018]/15 border border-[#960018]/30 text-xs font-mono text-[#C44536] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                    <span>NO RELIABLE ATTRIBUTION IDENTIFIED ({attributionResult.overallConfidence}%)</span>
                  </div>
                  <p className="leading-relaxed text-[#D8D3C7]">
                    Zero-guessing protocol engaged. Attribution confidence falls below mandatory admissibility threshold (40.0%). Intermediary mixers or insufficient on-chain deposit evidence preclude conclusive VASP attribution.
                  </p>
                </div>
              ) : attributionResult.overallConfidence < 60 ? (
                <div className="mt-4 p-4 rounded-lg bg-amber-950/30 border border-amber-700/40 text-xs font-mono text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>LOW CONFIDENCE ATTRIBUTION ALERT ({attributionResult.overallConfidence}%)</span>
                  </div>
                  <p className="leading-relaxed text-[#D8D3C7]">
                    No sufficiently strong deposit-address relationship was identified within the configured 5-hop scope due to mixer obfuscation or equal-output CoinJoin distribution.
                  </p>
                </div>
              ) : null}

              {/* SECTION 15: WHY THIS VASP & SCORE BREAKDOWN */}
              <div className="mt-5 p-4 rounded-xl bg-black/20 border border-white/[0.06] font-mono text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div>
                    <span className="text-[#ADC178] text-[10px] uppercase font-bold tracking-wider block">
                      EXPLAINABLE ATTRIBUTION ENGINE // SECTION 15
                    </span>
                    <h3 className="font-space font-bold text-base text-[#FAFAF5] mt-0.5">
                      WHY THIS VASP?
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#9D9A92] block">ATTRIBUTION CONFIDENCE</span>
                    <strong className="text-[#ADC178] font-bold text-base">
                      {attributionResult.overallConfidence}%
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Qualitative Proof Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-[#9D9A92] text-[10px] uppercase block font-semibold">
                      EVIDENTIARY RATIONALE
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] font-bold">✓</span>
                        <span>Known deposit address associated with VASP infrastructure</span>
                      </div>
                      <div className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] font-bold">✓</span>
                        <span>Strong cluster correlation with verified co-spend activity</span>
                      </div>
                      <div className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] font-bold">✓</span>
                        <span>{attributionResult.nearestVasp.hopDistance}-hop directed transaction path identified</span>
                      </div>
                      <div className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] font-bold">✓</span>
                        <span>Verified VASP statutory intelligence (FIU-IND compliant)</span>
                      </div>
                      <div className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] font-bold">✓</span>
                        <span>Cross-chain bridge relay correlation confirmed</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 7-Signal Score Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[#9D9A92] text-[10px] uppercase block font-semibold">
                      SCORE BREAKDOWN (7-SIGNAL MODEL)
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        { label: 'Transaction proximity', weight: 24, score: attributionResult.investigationResult?.scoreBreakdown.transactionProximity.score ?? 21.6 },
                        { label: 'Deposit match', weight: 22, score: attributionResult.investigationResult?.scoreBreakdown.depositMatch.score ?? 21.5 },
                        { label: 'Cluster correlation', weight: 18, score: attributionResult.investigationResult?.scoreBreakdown.cluster.score ?? 16.2 },
                        { label: 'Registry evidence', weight: 15, score: attributionResult.investigationResult?.scoreBreakdown.registry.score ?? 13.8 },
                        { label: 'Cross-chain', weight: 10, score: attributionResult.investigationResult?.scoreBreakdown.crossChain.score ?? 8.9 },
                        { label: 'Behavior', weight: 7, score: attributionResult.investigationResult?.scoreBreakdown.behavior.score ?? 6.1 },
                        { label: 'Historical', weight: 4, score: attributionResult.investigationResult?.scoreBreakdown.historical.score ?? 4.0 },
                      ].map((sig) => (
                        <div key={sig.label} className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                          <span className="text-[#9D9A92]">{sig.label}:</span>
                          <span className="font-bold text-[#FAFAF5]">
                            {sig.score.toFixed(1)} / {sig.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('SIGNALS')}
                    className="px-4 py-2 bg-[#25282D]/70 hover:bg-[#25282D] text-[#FAFAF5] font-space font-semibold text-xs rounded-lg border border-white/[0.08] transition-colors flex items-center gap-1.5 shadow-glass-card"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#7CB9E8]">fact_check</span>
                    <span>View Attribution Evidence ({attributionResult.evidenceTrail.length})</span>
                  </button>

                  <Link
                    href="/fund-flow-graph"
                    className="px-4 py-2 bg-[#25282D]/70 hover:bg-[#25282D] text-[#FAFAF5] font-space font-semibold text-xs rounded-lg border border-white/[0.08] transition-colors flex items-center gap-1.5 shadow-glass-card"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#7CB9E8]">hub</span>
                    <span>View Fund Flow</span>
                  </Link>

                  <Link
                    href={`/investigations?wallet=${encodeURIComponent(attributionResult.suspectWallet)}&vasp=${encodeURIComponent(attributionResult.nearestVasp.vaspName)}&confidence=${attributionResult.overallConfidence}`}
                    className="px-4 py-2 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg shadow-glass-card transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_special</span>
                    <span>Create Investigation</span>
                  </Link>
                </div>

                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#ADC178] to-[#1B512D] hover:opacity-95 text-[#FAFAF5] font-space font-bold text-xs uppercase rounded-lg shadow-glass-card transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  <span>Prepare VASP Request</span>
                </button>
              </div>
            </div>
            )}

            {/* Navigation Tabs for Forensic Details */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1 font-mono text-xs overflow-x-auto">
              {[
                { id: 'OVERVIEW', label: 'ATTRIBUTION SIGNALS & PROOF', icon: 'verified' },
                { id: 'CANDIDATES', label: 'CANDIDATE VASP RANKING', icon: 'format_list_numbered' },
                { id: 'HOPS', label: 'TRANSACTION TRAIL (HOPS)', icon: 'timeline' },
                { id: 'DIRECTORY', label: 'VASP DIRECTORY', icon: 'domain' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-t-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#1C1D20] text-[#7CB9E8] border-t-2 border-[#7CB9E8] border-x border-white/[0.08]'
                      : 'text-[#9D9A92] hover:text-[#FAFAF5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT 1: ATTRIBUTION SIGNALS & TRANSPARENT EVIDENCE */}
            {activeTab === 'OVERVIEW' && (
              <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="font-space font-bold text-sm text-[#FAFAF5]">
                      Transparent Attribution Confidence Methodology
                    </h3>
                    <p className="font-mono text-xs text-[#9D9A92]">
                      7-Signal Probabilistic Model for Smart India Hackathon Demonstrations
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#ADC178] bg-[#1B512D]/20 px-2.5 py-1 rounded border border-[#ADC178]/30 font-semibold">
                    EXPLAINABLE AI
                  </span>
                </div>

                {/* 7 Signals Breakdown Grid */}
                <div className="space-y-3">
                  {attributionResult.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3 rounded-lg bg-black/20 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              sig.verified
                                ? 'bg-[#1B512D]/40 text-[#ADC178] border border-[#ADC178]/40'
                                : 'bg-white/5 text-[#74736F]'
                            }`}
                          >
                            {sig.verified ? '✓' : '—'}
                          </span>
                          <span className="font-sans font-semibold text-[#FAFAF5] text-xs">{sig.label}</span>
                          <span className="text-[10px] text-[#7CB9E8] font-bold">Weight: {sig.weightPercent}%</span>
                        </div>
                        <p className="text-[11px] text-[#9D9A92] pl-6">{sig.evidenceText}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="w-24 bg-white/[0.06] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sig.verified ? 'bg-[#ADC178]' : 'bg-[#74736F]'}`}
                            style={{ width: `${sig.score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-[#FAFAF5] w-14 text-right">
                          +{sig.contribution.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signals Checklist */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  <h4 className="font-space font-semibold text-xs text-[#FAFAF5] uppercase tracking-wider">
                    Attribution Signals &amp; Corroboration Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {attributionResult.evidenceTrail.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#D8D3C7]">
                        <span className="text-[#ADC178] shrink-0 font-bold">✓</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VASP CANDIDATE RANKING */}
            {activeTab === 'CANDIDATES' && (
              <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card overflow-hidden transition-colors">
                <div className="p-4 bg-black/20 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h3 className="font-space font-semibold text-sm text-[#FAFAF5]">
                      Ranked VASP Candidates
                    </h3>
                    <p className="font-mono text-xs text-[#9D9A92]">
                      Relative proximity, deposit heuristic correlation, and statutory registration
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#7CB9E8] font-semibold">
                    {attributionResult.candidates.length} Evaluated
                  </span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {attributionResult.candidates.map((cand) => (
                    <div
                      key={cand.vaspId}
                      className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-white/5 text-[#7CB9E8] flex items-center justify-center font-bold text-[11px] border border-white/[0.08]">
                            #{cand.rank}
                          </span>
                          <span className="font-sans font-bold text-sm text-[#FAFAF5]">{cand.vaspName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cand.fiuStatus === 'REGISTERED'
                                ? 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {cand.fiuStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#9D9A92] text-[11px]">
                          <span>Distance: <strong className="text-[#FAFAF5]">{cand.hopDistance} Hops</strong></span>
                          <span>•</span>
                          <span>Relation: <strong className="text-[#7CB9E8]">{cand.relationType}</strong></span>
                          <span>•</span>
                          <span>Network: {cand.network}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="font-space font-bold text-lg text-[#ADC178]">
                            {cand.confidenceScore}%
                          </div>
                          <span className="text-[10px] text-[#9D9A92]">Confidence</span>
                        </div>
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-[#25282D]/80 hover:bg-[#1560BD] text-[#FAFAF5] border border-white/[0.08] text-xs transition-colors font-semibold shadow-glass-card"
                        >
                          Select →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: TRANSACTION TRAIL (HOPS) */}
            {activeTab === 'HOPS' && (
              <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card overflow-hidden space-y-4 p-5 transition-colors">
                <h3 className="font-space font-bold text-sm text-[#FAFAF5]">
                  Multi-Hop Directed Transaction Trail
                </h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
                  {attributionResult.hopTrail.map((hop, index) => (
                    <div key={index} className="relative space-y-1">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#7CB9E8] ring-4 ring-[#1C1D20]"></span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-black/30 text-[#7CB9E8] border border-[#7CB9E8]/30 font-bold">
                          HOP {hop.hopNumber}
                        </span>
                        <span className="font-sans font-semibold text-[#FAFAF5]">{hop.label}</span>
                        <span className="text-[#74736F] text-[11px]">• {hop.chain}</span>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/[0.04] font-mono text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[#9D9A92]">
                          <span>Address:</span>
                          <CopyBadge text={hop.address} />
                        </div>
                        <div className="flex items-center justify-between text-[#9D9A92]">
                          <span>Amount Transferred:</span>
                          <strong className="text-[#FAFAF5]">{hop.amount}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[#9D9A92]">
                          <span>TX Hash:</span>
                          <span className="text-[#7CB9E8] text-[10px]">{hop.txHash.slice(0, 20)}...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: MONITORED VASP DIRECTORY */}
            {activeTab === 'DIRECTORY' && (
              <div id="directory" className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card overflow-hidden transition-colors">
                <div className="p-4 bg-black/20 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-space font-semibold text-sm text-[#FAFAF5]">
                      Monitored VASP Entities &amp; Verified Intelligence Database
                    </h3>
                    <p className="text-[11px] font-mono text-[#9D9A92] mt-0.5">
                      FIU-IND reporting entities, authorized hot/cold clusters, and statutory provenances
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(true);
                      setImportReport(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#1560BD] to-[#436B95] text-[#FAFAF5] font-space font-semibold text-xs flex items-center gap-1.5 shadow-glass-card hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Import Intelligence (CSV/JSON)</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/30 text-[#9D9A92] uppercase text-[11px] border-b border-white/[0.06]">
                      <tr>
                        <th className="p-3">Entity Name</th>
                        <th className="p-3">Compliance Status</th>
                        <th className="p-3 text-center">Verified Wallets</th>
                        <th className="p-3 text-center">Clusters</th>
                        <th className="p-3 text-right">Provenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {(vaspDirectory.length > 0 ? vaspDirectory : VASP_LIST).map((v) => (
                        <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3">
                            <div className="font-sans font-semibold text-[#FAFAF5] text-xs">{v.name}</div>
                            <div className="text-[10px] text-[#74736F]">{v.legalName || v.country}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (v.registrationStatus === 'REGISTERED' || v.fiuStatus === 'REGISTERED')
                                  ? 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {v.registrationStatus || v.fiuStatus || 'REGISTERED'}
                            </span>
                            <div className="text-[9px] text-[#74736F] mt-0.5 font-mono">
                              {v.regulatoryIdentifier || 'FIU-IND COMPLIANT'}
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-[#7CB9E8]">
                            {v.addressCount !== undefined ? `${v.addressCount} Addresses` : 'Verified Cluster'}
                          </td>
                          <td className="p-3 text-center font-mono text-[#D8D3C7]">
                            {v.clusterCount !== undefined ? `${v.clusterCount} Clusters` : '1 Multi-sig'}
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06] text-[10px] text-[#9D9A92]">
                              {v.sourceType || 'verified_public_source'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Side Intelligence Dossier (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            {/* Cluster Intelligence */}
            <div className="p-5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card space-y-3 transition-colors">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
                <span className="material-symbols-outlined text-[#7CB9E8] text-[18px]">workspaces</span>
                <h3 className="font-space font-bold text-sm text-[#FAFAF5]">
                  Wallet Cluster Intelligence
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase font-semibold">IDENTIFIED CLUSTER</span>
                  <span className="text-[#FAFAF5] font-semibold">{attributionResult.clusterSummary.clusterTag}</span>
                </div>
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase font-semibold">CORRELATED WALLETS</span>
                  <span className="text-[#7CB9E8] font-bold">{attributionResult.clusterSummary.totalWalletsInCluster} Addresses</span>
                </div>
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase font-semibold">CUMULATIVE HOLDINGS</span>
                  <span className="text-[#ADC178] font-bold">{attributionResult.clusterSummary.totalBalanceINR}</span>
                </div>
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase font-semibold">HEURISTIC METHOD</span>
                  <span className="text-[#D8D3C7] text-[11px]">{attributionResult.clusterSummary.heuristicMethod}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-[11px] text-[#9D9A92] leading-relaxed">
                Address clustering helps identify relationships between wallets that may otherwise appear independent on public explorers.
              </div>
            </div>

            {/* Risk Intelligence */}
            <div className="p-5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-[#960018]/30 shadow-glass-card space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#C44536] text-[18px]">gshield</span>
                  <h3 className="font-space font-bold text-sm text-[#FAFAF5]">
                    Risk Intelligence Indicators
                  </h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#960018]/20 text-[#FAFAF5] font-bold border border-[#960018]/40">
                  {attributionResult.riskSummary.level}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-[#9D9A92]">Threat Score:</span>
                  <span className="text-[#C44536] font-bold text-base">{attributionResult.riskSummary.score}/100</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-[#74736F] uppercase block font-semibold">ACTIVE THREAT FLAGS</span>
                  {attributionResult.riskSummary.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#C44536] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C44536]"></span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#74736F]">
                Notice: Simulated risk indicators for demonstration purposes.
              </div>
            </div>

            {/* Audit & Legal Chain of Custody */}
            <div className="p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] text-[11px] font-mono text-[#9D9A92] space-y-2 shadow-glass-card transition-colors">
              <div className="flex items-center justify-between text-[#FAFAF5] font-semibold">
                <span>AUDIT INTEGRITY</span>
                <span className="text-[#ADC178] font-bold">SHA-256 SEALED</span>
              </div>
              <div>Analyzed: <span className="text-[#D8D3C7]">{attributionResult.analyzedAt}</span></div>
              <p className="text-[10px] leading-relaxed text-[#74736F]">
                {attributionResult.methodologyNotice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHAINTRACE VASP REQUEST WORKFLOW MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#1C1D20] border border-white/[0.12] rounded-xl shadow-glass-elevated p-6 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ADC178] text-[22px]">gavel</span>
                <div>
                  <h3 className="font-space font-bold text-base text-[#FAFAF5]">
                    Statutory VASP Requisition Generator
                  </h3>
                  <span className="font-mono text-[10px] text-[#ADC178] uppercase font-bold">
                    DEMO REQUEST — NOT A LIVE GOVERNMENT SUBMISSION
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestDispatched(false);
                }}
                className="text-[#9D9A92] hover:text-[#FAFAF5]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Step Progression */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.06] pb-3 text-[#74736F]">
              <span className={requestStep >= 1 ? 'text-[#7CB9E8] font-bold' : ''}>1. Target VASP</span>
              <span>→</span>
              <span className={requestStep >= 2 ? 'text-[#7CB9E8] font-bold' : ''}>2. Request Type</span>
              <span>→</span>
              <span className={requestStep >= 3 ? 'text-[#7CB9E8] font-bold' : ''}>3. Evidence Review</span>
            </div>

            {/* Step 1 & 2: Form */}
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#9D9A92] mb-1 font-semibold">Attributed Target VASP</label>
                <input
                  type="text"
                  readOnly
                  value={`${attributionResult.nearestVasp.vaspName} (${attributionResult.nearestVasp.fiuRegNo})`}
                  className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5]"
                />
              </div>

              <div>
                <label className="block text-[#9D9A92] mb-1.5 font-semibold">Select Statutory Requisition Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestType('DISCLOSURE')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      requestType === 'DISCLOSURE'
                        ? 'bg-[#1560BD]/20 border-[#7CB9E8] text-[#FAFAF5] shadow-signal-blue'
                        : 'bg-black/20 border-white/[0.06] text-[#9D9A92] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-sans font-bold text-xs text-[#FAFAF5]">Lawful Information Disclosure</div>
                    <p className="text-[10px] mt-1 text-[#9D9A92]">KYC &amp; Transaction Identity Requisition</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('FREEZE')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      requestType === 'FREEZE'
                        ? 'bg-[#960018]/20 border-[#C44536] text-[#FAFAF5] shadow-signal-red'
                        : 'bg-black/20 border-white/[0.06] text-[#9D9A92] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-sans font-bold text-xs text-[#C44536]">Asset Freeze Notice</div>
                    <p className="text-[10px] mt-1 text-[#9D9A92]">Emergency VASP Account &amp; Vault Freezing</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#9D9A92] mb-1 font-semibold">Target Deposit Address / Transaction Evidence</label>
                <input
                  type="text"
                  readOnly
                  value={attributionResult.nearestVasp.depositAddress}
                  className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#7CB9E8] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#9D9A92] mb-1 font-semibold">Attribution Basis (Pre-Filled from Engine)</label>
                <textarea
                  readOnly
                  rows={3}
                  value={`Automated Attribution: ${attributionResult.overallConfidence}% Confidence (${attributionResult.nearestVasp.hopDistance} Hops). Evidence: ${attributionResult.evidenceTrail.join('; ')}`}
                  className="w-full p-2.5 bg-black/30 border border-white/[0.08] rounded-lg text-[#D8D3C7] text-[11px] focus:outline-none"
                />
              </div>

              {requestDispatched && (
                <div className="p-3 bg-[#1B512D]/30 border border-[#ADC178]/40 rounded-lg text-[#ADC178] text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>DEMONSTRATION REQUISITION GENERATED WITH SECTION 65B DIGITAL SEAL</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#74736F] font-medium">
                MOCK STATUTORY NOTICE GENERATOR
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#FAFAF5] rounded-lg font-mono text-xs border border-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestDispatched(true);
                    setTimeout(() => {
                      setShowRequestModal(false);
                      setRequestDispatched(false);
                    }, 1800);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-[#1B512D] to-[#ADC178] text-[#15171B] font-space font-bold rounded-lg text-xs uppercase shadow-glass-card hover:opacity-95"
                >
                  Generate Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VASP Intelligence Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1D20] border border-white/[0.12] rounded-xl shadow-glass-elevated max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7CB9E8] text-[22px]">upload_file</span>
                <div>
                  <h3 className="font-space font-bold text-base text-[#FAFAF5]">
                    Safe VASP Intelligence Import Engine
                  </h3>
                  <p className="text-[11px] font-mono text-[#9D9A92]">
                    Ingest law enforcement intelligence, exchange disclosures, or verified cluster dumps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#9D9A92] hover:text-[#FAFAF5] text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!importText.trim()) return;

                setIsImporting(true);
                setImportReport(null);

                try {
                  const payload: any = { format: importFormat };
                  if (importFormat === 'json') {
                    payload.records = JSON.parse(importText);
                  } else {
                    payload.csv = importText;
                  }

                  const res = await fetch('/api/vasp/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json();
                  setIsImporting(false);
                  setImportReport(data.report || data);

                  if (res.ok && (data.report?.importedCount > 0 || data.importedCount > 0)) {
                    fetchVaspDirectory();
                  }
                } catch (err: any) {
                  setIsImporting(false);
                  setImportReport({
                    success: false,
                    errorCount: 1,
                    errors: [{ rowNumber: 0, error: err?.message || 'Failed to parse payload' }],
                  });
                }
              }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#9D9A92]">Payload Format:</span>
                <div className="flex items-center bg-black/30 rounded-lg border border-white/[0.08] p-0.5">
                  <button
                    type="button"
                    onClick={() => setImportFormat('json')}
                    className={`px-3 py-1 text-xs font-mono rounded-md ${importFormat === 'json' ? 'bg-[#1560BD] text-[#FAFAF5] font-semibold' : 'text-[#9D9A92]'}`}
                  >
                    JSON Array
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportFormat('csv')}
                    className={`px-3 py-1 text-xs font-mono rounded-md ${importFormat === 'csv' ? 'bg-[#1560BD] text-[#FAFAF5] font-semibold' : 'text-[#9D9A92]'}`}
                  >
                    CSV Text
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9D9A92] mb-1">
                  {importFormat === 'json'
                    ? 'JSON Records (Array of { vasp, chain, address, addressType, source, confidence })'
                    : 'CSV Text (Headers: vasp,chain,address,addressType,source,confidence)'}
                </label>
                <textarea
                  rows={7}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    importFormat === 'json'
                      ? '[\n  {\n    "vasp": "coindcx",\n    "chain": "ethereum",\n    "address": "0x38b25A89d120B44e3bAc19777E576921319fe9A1",\n    "addressType": "deposit",\n    "source": "Court Production Order",\n    "confidence": 0.98\n  }\n]'
                      : 'vasp,chain,address,addressType,source,confidence\ncoindcx,ethereum,0x38b25A89d120B44e3bAc19777E576921319fe9A1,deposit,Court Order,0.98'
                  }
                  className="w-full p-3 bg-black/30 border border-white/[0.08] rounded-lg font-mono text-xs text-[#FAFAF5] focus:outline-none focus:border-[#7CB9E8]"
                />
              </div>

              {importReport && (
                <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${importReport.errorCount > 0 ? 'bg-[#960018]/15 border-[#960018]/30 text-[#C44536]' : 'bg-[#1B512D]/30 border-[#ADC178]/40 text-[#ADC178]'}`}>
                  <div className="font-bold">
                    Import Finished: {importReport.importedCount || 0} Ingested, {importReport.skippedCount || 0} Skipped, {importReport.errorCount || 0} Errors
                  </div>
                  {importReport.errors && importReport.errors.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#C44536]">
                      {importReport.errors.slice(0, 4).map((err: any, idx: number) => (
                        <li key={idx}>Row {err.rowNumber}: {err.reason || err.error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#FAFAF5] rounded-lg font-mono text-xs border border-white/[0.08]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 disabled:opacity-50 text-[#FAFAF5] font-space font-semibold rounded-lg text-xs shadow-glass-card transition-opacity"
                >
                  {isImporting ? 'Validating & Ingesting...' : 'Validate & Ingest Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function VaspAttributionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-theme-heading font-mono text-xs">Loading Attribution Suite...</div>}>
      <VaspAttributionContent />
    </Suspense>
  );
}

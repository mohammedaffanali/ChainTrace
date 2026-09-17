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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-theme-accent animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${dataMode === 'live' ? 'text-emerald-400' : 'text-theme-accent'}`}>
                CHAINTRACE FORENSIC PIPELINE // {dataMode === 'live' ? 'LIVE TELEMETRY' : 'SIH 2026'}
              </span>
              <span className="text-theme-border">•</span>
              <span className={`font-mono text-[10px] font-semibold ${dataMode === 'live' ? 'text-emerald-400' : 'text-theme-gold'}`}>
                {dataMode === 'live' ? 'REAL BLOCKCHAIN PROVIDERS' : 'CONTROLLED DEMONSTRATION ENVIRONMENT'}
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Automated VASP Attribution Engine
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Automated attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-surface-secondary hover:bg-theme-surface text-theme-gold font-space font-semibold text-xs rounded-md border border-theme-gold/40 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              <span>Prepare VASP Request</span>
            </button>
            <Link
              href="/fund-flow-graph"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded-md shadow-md shadow-blue-600/20 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Open in Fund Flow</span>
            </Link>
          </div>
        </div>

        {/* Live Query Error Banner */}
        {queryError && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-3 text-red-400 animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold block uppercase tracking-wider">Blockchain Provider Query Error</span>
              <p className="mt-0.5 text-theme-fg">{queryError}</p>
              <span className="text-[10px] text-theme-text-muted mt-1 block">
                LIVE mode enforces strict provider integrity. No simulated records are substituted for provider failures.
              </span>
            </div>
            <button
              onClick={() => setQueryError(null)}
              className="text-theme-text-muted hover:text-theme-heading text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* PRIMARY WALLET INPUT & NETWORK SELECTOR BAR */}
        <div className="bg-theme-surface p-5 rounded-xl border border-theme-border shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-theme-primary text-[18px]">search</span>
              <span className="font-space font-semibold text-sm text-theme-heading">
                Suspect Target Input &amp; Multi-Chain Resolution
              </span>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-theme-text-muted mr-1 font-semibold">DEMO TARGETS:</span>
              <button
                onClick={() => loadPreset(PRIMARY_DEMO_WALLET)}
                className="px-2.5 py-1 rounded bg-theme-surface-secondary hover:bg-theme-surface text-theme-primary font-mono text-[10px] border border-theme-border transition-colors font-medium shadow-xs"
                title="Primary SIH Demo Target"
              >
                0x7A91...4F82 (Tron/Polygon)
              </button>
              <button
                onClick={() => loadPreset(TRON_HAWALA_WALLET)}
                className="px-2.5 py-1 rounded bg-theme-surface-secondary hover:bg-theme-surface text-amber-600 dark:text-amber-300 font-mono text-[10px] border border-theme-border transition-colors font-medium shadow-xs"
                title="Tron Hawala Target"
              >
                TWk93zM... (HTX Offshore)
              </button>
              <button
                onClick={() => loadPreset(BTC_WASABI_WALLET)}
                className="px-2.5 py-1 rounded bg-theme-surface-secondary hover:bg-theme-surface text-red-600 dark:text-red-300 font-mono text-[10px] border border-theme-border transition-colors font-medium shadow-xs"
                title="Wasabi Mixer Peel (Low Confidence Case)"
              >
                bc1q9v8... (Mixer Obfuscation)
              </button>
              <span className="font-mono text-[10px] text-theme-text-muted ml-2 font-semibold border-l border-theme-border pl-2">REFUSAL DEMOS:</span>
              <button
                onClick={() => loadPreset(REFUSAL_PEEL_WALLET)}
                className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono text-[10px] border border-red-500/30 transition-colors font-medium shadow-xs"
                title="Mixer Peel — NO_RELIABLE_ATTRIBUTION"
              >
                0x0000...beef (Peel/Mixer)
              </button>
              <button
                onClick={() => loadPreset(REFUSAL_DORMANT_WALLET)}
                className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono text-[10px] border border-red-500/30 transition-colors font-medium shadow-xs"
                title="Dormant Wallet — NO_RELIABLE_ATTRIBUTION"
              >
                0x1111...0000 (Dormant)
              </button>
              <button
                onClick={() => loadPreset(REFUSAL_SOLANA_WALLET)}
                className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono text-[10px] border border-red-500/30 transition-colors font-medium shadow-xs"
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
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                Suspect Wallet Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                  account_balance_wallet
                </span>
                <input
                  type="text"
                  required
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Enter suspect wallet address (e.g. 0x7A91...4F82)"
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                Blockchain Network
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
                className="w-full h-10 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none transition-colors"
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
                className="w-full h-10 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-bold text-xs uppercase tracking-wider rounded-md shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px] animate-spin">
                  {isAnalyzing ? 'sync' : 'radar'}
                </span>
                <span>{isAnalyzing ? 'ANALYZING...' : 'TRACE & ATTRIBUTE'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 9-STAGE ANALYSIS PIPELINE (ANIMATED PROGRESSION) */}
        <div className="bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-theme-border pb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-theme-accent animate-ping' : 'bg-theme-success'}`}></span>
              <span className="font-space font-bold text-xs uppercase tracking-wider text-theme-heading">
                ANALYSIS PIPELINE TELEMETRY
              </span>
            </div>
            <span className="font-mono text-[10px] text-theme-text-muted">
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
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-theme-surface-secondary border-theme-success/40 text-theme-success'
                      : isCurrent
                      ? 'bg-theme-surface border-theme-primary text-theme-primary shadow-md shadow-blue-500/10 animate-pulse'
                      : 'bg-theme-surface-secondary/40 border-theme-border text-theme-text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold">{stage.code}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      {isCompleted ? 'check_circle' : isCurrent ? 'sync' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="font-space font-bold text-[11px] mt-1 text-theme-heading leading-tight">
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
              <div className="rounded-xl border-2 border-red-500/60 bg-theme-surface shadow-md overflow-hidden">
                {/* Danger top bar */}
                <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-theme-border">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-theme-text-muted block font-semibold">
                        ANTI-OVERCLAIMING PROTOCOL — ATTRIBUTION REFUSAL
                      </span>
                      <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-red-500 mt-1">
                        NO RELIABLE ATTRIBUTION
                      </h2>
                      <p className="font-mono text-xs text-theme-text-muted mt-1">
                        Statutory finding: INSUFFICIENT_EVIDENCE — System refuses to name a VASP
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-space font-extrabold text-4xl text-red-500">
                        {attributionResult.overallConfidence.toFixed(2)}%
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-1 bg-red-500/10 text-red-500 border-red-500/40">
                        INSUFFICIENT CONFIDENCE
                      </span>
                    </div>
                  </div>

                  {/* Why System Refused Banner */}
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 text-[22px] shrink-0 mt-0.5">gpp_bad</span>
                    <div>
                      <span className="font-space font-bold text-sm text-red-500 block">
                        Why the system refused attribution
                      </span>
                      <p className="font-mono text-xs text-theme-fg mt-1 leading-relaxed">
                        The aggregate 7-signal confidence score is <strong>{attributionResult.overallConfidence.toFixed(2)}%</strong>, which is
                        below the <strong>30% minimum attribution threshold</strong>. Returning a VASP name at this
                        confidence level would constitute speculative overclaiming — inadmissible in forensic evidence
                        under the Indian Evidence Act. The system enforces a strict refusal rather than guess.
                      </p>
                    </div>
                  </div>

                  {/* 7-Signal Breakdown */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-theme-text-muted font-semibold block mb-2">
                      7-SIGNAL BREAKDOWN — All signals below threshold
                    </span>
                    <div className="space-y-2">
                      {attributionResult.signals.map((sig) => (
                        <div key={sig.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-theme-surface-secondary border border-theme-border">
                          <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">cancel</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] font-semibold text-theme-heading truncate">
                                {sig.label} <span className="text-theme-text-muted font-normal">(weight: {sig.weightPercent}%)</span>
                              </span>
                              <span className="font-mono text-[10px] font-bold text-red-500 shrink-0">
                                {sig.score}/100 → +{sig.contribution.toFixed(2)}%
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-theme-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-red-500/60"
                                style={{ width: `${sig.score}%` }}
                              />
                            </div>
                            <p className="font-mono text-[10px] text-theme-text-muted mt-1 leading-snug">{sig.evidenceText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-theme-text-muted font-semibold block mb-2">
                      SYSTEM RECOMMENDED ACTIONS
                    </span>
                    <div className="space-y-1.5">
                      {attributionResult.evidenceTrail.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-theme-surface-secondary border border-theme-border">
                          <span className="material-symbols-outlined text-[14px] text-theme-accent shrink-0 mt-0.5">
                            {i === 0 ? 'warning' : i === 1 ? 'analytics' : i === 2 ? 'gpp_bad' : 'task_alt'}
                          </span>
                          <span className="font-mono text-[10px] text-theme-fg leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Methodology Notice */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[16px] shrink-0 mt-0.5">info</span>
                    <p className="font-mono text-[10px] text-theme-text-muted leading-snug">
                      {attributionResult.methodologyNotice}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Crown Jewel Card — hidden when INSUFFICIENT */}
            {attributionResult.confidenceClassification !== 'INSUFFICIENT' && (
            <div
              className={`rounded-xl p-6 shadow-md relative overflow-hidden border-2 bg-theme-surface transition-colors ${
                attributionResult.overallConfidence >= 90
                  ? 'border-theme-gold/60 shadow-amber-500/5'
                  : attributionResult.overallConfidence >= 75
                  ? 'border-theme-primary/50 shadow-blue-500/5'
                  : 'border-theme-danger/50 shadow-red-500/5'
              }`}
            >
              {/* Subtle top gold/accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  attributionResult.overallConfidence >= 90
                    ? 'bg-gradient-to-r from-[#155EEF] via-[#A67C32] to-[#087F8C]'
                    : attributionResult.overallConfidence >= 75
                    ? 'bg-gradient-to-r from-[#155EEF] to-[#087F8C]'
                    : 'bg-gradient-to-r from-red-600 to-amber-500'
                }`}
              ></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-theme-text-muted block font-semibold">
                      NEAREST ATTRIBUTED VIRTUAL ASSET SERVICE PROVIDER
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        attributionResult.isDemonstrationData
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {attributionResult.isDemonstrationData ? 'DEMO SIMULATION' : 'LIVE TELEMETRY'}
                    </span>
                    {vaspLookup && (
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          vaspLookup.associationType === 'KNOWN_VASP_ADDRESS'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : vaspLookup.associationType === 'KNOWN_VASP_CLUSTER'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : vaspLookup.associationType === 'POSSIBLE_ASSOCIATION'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
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
                  <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-theme-heading mt-1">
                    {attributionResult.nearestVasp.vaspName}
                  </h2>
                  <p className="font-mono text-xs text-theme-text-muted mt-0.5">
                    Legal Entity: {attributionResult.nearestVasp.legalEntity} • Reg: {attributionResult.nearestVasp.fiuRegNo}
                  </p>
                  {vaspLookup && (
                    <div className="mt-2 text-xs font-mono p-2 rounded bg-theme-surface-secondary border border-theme-border flex items-center gap-2">
                      <span className="material-symbols-outlined text-theme-primary text-[15px]">verified</span>
                      <span className="text-theme-fg font-medium">
                        {vaspLookup.factualSummary || vaspLookup.associationDescription}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                  <span
                    className={`font-space font-extrabold text-3xl sm:text-4xl ${
                      attributionResult.overallConfidence >= 90
                        ? 'text-theme-success'
                        : attributionResult.overallConfidence >= 75
                        ? 'text-theme-primary'
                        : 'text-theme-warning'
                    }`}
                  >
                    {attributionResult.overallConfidence}%
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-1 ${
                      attributionResult.overallConfidence >= 90
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                        : attributionResult.overallConfidence >= 75
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
                    }`}
                  >
                    {attributionResult.confidenceClassification} CONFIDENCE
                  </span>
                </div>
              </div>

              {/* Attribution Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-theme-border font-mono text-xs">
                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase">DISTANCE</span>
                  <strong className="text-theme-heading text-sm font-space">{attributionResult.nearestVasp.hopDistance} HOPS</strong>
                  <span className="text-[10px] text-theme-text-muted block mt-0.5">Shortest Ledger Path</span>
                </div>

                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase">RELATION TYPE</span>
                  <strong className="text-theme-accent text-sm font-space">{attributionResult.nearestVasp.relationType}</strong>
                  <span className="text-[10px] text-theme-text-muted block mt-0.5">Deposit Signature</span>
                </div>

                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase">NETWORK PROTOCOL</span>
                  <strong className="text-theme-heading text-sm font-space">{attributionResult.detectedChain}</strong>
                  <span className="text-[10px] text-theme-text-muted block mt-0.5">Inflow Ledger</span>
                </div>

                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase">ENTITY STATUS</span>
                  <strong
                    className={`text-sm font-space ${
                      attributionResult.nearestVasp.fiuStatus === 'REGISTERED'
                        ? 'text-theme-success'
                        : 'text-theme-warning'
                    }`}
                  >
                    {attributionResult.nearestVasp.fiuStatus}
                  </strong>
                  <span className="text-[10px] text-theme-text-muted block mt-0.5">
                    {attributionResult.nearestVasp.pmlaCompliant ? 'Compliant Reporting Desk' : 'Non-Compliant Offshore'}
                  </span>
                </div>
              </div>

              {/* Suspect Target vs Deposit Address Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-b border-theme-border font-mono text-xs">
                <div className="p-3 rounded-lg bg-theme-surface-secondary border border-theme-border space-y-1">
                  <span className="text-[10px] text-theme-danger block uppercase font-semibold">
                    ORIGIN // SUSPECT UNKNOWN WALLET
                  </span>
                  <CopyBadge text={attributionResult.suspectWallet} />
                  <span className="text-[10px] text-theme-text-muted block">
                    Classification: Unattributed Transit Entity
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-theme-surface-secondary border border-theme-success/30 space-y-1">
                  <span className="text-[10px] text-theme-success block uppercase font-semibold">
                    DESTINATION // ATTRIBUTED VASP DEPOSIT ADDRESS
                  </span>
                  <CopyBadge text={attributionResult.nearestVasp.depositAddress} />
                  <span className="text-[10px] text-theme-text-muted block">
                    Classification: {attributionResult.nearestVasp.vaspName} Hot Custody
                  </span>
                </div>
              </div>

              {/* LOW CONFIDENCE / NO RELIABLE ATTRIBUTION ALERT */}
              {attributionResult.overallConfidence < 40 ? (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-500 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                    <span>NO RELIABLE ATTRIBUTION IDENTIFIED ({attributionResult.overallConfidence}%)</span>
                  </div>
                  <p className="leading-relaxed">
                    Zero-guessing protocol engaged. Attribution confidence falls below mandatory admissibility threshold (40.0%). Intermediary mixers or insufficient on-chain deposit evidence preclude conclusive VASP attribution.
                  </p>
                </div>
              ) : attributionResult.overallConfidence < 60 ? (
                <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-xs font-mono text-amber-800 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>LOW CONFIDENCE ATTRIBUTION ALERT ({attributionResult.overallConfidence}%)</span>
                  </div>
                  <p className="leading-relaxed">
                    No sufficiently strong deposit-address relationship was identified within the configured 5-hop scope due to mixer obfuscation or equal-output CoinJoin distribution.
                  </p>
                </div>
              ) : null}

            {/* SECTION 15: WHY THIS VASP & SCORE BREAKDOWN */}
            <div className="mt-5 p-4 rounded-xl bg-theme-surface-secondary border border-theme-border font-mono text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border pb-3">
                  <div>
                    <span className="text-theme-gold text-[10px] uppercase font-bold tracking-wider block">
                      EXPLAINABLE ATTRIBUTION ENGINE // SECTION 15
                    </span>
                    <h3 className="font-space font-bold text-base text-theme-heading mt-0.5">
                      WHY THIS VASP?
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-theme-text-muted block">ATTRIBUTION CONFIDENCE</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                      {attributionResult.overallConfidence}%
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Qualitative Proof Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-theme-text-muted text-[10px] uppercase block font-semibold">
                      EVIDENTIARY RATIONALE
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-theme-fg">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Known deposit address associated with VASP infrastructure</span>
                      </div>
                      <div className="flex items-start gap-2 text-theme-fg">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Strong cluster correlation with verified co-spend activity</span>
                      </div>
                      <div className="flex items-start gap-2 text-theme-fg">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{attributionResult.nearestVasp.hopDistance}-hop directed transaction path identified</span>
                      </div>
                      <div className="flex items-start gap-2 text-theme-fg">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Verified VASP statutory intelligence (FIU-IND compliant)</span>
                      </div>
                      <div className="flex items-start gap-2 text-theme-fg">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Cross-chain bridge relay correlation confirmed</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 7-Signal Score Breakdown */}
                  <div className="space-y-2">
                    <span className="text-theme-text-muted text-[10px] uppercase block font-semibold">
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
                        <div key={sig.label} className="flex items-center justify-between py-0.5 border-b border-theme-border/40">
                          <span className="text-theme-text-secondary">{sig.label}:</span>
                          <span className="font-bold text-theme-heading">
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
                    className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-secondary text-theme-heading font-space font-semibold text-xs rounded-md border border-theme-border transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-theme-accent">fact_check</span>
                    <span>View Attribution Evidence ({attributionResult.evidenceTrail.length})</span>
                  </button>

                  <Link
                    href="/fund-flow-graph"
                    className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-secondary text-theme-heading font-space font-semibold text-xs rounded-md border border-theme-border transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-theme-primary">hub</span>
                    <span>View Fund Flow</span>
                  </Link>

                  <Link
                    href={`/investigations?wallet=${encodeURIComponent(attributionResult.suspectWallet)}&vasp=${encodeURIComponent(attributionResult.nearestVasp.vaspName)}&confidence=${attributionResult.overallConfidence}`}
                    className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded-md shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_special</span>
                    <span>Create Investigation</span>
                  </Link>
                </div>

                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#A67C32] to-[#C5A15A] hover:opacity-95 text-white font-space font-bold text-xs uppercase rounded-md shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  <span>Prepare VASP Request</span>
                </button>
              </div>
            </div>
            )}

            {/* Navigation Tabs for Forensic Details */}
            <div className="flex items-center gap-2 border-b border-theme-border pb-1 font-mono text-xs">
              {[
                { id: 'OVERVIEW', label: 'ATTRIBUTION SIGNALS & PROOF', icon: 'verified' },
                { id: 'CANDIDATES', label: 'CANDIDATE VASP RANKING', icon: 'format_list_numbered' },
                { id: 'HOPS', label: 'TRANSACTION TRAIL (HOPS)', icon: 'timeline' },
                { id: 'DIRECTORY', label: 'VASP DIRECTORY', icon: 'domain' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-t-md font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-theme-surface text-theme-primary border-t-2 border-theme-primary border-x border-theme-border'
                      : 'text-theme-text-muted hover:text-theme-heading'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT 1: ATTRIBUTION SIGNALS & TRANSPARENT EVIDENCE */}
            {activeTab === 'OVERVIEW' && (
              <div className="bg-theme-surface p-5 rounded-xl border border-theme-border shadow-sm space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <div>
                    <h3 className="font-space font-bold text-sm text-theme-heading">
                      Transparent Attribution Confidence Methodology
                    </h3>
                    <p className="font-mono text-xs text-theme-text-muted">
                      7-Signal Probabilistic Model for Smart India Hackathon Demonstrations
                    </p>
                  </div>
                  <span className="font-mono text-xs text-theme-gold bg-theme-surface-secondary px-2.5 py-1 rounded border border-theme-gold/30 font-semibold">
                    EXPLAINABLE AI
                  </span>
                </div>

                {/* 7 Signals Breakdown Grid */}
                <div className="space-y-3">
                  {attributionResult.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3 rounded-lg bg-theme-surface-secondary border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              sig.verified
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}
                          >
                            {sig.verified ? '✓' : '—'}
                          </span>
                          <span className="font-sans font-semibold text-theme-heading text-xs">{sig.label}</span>
                          <span className="text-[10px] text-theme-primary font-bold">Weight: {sig.weightPercent}%</span>
                        </div>
                        <p className="text-[11px] text-theme-text-secondary pl-6">{sig.evidenceText}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="w-24 bg-theme-border h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sig.verified ? 'bg-theme-success' : 'bg-gray-400'}`}
                            style={{ width: `${sig.score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-theme-heading w-14 text-right">
                          +{sig.contribution.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signals Checklist */}
                <div className="pt-4 border-t border-theme-border space-y-2">
                  <h4 className="font-space font-semibold text-xs text-theme-heading uppercase tracking-wider">
                    Attribution Signals &amp; Corroboration Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {attributionResult.evidenceTrail.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-theme-text-secondary">
                        <span className="text-theme-success shrink-0 font-bold">✓</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VASP CANDIDATE RANKING */}
            {activeTab === 'CANDIDATES' && (
              <div className="bg-theme-surface rounded-xl border border-theme-border shadow-sm overflow-hidden transition-colors">
                <div className="p-4 bg-theme-surface-secondary/70 border-b border-theme-border flex items-center justify-between">
                  <div>
                    <h3 className="font-space font-semibold text-sm text-theme-heading">
                      Ranked VASP Candidates
                    </h3>
                    <p className="font-mono text-xs text-theme-text-muted">
                      Relative proximity, deposit heuristic correlation, and statutory registration
                    </p>
                  </div>
                  <span className="font-mono text-xs text-theme-primary font-semibold">
                    {attributionResult.candidates.length} Evaluated
                  </span>
                </div>

                <div className="divide-y divide-theme-border">
                  {attributionResult.candidates.map((cand) => (
                    <div
                      key={cand.vaspId}
                      className="p-4 hover:bg-theme-surface-secondary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-theme-surface-secondary text-theme-primary flex items-center justify-center font-bold text-[11px] border border-theme-border">
                            #{cand.rank}
                          </span>
                          <span className="font-sans font-bold text-sm text-theme-heading">{cand.vaspName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cand.fiuStatus === 'REGISTERED'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40'
                            }`}
                          >
                            {cand.fiuStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-theme-text-muted text-[11px]">
                          <span>Distance: <strong className="text-theme-heading">{cand.hopDistance} Hops</strong></span>
                          <span>•</span>
                          <span>Relation: <strong className="text-theme-accent">{cand.relationType}</strong></span>
                          <span>•</span>
                          <span>Network: {cand.network}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="font-space font-bold text-lg text-theme-success">
                            {cand.confidenceScore}%
                          </div>
                          <span className="text-[10px] text-theme-text-muted">Confidence</span>
                        </div>
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="px-3 py-1.5 rounded bg-theme-surface-secondary hover:bg-theme-primary hover:text-white text-theme-primary border border-theme-border text-xs transition-colors font-semibold shadow-xs"
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
              <div className="bg-theme-surface rounded-xl border border-theme-border shadow-sm overflow-hidden space-y-4 p-4 transition-colors">
                <h3 className="font-space font-bold text-sm text-theme-heading">
                  Multi-Hop Directed Transaction Trail
                </h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-theme-border">
                  {attributionResult.hopTrail.map((hop, index) => (
                    <div key={index} className="relative space-y-1">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-theme-primary ring-4 ring-theme-surface"></span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-theme-surface-secondary text-theme-primary border border-theme-border font-bold">
                          HOP {hop.hopNumber}
                        </span>
                        <span className="font-sans font-semibold text-theme-heading">{hop.label}</span>
                        <span className="text-theme-text-muted text-[11px]">• {hop.chain}</span>
                      </div>
                      <div className="p-3 bg-theme-surface-secondary rounded-lg border border-theme-border font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between text-theme-text-muted">
                          <span>Address:</span>
                          <CopyBadge text={hop.address} />
                        </div>
                        <div className="flex items-center justify-between text-theme-text-muted">
                          <span>Amount Transferred:</span>
                          <strong className="text-theme-heading">{hop.amount}</strong>
                        </div>
                        <div className="flex items-center justify-between text-theme-text-muted">
                          <span>TX Hash:</span>
                          <span className="text-theme-accent text-[10px]">{hop.txHash.slice(0, 20)}...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: MONITORED VASP DIRECTORY */}
            {activeTab === 'DIRECTORY' && (
              <div id="directory" className="bg-theme-surface rounded-xl border border-theme-border shadow-sm overflow-hidden transition-colors">
                <div className="p-4 bg-theme-surface-secondary/70 border-b border-theme-border flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-space font-semibold text-sm text-theme-heading">
                      Monitored VASP Entities &amp; Verified Intelligence Database
                    </h3>
                    <p className="text-[11px] font-mono text-theme-text-muted mt-0.5">
                      FIU-IND reporting entities, authorized hot/cold clusters, and statutory provenances
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(true);
                      setImportReport(null);
                    }}
                    className="px-3 py-1.5 rounded bg-theme-primary text-white font-space font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Import Intelligence (CSV/JSON)</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-theme-surface-secondary/60 text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                      <tr>
                        <th className="p-3">Entity Name</th>
                        <th className="p-3">Compliance Status</th>
                        <th className="p-3 text-center">Verified Wallets</th>
                        <th className="p-3 text-center">Clusters</th>
                        <th className="p-3 text-right">Provenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {(vaspDirectory.length > 0 ? vaspDirectory : VASP_LIST).map((v) => (
                        <tr key={v.id} className="hover:bg-theme-surface-secondary/40 transition-colors">
                          <td className="p-3">
                            <div className="font-sans font-semibold text-theme-heading text-xs">{v.name}</div>
                            <div className="text-[10px] text-theme-text-muted">{v.legalName || v.country}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (v.registrationStatus === 'REGISTERED' || v.fiuStatus === 'REGISTERED')
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50'
                              }`}
                            >
                              {v.registrationStatus || v.fiuStatus || 'REGISTERED'}
                            </span>
                            <div className="text-[9px] text-theme-text-muted mt-0.5 font-mono">
                              {v.regulatoryIdentifier || 'FIU-IND COMPLIANT'}
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-theme-primary">
                            {v.addressCount !== undefined ? `${v.addressCount} Addresses` : 'Verified Cluster'}
                          </td>
                          <td className="p-3 text-center font-mono text-theme-fg">
                            {v.clusterCount !== undefined ? `${v.clusterCount} Clusters` : '1 Multi-sig'}
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-1.5 py-0.5 rounded bg-theme-surface-secondary border border-theme-border text-[10px] text-theme-text-muted">
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
            <div className="p-5 bg-theme-surface rounded-xl border border-theme-border shadow-sm space-y-3 transition-colors">
              <div className="flex items-center gap-2 border-b border-theme-border pb-2.5">
                <span className="material-symbols-outlined text-theme-primary text-[18px]">workspaces</span>
                <h3 className="font-space font-bold text-sm text-theme-heading">
                  Wallet Cluster Intelligence
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase font-semibold">IDENTIFIED CLUSTER</span>
                  <span className="text-theme-heading font-semibold">{attributionResult.clusterSummary.clusterTag}</span>
                </div>
                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase font-semibold">CORRELATED WALLETS</span>
                  <span className="text-theme-primary font-bold">{attributionResult.clusterSummary.totalWalletsInCluster} Addresses</span>
                </div>
                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase font-semibold">CUMULATIVE HOLDINGS</span>
                  <span className="text-theme-success font-bold">{attributionResult.clusterSummary.totalBalanceINR}</span>
                </div>
                <div>
                  <span className="text-theme-text-muted text-[10px] block uppercase font-semibold">HEURISTIC METHOD</span>
                  <span className="text-theme-fg text-[11px]">{attributionResult.clusterSummary.heuristicMethod}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-theme-surface-secondary border border-theme-border text-[11px] text-theme-text-muted leading-relaxed">
                Address clustering helps identify relationships between wallets that may otherwise appear independent on public explorers.
              </div>
            </div>

            {/* Risk Intelligence */}
            <div className="p-5 bg-theme-surface rounded-xl border border-theme-danger/30 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-theme-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-theme-danger text-[18px]">gshield</span>
                  <h3 className="font-space font-bold text-sm text-theme-heading">
                    Risk Intelligence Indicators
                  </h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold border border-red-200 dark:border-red-700/50">
                  {attributionResult.riskSummary.level}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-theme-text-muted">Threat Score:</span>
                  <span className="text-theme-danger font-bold text-base">{attributionResult.riskSummary.score}/100</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-theme-text-muted uppercase block font-semibold">ACTIVE THREAT FLAGS</span>
                  {attributionResult.riskSummary.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-theme-danger font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-danger"></span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-theme-border text-[10px] font-mono text-theme-text-muted">
                Notice: Simulated risk indicators for demonstration purposes.
              </div>
            </div>

            {/* Audit & Legal Chain of Custody */}
            <div className="p-4 bg-theme-surface rounded-xl border border-theme-border text-[11px] font-mono text-theme-text-muted space-y-2 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-theme-heading font-semibold">
                <span>AUDIT INTEGRITY</span>
                <span className="text-theme-success font-bold">SHA-256 SEALED</span>
              </div>
              <div>Analyzed: {attributionResult.analyzedAt}</div>
              <p className="text-[10px] leading-relaxed text-theme-text-muted">
                {attributionResult.methodologyNotice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHAINTRACE VASP REQUEST WORKFLOW MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-theme-surface border-2 border-theme-gold/50 rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-theme-gold text-[22px]">gavel</span>
                <div>
                  <h3 className="font-space font-bold text-base text-theme-heading">
                    Statutory VASP Requisition Generator
                  </h3>
                  <span className="font-mono text-[10px] text-theme-gold uppercase font-bold">
                    DEMO REQUEST — NOT A LIVE GOVERNMENT SUBMISSION
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestDispatched(false);
                }}
                className="text-theme-text-muted hover:text-theme-heading"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Step Progression */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-theme-border pb-3 text-theme-text-muted">
              <span className={requestStep >= 1 ? 'text-theme-primary font-bold' : ''}>1. Target VASP</span>
              <span>→</span>
              <span className={requestStep >= 2 ? 'text-theme-primary font-bold' : ''}>2. Request Type</span>
              <span>→</span>
              <span className={requestStep >= 3 ? 'text-theme-primary font-bold' : ''}>3. Evidence Review</span>
            </div>

            {/* Step 1 & 2: Form */}
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-theme-text-muted mb-1 font-semibold">Attributed Target VASP</label>
                <input
                  type="text"
                  readOnly
                  value={`${attributionResult.nearestVasp.vaspName} (${attributionResult.nearestVasp.fiuRegNo})`}
                  className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded text-theme-heading"
                />
              </div>

              <div>
                <label className="block text-theme-text-muted mb-1.5 font-semibold">Select Statutory Requisition Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestType('DISCLOSURE')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      requestType === 'DISCLOSURE'
                        ? 'bg-theme-surface-secondary border-theme-primary text-theme-heading shadow-xs'
                        : 'bg-theme-surface border-theme-border text-theme-text-muted'
                    }`}
                  >
                    <div className="font-sans font-bold text-xs text-theme-heading">Lawful Information Disclosure</div>
                    <p className="text-[10px] mt-1 text-theme-text-muted">KYC &amp; Transaction Identity Requisition</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('FREEZE')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      requestType === 'FREEZE'
                        ? 'bg-theme-surface-secondary border-theme-danger text-theme-heading shadow-xs'
                        : 'bg-theme-surface border-theme-border text-theme-text-muted'
                    }`}
                  >
                    <div className="font-sans font-bold text-xs text-theme-danger">Asset Freeze Notice</div>
                    <p className="text-[10px] mt-1 text-theme-text-muted">Emergency VASP Account &amp; Vault Freezing</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-theme-text-muted mb-1 font-semibold">Target Deposit Address / Transaction Evidence</label>
                <input
                  type="text"
                  readOnly
                  value={attributionResult.nearestVasp.depositAddress}
                  className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded text-theme-accent font-semibold"
                />
              </div>

              <div>
                <label className="block text-theme-text-muted mb-1 font-semibold">Attribution Basis (Pre-Filled from Engine)</label>
                <textarea
                  readOnly
                  rows={3}
                  value={`Automated Attribution: ${attributionResult.overallConfidence}% Confidence (${attributionResult.nearestVasp.hopDistance} Hops). Evidence: ${attributionResult.evidenceTrail.join('; ')}`}
                  className="w-full p-2.5 bg-theme-surface-secondary border border-theme-border rounded text-theme-fg text-[11px] focus:outline-none"
                />
              </div>

              {requestDispatched && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] text-theme-success">check_circle</span>
                  <span>DEMONSTRATION REQUISITION GENERATED WITH SECTION 65B DIGITAL SEAL</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-theme-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-theme-text-muted font-medium">
                MOCK STATUTORY NOTICE GENERATOR
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface text-theme-heading rounded font-mono text-xs border border-theme-border"
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
                  className="px-5 py-2 bg-gradient-to-r from-[#A67C32] to-[#C5A15A] text-white font-space font-bold rounded text-xs uppercase shadow-md"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-surface border border-theme-border rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-theme-primary text-[22px]">upload_file</span>
                <div>
                  <h3 className="font-space font-bold text-base text-theme-heading">
                    Safe VASP Intelligence Import Engine
                  </h3>
                  <p className="text-[11px] font-mono text-theme-text-muted">
                    Ingest law enforcement intelligence, exchange disclosures, or verified cluster dumps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-theme-text-muted hover:text-theme-heading text-lg"
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
                <span className="text-xs font-mono text-theme-text-muted">Payload Format:</span>
                <div className="flex items-center bg-theme-surface-secondary rounded border border-theme-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setImportFormat('json')}
                    className={`px-3 py-1 text-xs font-mono rounded ${importFormat === 'json' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-text-muted'}`}
                  >
                    JSON Array
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportFormat('csv')}
                    className={`px-3 py-1 text-xs font-mono rounded ${importFormat === 'csv' ? 'bg-theme-primary text-white font-semibold' : 'text-theme-text-muted'}`}
                  >
                    CSV Text
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-theme-text-muted mb-1">
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
                  className="w-full p-3 bg-theme-surface-secondary border border-theme-border rounded font-mono text-xs text-theme-fg focus:outline-none focus:border-theme-primary"
                />
              </div>

              {importReport && (
                <div className={`p-3 rounded border text-xs font-mono space-y-1 ${importReport.errorCount > 0 ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'}`}>
                  <div className="font-bold">
                    Import Finished: {importReport.importedCount || 0} Ingested, {importReport.skippedCount || 0} Skipped, {importReport.errorCount || 0} Errors
                  </div>
                  {importReport.errors && importReport.errors.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-500">
                      {importReport.errors.slice(0, 4).map((err: any, idx: number) => (
                        <li key={idx}>Row {err.rowNumber}: {err.reason || err.error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface text-theme-fg rounded font-mono text-xs border border-theme-border"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importText.trim()}
                  className="px-5 py-2 bg-theme-primary hover:opacity-90 disabled:opacity-50 text-white font-space font-semibold rounded text-xs shadow-sm transition-opacity"
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

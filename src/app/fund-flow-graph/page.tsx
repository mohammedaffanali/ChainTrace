'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import CytoscapeGraph from '@/components/graph/CytoscapeGraph';
import { GraphNode, GraphEdge, TransactionGraph } from '@/lib/graph/types';

const DEMO_NODES: GraphNode[] = [
  {
    id: 'n1',
    label: 'Unknown Suspect Wallet (0x7A91...4F82)',
    type: 'wallet',
    address: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
    chain: 'TRON (TRC20)',
    balanceINR: '₹28,15,40,000',
    riskScore: 98,
    hopDistance: 0,
    isStartingWallet: true,
    x: 120,
    y: 220,
    color: '#DC2626',
  },
  {
    id: 'n2',
    label: 'Primary Hawala Mule Layer',
    type: 'wallet',
    address: '0x71C8a77B280f983aB901FeAc821439d4A44F3aF9',
    chain: 'ETHEREUM',
    balanceINR: '₹12,45,80,000',
    riskScore: 94,
    hopDistance: 1,
    x: 360,
    y: 130,
    color: '#D97706',
  },
  {
    id: 'n3',
    label: 'Stargate / LayerZero Bridge',
    type: 'bridge',
    address: '0x8849bCd0381023d8819eB0eAc821639d4A4455C2',
    chain: 'CROSS-CHAIN',
    balanceINR: '₹8,80,00,000',
    riskScore: 78,
    hopDistance: 1,
    x: 360,
    y: 330,
    color: '#7C3AED',
  },
  {
    id: 'n4',
    label: 'Tornado.Cash Proxy Router',
    type: 'mixer',
    address: '0xd90e2f925DA726b50C4Ed8D0Fb90Ad05332475B4',
    chain: 'ETHEREUM',
    balanceINR: '₹6,40,00,000',
    riskScore: 99,
    hopDistance: 2,
    x: 600,
    y: 110,
    color: '#E11D48',
  },
  {
    id: 'n5',
    label: 'Mule Terminal (Surat Gateway)',
    type: 'wallet',
    address: 'TWz55mP8xK2LsM81023d8819eB0eAc821639d4qRt',
    chain: 'POLYGON (POS)',
    balanceINR: '₹4,20,00,000',
    riskScore: 89,
    hopDistance: 2,
    x: 600,
    y: 260,
    color: '#D97706',
  },
  {
    id: 'n6',
    label: 'CoinDCX Regulated Custody Cluster',
    type: 'vasp',
    address: '0x38b25A89d120FeAc821439d4A44F3aF91928e9A1',
    chain: 'POLYGON',
    balanceINR: '₹12,40,00,000 (FROZEN)',
    riskScore: 14,
    hopDistance: 3,
    x: 820,
    y: 200,
    color: '#059669',
    isNearestVasp: true,
  },
];

const DEMO_EDGES: GraphEdge[] = [
  {
    id: 'e1',
    from: 'n1',
    to: 'n2',
    type: 'TRANSFERRED_TO',
    txHash: '0x5a183ff1098234ea71b293810283719028371920381023810238102839d81',
    timestamp: 1716300000,
    asset: 'USDT',
    amount: '150000',
    amountFormatted: '150,000 USDT',
    amountINR: '₹12.4 Cr (USDT)',
    sourceChain: 'TRON',
    destinationChain: 'ETHEREUM',
    label: 'Layering Hop 1',
    isAttributionPath: false,
  },
  {
    id: 'e2',
    from: 'n1',
    to: 'n3',
    type: 'BRIDGED_TO',
    txHash: '0x88f21bb882910283018239018239018239018239018239018239018233aa',
    timestamp: 1716303600,
    asset: 'USDT',
    amount: '100000',
    amountFormatted: '100,000 USDT',
    amountINR: '₹8.8 Cr (Bridge)',
    sourceChain: 'TRON',
    destinationChain: 'CROSS-CHAIN',
    label: 'ATTRIBUTION PATH',
    isAttributionPath: true,
  },
  {
    id: 'e3',
    from: 'n2',
    to: 'n4',
    type: 'INTERACTED_WITH',
    txHash: '0x77c44dd77210283018239018239018239018239018239018239018230911',
    timestamp: 1716307200,
    asset: 'ETH',
    amount: '250',
    amountFormatted: '250 ETH',
    amountINR: '₹6.4 Cr (Mixer)',
    sourceChain: 'ETHEREUM',
    destinationChain: 'ETHEREUM',
    label: 'Obfuscation',
    isAttributionPath: false,
  },
  {
    id: 'e4',
    from: 'n2',
    to: 'n5',
    type: 'TRANSFERRED_TO',
    txHash: '0x12a99bb8829102830182390182390182390182390182390182390182fe12',
    timestamp: 1716310800,
    asset: 'USDT',
    amount: '50000',
    amountFormatted: '50,000 USDT',
    amountINR: '₹4.2 Cr (P2P)',
    sourceChain: 'ETHEREUM',
    destinationChain: 'POLYGON',
    label: 'Mule Splitting',
    isAttributionPath: false,
  },
  {
    id: 'e5',
    from: 'n3',
    to: 'n5',
    type: 'TRANSFERRED_TO',
    txHash: '0x9918bcc7721028301823901823901823901823901823901823901823cd44',
    timestamp: 1716314400,
    asset: 'USDT',
    amount: '100000',
    amountFormatted: '100,000 USDT',
    amountINR: '₹8.8 Cr (Bridge Inflow)',
    sourceChain: 'CROSS-CHAIN',
    destinationChain: 'POLYGON',
    label: 'ATTRIBUTION PATH',
    isAttributionPath: true,
  },
  {
    id: 'e6',
    from: 'n5',
    to: 'n6',
    type: 'DEPOSITED_TO',
    txHash: '0x22ee1aa7721028301823901823901823901823901823901823901823b57a',
    timestamp: 1716318000,
    asset: 'USDT',
    amount: '150000',
    amountFormatted: '150,000 USDT',
    amountINR: '₹12.4 Cr (Deposit)',
    sourceChain: 'POLYGON',
    destinationChain: 'POLYGON',
    label: 'ATTRIBUTION PATH (96.8%)',
    isAttributionPath: true,
  },
];

export default function FundFlowGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>(DEMO_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(DEMO_EDGES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(DEMO_NODES[5]);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [highlightAttribution, setHighlightAttribution] = useState(true);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');

  // Interactive Investigation Form
  const [searchAddress, setSearchAddress] = useState('0x7A91bC84D2697e88b209eB0eAc821639d4A44F82');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [maxHops, setMaxHops] = useState(3);
  const [direction, setDirection] = useState<'outgoing' | 'incoming' | 'all'>('outgoing');
  const [isLoading, setIsLoading] = useState(false);
  const [graphStats, setGraphStats] = useState<{ totalNodes: number; totalEdges: number; maxHop: number; elapsedMs: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/blockchain/mode')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const handleBuildGraph = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchAddress.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: searchAddress.trim(),
          chain: selectedChain,
          maxHops,
          direction,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Graph traversal query failed');
      }

      const graphData: TransactionGraph = data;
      if (graphData.nodes && graphData.nodes.length > 0) {
        setNodes(graphData.nodes);
        setEdges(graphData.edges || []);

        const nearest = graphData.nodes.find((n) => n.isNearestVasp);
        setSelectedNode(nearest || graphData.nodes[0]);
        setSelectedEdge(null);

        setGraphStats({
          totalNodes: graphData.stats.totalNodes,
          totalEdges: graphData.stats.totalEdges,
          maxHop: graphData.stats.maxHopReached,
          elapsedMs: graphData.stats.elapsedMs,
        });
      } else {
        setErrorMessage('No transactions or connected nodes found for this address.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to query live transaction graph.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = (address: string, chain: string) => {
    setSearchAddress(address);
    setSelectedChain(chain);
    if (address === '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82') {
      setNodes(DEMO_NODES);
      setEdges(DEMO_EDGES);
      setSelectedNode(DEMO_NODES[5]);
      setSelectedEdge(null);
      setGraphStats(null);
      setErrorMessage(null);
    }
  };

  const filteredNodes =
    activeFilter === 'ALL'
      ? nodes
      : nodes.filter((n) => {
          if (activeFilter === 'MIXER') return n.type === 'mixer';
          if (activeFilter === 'BRIDGE') return n.type === 'bridge';
          if (activeFilter === 'REGULATED') return n.type === 'vasp';
          if (activeFilter === 'DEX') return n.type === 'dex';
          if (activeFilter === 'MULE') return n.type === 'wallet' && !n.isStartingWallet;
          return true;
        });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter((e) => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to));

  const handleFilterChange = (layer: string) => {
    setActiveFilter(layer);
    const subset =
      layer === 'ALL'
        ? nodes
        : nodes.filter((n) => {
            if (layer === 'MIXER') return n.type === 'mixer';
            if (layer === 'BRIDGE') return n.type === 'bridge';
            if (layer === 'REGULATED') return n.type === 'vasp';
            if (layer === 'DEX') return n.type === 'dex';
            if (layer === 'MULE') return n.type === 'wallet' && !n.isStartingWallet;
            return true;
          });
    if (subset.length > 0 && (!selectedNode || !subset.some((n) => n.id === selectedNode.id))) {
      setSelectedNode(subset[0]);
    } else if (subset.length === 0) {
      setSelectedNode(null);
    }
    setSelectedEdge(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Top Tactical Command Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-surface p-5 rounded-2xl border border-theme-border shadow-sm relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-theme-primary-dim border border-theme-primary/30 text-theme-primary font-mono text-[10px] font-semibold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse"></span>
                SPATIAL TOPOLOGY STUDIO
              </span>
              <span className="text-theme-border">•</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                  mode === 'live'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {mode === 'live' ? 'LIVE ON-CHAIN RPC' : 'DEMO GRAPH MATRIX'}
              </span>
              <span className="text-theme-border">•</span>
              <span className="font-mono text-[10px] text-theme-text-muted">
                FIU-IND COMPLIANT DAG RESOLUTION
              </span>
            </div>
            
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1.5 flex items-center gap-3">
              <span>Fund Flow Graph &amp; VASP Path Attributor</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-theme-surface-secondary border border-theme-border text-theme-text-muted">
                {nodes.length} Nodes / {edges.length} Edges
              </span>
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-1 max-w-3xl">
              Multi-hop automated graph traversal reconstructing money-laundering hops from unknown suspect wallets to nearest FIU-IND registered VASPs with Section 65B legal evidentiary provenance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap relative z-10">
            <Link
              href="/vasp-attribution"
              className="px-4 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded-xl shadow-md shadow-theme-primary/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>Attribution Engine</span>
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2.5 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-space font-semibold text-xs rounded-xl border border-theme-border transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Section 65B Reports</span>
            </Link>
          </div>
        </div>

        {/* Target Investigation Search Bar & Presets */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme-border shadow-sm space-y-3 transition-colors">
          <form onSubmit={handleBuildGraph} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex-1 flex items-center bg-theme-surface-subtle rounded-xl border border-theme-border px-3.5 py-2.5 focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary/30 transition-all">
              <span className="material-symbols-outlined text-theme-primary text-[20px] mr-2.5">search</span>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Input investigation target address (EVM 0x... / Tron T... / Solana)..."
                className="w-full bg-transparent font-mono text-xs text-theme-heading placeholder:text-theme-text-muted focus:outline-none"
              />
              {searchAddress && (
                <button
                  type="button"
                  onClick={() => setSearchAddress('')}
                  className="text-theme-text-muted hover:text-theme-heading text-xs ml-2"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                aria-label="Target Blockchain"
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-theme-primary"
              >
                <option value="ethereum">Ethereum (ERC-20)</option>
                <option value="polygon">Polygon (POS)</option>
                <option value="tron">Tron (TRC-20)</option>
                <option value="bitcoin">Bitcoin (UTXO)</option>
                <option value="solana">Solana</option>
              </select>

              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                aria-label="Maximum Hop Depth"
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-theme-primary"
              >
                <option value={1}>1 Hop Depth</option>
                <option value={2}>2 Hops Depth</option>
                <option value={3}>3 Hops Depth (Standard)</option>
                <option value={4}>4 Hops Depth (Deep Forensics)</option>
              </select>

              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                aria-label="Flow Direction"
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-theme-primary"
              >
                <option value="outgoing">Outgoing Laundering Flows</option>
                <option value="incoming">Incoming Source Inflows</option>
                <option value="all">Bidirectional Flow</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-space font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-theme-primary/20"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Traversing DAG...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Execute Graph Traversal</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Quick-Load Investigation Targets */}
          <div className="flex items-center gap-2 pt-2 border-t border-theme-border/60 flex-wrap">
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">Target Presets:</span>
            <button
              onClick={() => handleLoadPreset('0x7A91bC84D2697e88b209eB0eAc821639d4A44F82', 'ethereum')}
              className="px-2.5 py-1 rounded-lg bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border text-theme-primary font-mono text-[10px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary"></span>
              <span>Surat Hawala Mule (0x7A91...4F82)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('0xd90e2f925DA726b50C4Ed8D0Fb90Ad05332475B4', 'ethereum')}
              className="px-2.5 py-1 rounded-lg bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border text-amber-600 dark:text-amber-400 font-mono text-[10px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Tornado Mixer Pool (0xd90e...75B4)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('0x38b25A89d120FeAc821439d4A44F3aF91928e9A1', 'polygon')}
              className="px-2.5 py-1 rounded-lg bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>CoinDCX Institutional Vault (0x38b2...e9A1)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {graphStats && (
            <div className="pt-2 border-t border-theme-border/60 flex items-center gap-4 flex-wrap font-mono text-[11px] text-theme-text-muted">
              <span>Discovered Nodes: <strong className="text-theme-heading font-bold">{graphStats.totalNodes}</strong></span>
              <span>•</span>
              <span>Transactions Traced: <strong className="text-theme-heading font-bold">{graphStats.totalEdges}</strong></span>
              <span>•</span>
              <span>Max Graph Depth: <strong className="text-amber-600 dark:text-amber-400 font-bold">{graphStats.maxHop} hops</strong></span>
              <span>•</span>
              <span>RPC Latency: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{graphStats.elapsedMs}ms</strong></span>
            </div>
          )}
        </div>

        {/* Filter Toolbar & Highlighting Controller */}
        <div className="bg-theme-surface p-3.5 rounded-2xl border border-theme-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm transition-colors">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mr-1">Topology Layers:</span>
            {['ALL', 'REGULATED', 'BRIDGE', 'MIXER', 'MULE'].map((layer) => (
              <button
                key={layer}
                onClick={() => handleFilterChange(layer)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold border transition-all ${
                  activeFilter === layer
                    ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                    : 'bg-theme-surface-secondary text-theme-text-muted border-theme-border hover:text-theme-heading hover:bg-theme-surface-tertiary'
                }`}
              >
                {layer === 'REGULATED' ? '🏛️ VASPs (Regulated)' : layer === 'BRIDGE' ? '🌉 Bridges' : layer === 'MIXER' ? '🌪️ Mixers' : layer === 'MULE' ? '👤 Mules' : '⚡ All Nodes'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Attribution Path Toggle */}
            <button
              onClick={() => setHighlightAttribution(!highlightAttribution)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all flex items-center gap-2 ${
                highlightAttribution
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-theme-surface-secondary text-theme-text-muted border-theme-border hover:text-theme-heading'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">route</span>
              <span>ATTRIBUTION PATH {highlightAttribution ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Dual-Pane Spatial Canvas & Evidence Drawer (Option 4 Curated Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Spatial Cytoscape Canvas (8 Columns) */}
          <div className="lg:col-span-8 bg-theme-surface rounded-2xl border border-theme-border p-2 min-h-[600px] lg:min-h-[680px] relative overflow-hidden shadow-sm transition-all">
            <CytoscapeGraph
              nodes={filteredNodes}
              edges={filteredEdges}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              highlightAttribution={highlightAttribution}
              onSelectNode={(node) => {
                setSelectedNode(node);
                setSelectedEdge(null);
              }}
              onSelectEdge={(edge) => {
                setSelectedEdge(edge);
                setSelectedNode(null);
              }}
            />
          </div>

          {/* Forensic Evidence Drawer (4 Columns) */}
          <div className="lg:col-span-4 bg-theme-surface rounded-2xl border border-theme-border p-5 flex flex-col justify-between space-y-5 shadow-sm sticky top-24 transition-colors">
            {selectedEdge ? (
              /* Selected Edge Dossier */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div>
                    <span className="font-mono text-[10px] text-theme-primary uppercase tracking-wider block font-semibold">
                      FORENSIC TRANSACTION EVIDENCE
                    </span>
                    <h3 className="font-space font-bold text-lg text-theme-heading mt-0.5">
                      {selectedEdge.label || 'Transaction Flow'}
                    </h3>
                  </div>
                  {selectedEdge.isAttributionPath && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 font-mono text-[10px] text-amber-700 dark:text-amber-300 font-bold tracking-wider">
                      CRITICAL PATH
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                    <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">INTERACTION CLASSIFICATION</span>
                    <span className="text-theme-primary font-semibold text-sm mt-0.5 block">{selectedEdge.type}</span>
                  </div>

                  <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                    <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">ON-CHAIN TX HASH (IMMUTABLE EVIDENCE)</span>
                    <div className="mt-1.5">
                      <CopyBadge text={selectedEdge.txHash} />
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block uppercase tracking-wider font-semibold">SETTLEMENT VALUE (INR PROJECTION)</span>
                    <span className="text-xl font-space font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {selectedEdge.amountINR || selectedEdge.amountFormatted || `${selectedEdge.amount} ${selectedEdge.asset}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                      <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">ORIGIN CHAIN</span>
                      <span className="text-theme-heading font-semibold mt-0.5 block">{selectedEdge.sourceChain}</span>
                    </div>
                    <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                      <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">EGRESS CHAIN</span>
                      <span className="text-theme-heading font-semibold mt-0.5 block">{selectedEdge.destinationChain}</span>
                    </div>
                  </div>

                  <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                    <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">TIMESTAMP RECORDED (IST)</span>
                    <span className="text-theme-heading mt-0.5 block">
                      {new Date(selectedEdge.timestamp * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedNode ? (
              /* Selected Node Dossier */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div>
                    <span className="font-mono text-[10px] text-theme-primary uppercase tracking-wider block font-semibold">
                      TARGET ENTITY DOSSIER
                    </span>
                    <h3 className="font-space font-bold text-lg text-theme-heading mt-0.5">
                      {selectedNode.label}
                    </h3>
                  </div>
                  {selectedNode.isNearestVasp ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 font-mono text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      <span>ATTRIBUTED VASP</span>
                    </span>
                  ) : selectedNode.isStartingWallet ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 font-mono text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                      SUSPECT ZERO
                    </span>
                  ) : (
                    <span
                      className="w-3 h-3 rounded-full shadow-xs"
                      style={{ backgroundColor: selectedNode.color || '#0284C7' }}
                    ></span>
                  )}
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                    <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">ENTITY CLASSIFICATION</span>
                    <span className="text-theme-heading font-semibold text-sm mt-0.5 block">
                      {selectedNode.isNearestVasp
                        ? 'Nearest Virtual Asset Service Provider (FIU-IND Regulated)'
                        : selectedNode.vaspAssociation
                        ? `VASP Cluster: ${selectedNode.vaspAssociation.vasp.name}`
                        : selectedNode.type.toUpperCase() + ' CLUSTER'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                      <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">PROTOCOL LAYER</span>
                      <span className="text-theme-primary font-semibold mt-0.5 block">{selectedNode.chain}</span>
                    </div>
                    <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                      <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">HOP DISTANCE</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold mt-0.5 block">{selectedNode.hopDistance} Hops from Origin</span>
                    </div>
                  </div>

                  <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                    <span className="text-theme-text-muted text-[10px] block uppercase tracking-wider">TARGET ADDRESS / IDENTITY</span>
                    <div className="mt-1.5">
                      <CopyBadge text={selectedNode.address} />
                    </div>
                  </div>

                  {selectedNode.balanceINR && (
                    <div className="bg-emerald-500/10 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block uppercase tracking-wider font-semibold">IDENTIFIED HOLDING VALUATION</span>
                      <span className="text-xl font-space font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {selectedNode.balanceINR}
                      </span>
                    </div>
                  )}

                  {selectedNode.riskScore !== undefined && (
                    <div className="bg-theme-surface-subtle p-3 rounded-xl border border-theme-border-subtle">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-theme-text-muted text-[10px] uppercase tracking-wider">THREAT RISK SCORE</span>
                        <span className={`font-bold ${selectedNode.riskScore > 75 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{selectedNode.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-theme-surface-secondary h-2 rounded-full overflow-hidden border border-theme-border">
                        <div
                          className={`h-full transition-all duration-500 ${selectedNode.riskScore > 75 ? 'bg-rose-500' : selectedNode.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${selectedNode.riskScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {selectedNode.vaspAssociation && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px]">
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold mb-1">
                        <span className="material-symbols-outlined text-[14px]">account_balance</span>
                        <span>{selectedNode.vaspAssociation.vasp.name}</span>
                      </div>
                      <p className="text-theme-text-muted leading-relaxed">
                        {selectedNode.vaspAssociation.factualSummary}
                      </p>
                    </div>
                  )}

                  {/* Section 65B Admissibility Guarantee */}
                  <div className="p-3 rounded-xl bg-theme-primary-dim/50 border border-theme-primary/30 text-[10px] text-theme-primary flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-theme-primary shrink-0 mt-0.5">verified_user</span>
                    <div>
                      <strong className="text-theme-heading block font-space">Section 65B Legal Admissibility</strong>
                      Cryptographic hash tree verified. Evidence logs meet Bharatiya Sakshya Adhiniyam standards for Indian Law Enforcement.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center font-mono text-xs text-theme-text-muted flex flex-col items-center justify-center min-h-[300px]">
                <span className="material-symbols-outlined text-theme-text-muted/40 text-[40px] mb-2">touch_app</span>
                <span>Select any node or transaction edge on the canvas to inspect real-time forensic evidence.</span>
              </div>
            )}

            {/* Tactical Forensic Action Hub */}
            {selectedNode && (
              <div className="pt-3 border-t border-theme-border space-y-2.5">
                <Link
                  href={`/vasp-attribution?wallet=${encodeURIComponent(selectedNode.address)}`}
                  className="w-full py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-theme-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Investigate in VASP Attribution Engine</span>
                </Link>

                <Link
                  href={`/reports?wallet=${encodeURIComponent(selectedNode.address)}`}
                  className="w-full py-2.5 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading font-space font-semibold text-xs rounded-xl border border-theme-border transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Generate Sec 65B PDF Notice</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

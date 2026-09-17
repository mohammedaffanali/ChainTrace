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
    color: '#EF4444',
  },
  {
    id: 'n2',
    label: 'Primary Hawala Mule Layer',
    type: 'wallet',
    address: '0x71C8a77B280f9...3aF9',
    chain: 'ETHEREUM',
    balanceINR: '₹12,45,80,000',
    riskScore: 94,
    hopDistance: 1,
    x: 360,
    y: 130,
    color: '#F59E0B',
  },
  {
    id: 'n3',
    label: 'Stargate / LayerZero Bridge',
    type: 'bridge',
    address: '0x8849bCd03810...55C2',
    chain: 'CROSS-CHAIN',
    balanceINR: '₹8,80,00,000',
    riskScore: 78,
    hopDistance: 1,
    x: 360,
    y: 330,
    color: '#8B5CF6',
  },
  {
    id: 'n4',
    label: 'Tornado.Cash Proxy Router',
    type: 'mixer',
    address: '0xd90e2f925DA72...75B4',
    chain: 'ETHEREUM',
    balanceINR: '₹6,40,00,000',
    riskScore: 99,
    hopDistance: 2,
    x: 600,
    y: 110,
    color: '#EF4444',
  },
  {
    id: 'n5',
    label: 'Mule Terminal (Surat Gateway)',
    type: 'wallet',
    address: 'TWz55mP8xK2Ls...4qRt',
    chain: 'POLYGON (POS)',
    balanceINR: '₹4,20,00,000',
    riskScore: 89,
    hopDistance: 2,
    x: 600,
    y: 260,
    color: '#F59E0B',
  },
  {
    id: 'n6',
    label: 'CoinDCX Regulated Custody Cluster',
    type: 'vasp',
    address: '0x38b25A89d120...e9A1',
    chain: 'POLYGON',
    balanceINR: '₹12,40,00,000 (FROZEN)',
    riskScore: 14,
    hopDistance: 3,
    x: 820,
    y: 200,
    color: '#10B981',
    isNearestVasp: true,
  },
];

const DEMO_EDGES: GraphEdge[] = [
  {
    id: 'e1',
    from: 'n1',
    to: 'n2',
    type: 'TRANSFERRED_TO',
    txHash: '0x5a183...9d81',
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
    txHash: '0x88f21...33aa',
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
    txHash: '0x77c44...0911',
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
    txHash: '0x12a99...fe12',
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
    txHash: '0x9918b...cd44',
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
    txHash: '0x22ee1...b57a',
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
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 960, height: 460 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(DEMO_NODES[5]);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);
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
        setCanvasDimensions({
          width: Math.max(960, Math.max(...graphData.nodes.map((n) => n.x + 140))),
          height: Math.max(480, Math.max(...graphData.nodes.map((n) => n.y + 120))),
        });

        // Set selected node to nearest VASP if found, else first node
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

  const filteredNodes =
    activeFilter === 'ALL'
      ? nodes
      : nodes.filter((n) => {
          if (activeFilter === 'MIXER') return n.type === 'mixer';
          if (activeFilter === 'BRIDGE') return n.type === 'bridge';
          if (activeFilter === 'REGULATED') return n.type === 'vasp';
          if (activeFilter === 'DEX') return n.type === 'dex';
          return true;
        });

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-theme-primary animate-pulse'}`}></span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${mode === 'live' ? 'text-emerald-400' : 'text-theme-primary'}`}>
                TOPOLOGY STUDIO // {mode === 'live' ? 'LIVE MULTI-HOP GRAPH' : 'MULTI-HOP GRAPH & VASP RESOLUTION'}
              </span>
              <span className="text-theme-border">•</span>
              <span
                className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                  mode === 'live'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                }`}
              >
                {mode === 'live' ? 'LIVE TELEMETRY' : 'DEMO GRAPH'}
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Fund Flow Graph — VASP Path Resolution
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Visualizing fund flow from Unknown Wallet (0x7A91...4F82) through intermediary bridges to Nearest VASP (CoinDCX)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/vasp-attribution"
              className="px-3.5 py-2 bg-theme-primary hover:opacity-90 text-white font-space font-semibold text-xs rounded-md shadow-md shadow-theme-primary/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>Back to Attribution Engine</span>
            </Link>
          </div>
        </div>

        {/* Target Investigation Search Bar */}
        <div className="bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <form onSubmit={handleBuildGraph} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex-1 flex items-center bg-theme-surface-subtle rounded-lg border border-theme-border px-3 py-1.5 focus-within:border-theme-primary">
              <span className="material-symbols-outlined text-theme-text-muted text-[18px] mr-2">search</span>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter investigation address (EVM 0x... / Tron T... / Solana)..."
                className="w-full bg-transparent font-mono text-xs text-theme-heading placeholder:text-theme-text-muted focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-theme-primary"
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="tron">Tron</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="solana">Solana</option>
              </select>

              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-theme-primary"
              >
                <option value={1}>1 Hop</option>
                <option value={2}>2 Hops</option>
                <option value={3}>3 Hops</option>
                <option value={4}>4 Hops (Deep)</option>
              </select>

              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="bg-theme-surface-subtle border border-theme-border text-theme-heading font-mono text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-theme-primary"
              >
                <option value="outgoing">Outgoing Flows</option>
                <option value="incoming">Incoming Flows</option>
                <option value="all">Bidirectional</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-theme-primary hover:opacity-90 disabled:opacity-50 text-white font-space font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-theme-primary/20"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Building Graph...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Traverse Graph</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-3 p-2.5 rounded bg-red-500/10 border border-red-500/30 font-mono text-xs text-red-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {graphStats && (
            <div className="mt-3 pt-2.5 border-t border-theme-border/50 flex items-center gap-4 flex-wrap font-mono text-[11px] text-theme-text-muted">
              <span>Nodes: <strong className="text-theme-heading">{graphStats.totalNodes}</strong></span>
              <span>•</span>
              <span>Edges: <strong className="text-theme-heading">{graphStats.totalEdges}</strong></span>
              <span>•</span>
              <span>Max Depth: <strong className="text-theme-heading">{graphStats.maxHop} hops</strong></span>
              <span>•</span>
              <span>Traversal Time: <strong className="text-theme-heading">{graphStats.elapsedMs}ms</strong></span>
            </div>
          )}
        </div>

        {/* Studio Controls & Filter Bar */}
        <div className="bg-theme-surface p-3 rounded-xl border border-theme-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm transition-colors">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-theme-text-muted mr-1">TOPOLOGY LAYERS:</span>
            {['ALL', 'MIXER', 'BRIDGE', 'REGULATED', 'DEX'].map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveFilter(layer)}
                className={`px-3 py-1 rounded font-mono text-[10px] font-medium border transition-colors ${
                  activeFilter === layer
                    ? 'bg-theme-primary text-white border-theme-primary'
                    : 'bg-theme-surface-subtle text-theme-text-muted border-theme-border hover:text-theme-heading'
                }`}
              >
                {layer}
              </button>
            ))}

            <div className="h-4 w-px bg-theme-border mx-1"></div>

            {/* Attribution Path Toggle */}
            <button
              onClick={() => setHighlightAttribution(!highlightAttribution)}
              className={`px-3 py-1 rounded font-mono text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                highlightAttribution
                  ? 'bg-theme-gold/20 text-theme-gold border-theme-gold'
                  : 'bg-theme-surface-subtle text-theme-text-muted border-theme-border'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">route</span>
              <span>HIGHLIGHT ATTRIBUTION PATH</span>
            </button>
          </div>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
              className="p-1.5 bg-theme-surface-subtle hover:bg-theme-surface text-theme-fg rounded border border-theme-border"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <span className="font-mono text-xs text-theme-text-muted w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.7))}
              className="p-1.5 bg-theme-surface-subtle hover:bg-theme-surface text-theme-fg rounded border border-theme-border"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2.5 py-1 bg-theme-surface-subtle hover:bg-theme-surface text-theme-fg font-mono text-xs rounded border border-theme-border"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visual Graph Viewport & Entity Dossier Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Cytoscape.js Fund Flow Canvas (3 cols) */}
          <div className="xl:col-span-3 bg-theme-surface rounded-xl border border-theme-border p-2 min-h-[560px] relative overflow-hidden shadow-inner transition-colors">
            <CytoscapeGraph
              nodes={filteredNodes}
              edges={edges}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              highlightAttribution={highlightAttribution}
              onSelectNode={(node) => setSelectedNode(node)}
              onSelectEdge={(edge) => setSelectedEdge(edge)}
            />
          </div>

          {/* Side Entity / Transaction Dossier Drawer (1 col) */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 flex flex-col justify-between space-y-4 shadow-xl transition-colors">
            {selectedEdge ? (
              /* Selected Edge Dossier */
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div>
                    <span className="font-mono text-[10px] text-theme-text-muted uppercase block">
                      TRANSACTION EDGE EVIDENCE
                    </span>
                    <h3 className="font-space font-bold text-base text-theme-heading mt-0.5">
                      {selectedEdge.label || 'Transaction Flow'}
                    </h3>
                  </div>
                  {selectedEdge.isAttributionPath && (
                    <span className="px-2 py-0.5 rounded bg-theme-surface-secondary border border-theme-gold font-mono text-[10px] text-theme-gold font-bold">
                      ATTRIBUTION
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">EDGE TYPE</span>
                    <span className="text-theme-heading font-semibold">{selectedEdge.type}</span>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">TRANSACTION HASH</span>
                    <div className="mt-1">
                      <CopyBadge text={selectedEdge.txHash} />
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">VALUE TRANSFERRED</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedEdge.amountINR || selectedEdge.amountFormatted || `${selectedEdge.amount} ${selectedEdge.asset}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-theme-text-muted text-[10px] block">SOURCE CHAIN</span>
                      <span className="text-theme-accent font-semibold">{selectedEdge.sourceChain}</span>
                    </div>
                    <div>
                      <span className="text-theme-text-muted text-[10px] block">DESTINATION</span>
                      <span className="text-theme-accent font-semibold">{selectedEdge.destinationChain}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">TIMESTAMP</span>
                    <span className="text-theme-heading">
                      {new Date(selectedEdge.timestamp * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedNode ? (
              /* Selected Node Dossier */
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div>
                    <span className="font-mono text-[10px] text-theme-text-muted uppercase block">
                      SELECTED NODE DOSSIER
                    </span>
                    <h3 className="font-space font-bold text-base text-theme-heading mt-0.5">
                      {selectedNode.label}
                    </h3>
                  </div>
                  {selectedNode.isNearestVasp ? (
                    <span className="px-2 py-0.5 rounded bg-theme-surface-secondary border border-theme-gold font-mono text-[10px] text-theme-gold font-bold">
                      ATTRIBUTED
                    </span>
                  ) : (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedNode.color }}
                    ></span>
                  )}
                </div>

                <div className="mt-4 space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-theme-text-muted text-[10px] block">NODE CLASSIFICATION</span>
                    <span className="text-theme-heading font-semibold">
                      {selectedNode.isNearestVasp
                        ? 'Nearest Virtual Asset Service Provider (FIU-IND)'
                        : selectedNode.vaspAssociation
                        ? `VASP: ${selectedNode.vaspAssociation.vasp.name}`
                        : selectedNode.type.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">NETWORK PROTOCOL</span>
                    <span className="text-theme-accent font-semibold">{selectedNode.chain}</span>
                  </div>

                  <div>
                    <span className="text-theme-text-muted text-[10px] block">TARGET IDENTIFIER / HASH</span>
                    <div className="mt-1">
                      <CopyBadge text={selectedNode.address} />
                    </div>
                  </div>

                  {selectedNode.balanceINR && (
                    <div>
                      <span className="text-theme-text-muted text-[10px] block">HOLDING VALUATION (INR)</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedNode.balanceINR}
                      </span>
                    </div>
                  )}

                  {selectedNode.riskScore !== undefined && (
                    <div>
                      <span className="text-theme-text-muted text-[10px] block">THREAT SCORE</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-theme-surface-secondary h-2 rounded-full overflow-hidden border border-theme-border">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${selectedNode.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="text-red-500 font-bold">{selectedNode.riskScore}/100</span>
                      </div>
                    </div>
                  )}

                  {selectedNode.vaspAssociation && (
                    <div className="p-2.5 rounded bg-theme-surface-secondary border border-theme-border text-[11px]">
                      <span className="text-theme-gold font-bold block mb-1">
                        {selectedNode.vaspAssociation.vasp.name}
                      </span>
                      <p className="text-theme-text-muted">
                        {selectedNode.vaspAssociation.factualSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center font-mono text-xs text-theme-text-muted">
                Select a node or edge in the graph canvas to inspect intelligence evidence.
              </div>
            )}

            {/* Tactical Actions */}
            {selectedNode && (
              <div className="pt-3 border-t border-theme-border space-y-2">
                <Link
                  href={`/vasp-attribution?wallet=${encodeURIComponent(selectedNode.address)}`}
                  className="w-full py-2 bg-gradient-to-r from-[#155EEF] to-[#087F8C] hover:opacity-95 text-white font-space font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Trace &amp; Attribute in Engine</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


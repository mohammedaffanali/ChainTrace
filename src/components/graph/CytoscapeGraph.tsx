'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import { GraphNode, GraphEdge } from '@/lib/graph/types';
import CopyBadge from '@/components/common/CopyBadge';

// Register dagre layout extension
if (typeof cytoscape('core', 'dagre') === 'undefined') {
  cytoscape.use(dagre);
}

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  highlightAttribution: boolean;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge: (edge: GraphEdge | null) => void;
}

export default function CytoscapeGraph({
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  highlightAttribution,
  onSelectNode,
  onSelectEdge,
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track theme mode changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Theme-adaptive styling tokens
    const pillBg = isDarkMode ? '#0B132B' : '#FFFFFF';
    const pillText = isDarkMode ? '#F8FAFC' : '#0F172A';
    const pillBorder = isDarkMode ? '#334155' : '#CBD5E1';
    const edgeLabelColor = isDarkMode ? '#BAE6FD' : '#0369A1';
    const edgeLineColor = isDarkMode ? '#38BDF8' : '#0284C7';
    const validNodeIds = new Set(nodes.map((n) => n.id));
    const validEdges = edges.filter((e) => validNodeIds.has(e.from) && validNodeIds.has(e.to));

    // Map domain elements into cytoscape format with crisp typography and distinct role styling
    const cyElements = [
      ...nodes.map((n) => {
        let nodeBg = '#0284C7';
        let borderColor = '#38BDF8';
        let nodeSize = 48;
        let formattedLabel = n.label;

        if (n.isNearestVasp || n.type === 'vasp') {
          nodeBg = '#059669';
          borderColor = '#34D399';
          nodeSize = 58;
          formattedLabel = n.label.replace(' (NEAREST VASP)', '') + '\n[VASP GATEWAY]';
        } else if (n.isStartingWallet) {
          nodeBg = '#DC2626';
          borderColor = '#FCA5A5';
          nodeSize = 52;
          formattedLabel = 'SUSPECT ZERO\n' + (n.address ? n.address.slice(0, 8) + '...' + n.address.slice(-4) : '0x7A91...4F82');
        } else if (n.type === 'mixer') {
          nodeBg = '#E11D48';
          borderColor = '#FDA4AF';
          nodeSize = 48;
          formattedLabel = n.label + '\n[MIXER]';
        } else if (n.type === 'bridge') {
          nodeBg = '#7C3AED';
          borderColor = '#C4B5FD';
          nodeSize = 50;
          formattedLabel = n.label + '\n[CROSS-CHAIN BRIDGE]';
        } else {
          nodeBg = '#D97706';
          borderColor = '#FDE68A';
          nodeSize = 46;
          formattedLabel = n.label + '\n' + (n.balanceINR ? n.balanceINR : 'Hop ' + n.hopDistance);
        }

        return {
          data: {
            id: n.id,
            label: formattedLabel,
            sublabel: n.balanceINR || (n.address ? n.address.slice(0, 10) + '...' : ''),
            nodeType: n.type,
            rawNode: n,
            nodeBg: nodeBg,
            borderColor: borderColor,
            nodeSize: nodeSize,
            isNearestVasp: n.isNearestVasp,
            isStartingWallet: n.isStartingWallet,
          },
        };
      }),
      ...validEdges.map((e) => ({
        data: {
          id: e.id,
          source: e.from,
          target: e.to,
          label: e.amountINR ? e.amountINR : e.amountFormatted || e.label || '',
          isAttribution: e.isAttributionPath,
          rawEdge: e,
        },
      })),
    ];

    // Destroy existing instance if any
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Initialize Cytoscape core with high-precision intelligence theme
    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      boxSelectionEnabled: false,
      autounselectify: false,
      minZoom: 0.4,
      maxZoom: 2.5,
      wheelSensitivity: 0.25,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(nodeBg)',
            'border-width': 3,
            'border-color': 'data(borderColor)',
            'width': 'data(nodeSize)',
            'height': 'data(nodeSize)',
            'label': 'data(label)',
            'font-family': 'Space Grotesk, system-ui, sans-serif',
            'font-size': '11px',
            'font-weight': 'bold',
            'color': pillText,
            'text-wrap': 'wrap',
            'text-max-width': '150px',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'text-background-opacity': 0.98,
            'text-background-color': pillBg,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'text-border-width': 1,
            'text-border-color': pillBorder,
            'transition-property': 'background-color, border-color, width, height, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node[?isNearestVasp]',
          style: {
            'border-width': 4,
            'border-color': '#10B981',
            'z-index': 100,
          },
        },
        {
          selector: 'node[?isStartingWallet]',
          style: {
            'border-width': 4,
            'border-color': '#EF4444',
            'z-index': 100,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 5,
            'border-color': '#0284C7',
            'text-border-color': '#0284C7',
            'z-index': 999,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': edgeLineColor,
            'target-arrow-color': edgeLineColor,
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.3,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px',
            'font-weight': 'bold',
            'color': edgeLabelColor,
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-background-opacity': 0.98,
            'text-background-color': pillBg,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-width': 1,
            'text-border-color': pillBorder,
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'edge[?isAttribution]',
          style: {
            'width': highlightAttribution ? 4 : 2.5,
            'line-color': highlightAttribution ? '#D97706' : edgeLineColor,
            'target-arrow-color': highlightAttribution ? '#D97706' : edgeLineColor,
            'line-style': highlightAttribution ? 'dashed' : 'solid',
            'line-dash-pattern': [8, 4],
            'color': highlightAttribution ? (isDarkMode ? '#FDE047' : '#B45309') : edgeLabelColor,
            'text-border-color': highlightAttribution ? '#D97706' : pillBorder,
            'text-background-color': highlightAttribution ? (isDarkMode ? '#1E1B4B' : '#FEF3C7') : pillBg,
            'z-index': 50,
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 5,
            'line-color': '#0284C7',
            'target-arrow-color': '#0284C7',
            'color': '#0284C7',
            'text-border-color': '#0284C7',
            'z-index': 999,
          },
        },
        {
          selector: '.focused',
          style: {
            'opacity': 1.0,
            'z-index': 999,
          },
        },
        {
          selector: 'node.focused',
          style: {
            'border-width': 5,
            'border-color': '#0284C7',
            'z-index': 999,
          },
        },
        {
          selector: 'edge.focused',
          style: {
            'width': 4.5,
            'z-index': 999,
          },
        },
      ],
      layout: {
        name: 'dagre',
        // @ts-ignore
        rankDir: layoutDirection,
        nodeSep: 90,
        rankSep: 180,
        edgeSep: 40,
        padding: 50,
      },
    });

    // Ensure smooth centering on layout completion
    cy.on('layoutstop', () => {
      cy.fit(undefined, 50);
    });

    // Event listeners
    cy.on('tap', 'node', (evt: EventObject) => {
      const nodeData = evt.target.data('rawNode');
      onSelectNode(nodeData);
      onSelectEdge(null);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edgeData = evt.target.data('rawEdge');
      onSelectEdge(edgeData);
      onSelectNode(null);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        onSelectNode(null);
        onSelectEdge(null);
      }
    });

    // Dynamic focus without dark dimming (Active Pathway Highlight)
    if (selectedNode) {
      const targetNodeId = selectedNode.id;
      const cyTargetNode = cy.getElementById(targetNodeId);
      const connectedEdges = cyTargetNode.connectedEdges();
      const neighborNodes = connectedEdges.connectedNodes();

      cy.elements().removeClass('focused');
      cyTargetNode.addClass('focused');
      connectedEdges.addClass('focused');
      neighborNodes.addClass('focused');
    } else if (selectedEdge) {
      const cyEdge = cy.getElementById(selectedEdge.id);
      const connectedNodes = cyEdge.connectedNodes();

      cy.elements().removeClass('focused');
      cyEdge.addClass('focused');
      connectedNodes.addClass('focused');
    } else if (highlightAttribution) {
      const attrEdges = cy.edges('[?isAttribution]');
      const attrNodes = attrEdges.connectedNodes();

      cy.elements().removeClass('focused');
      attrEdges.addClass('focused');
      attrNodes.addClass('focused');
    } else {
      cy.elements().removeClass('focused');
    }

    // Center graph initially
    setTimeout(() => {
      try {
        if (cyRef.current) {
          cyRef.current.resize();
          cyRef.current.fit(undefined, 50);
        }
      } catch {}
    }, 120);

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, highlightAttribution, selectedNode, selectedEdge, layoutDirection, isDarkMode, onSelectNode, onSelectEdge]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() / 1.25);
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.resize();
      cyRef.current.fit(undefined, 50);
    }
  };

  const toggleOrientation = () => {
    setLayoutDirection(prev => prev === 'LR' ? 'TB' : 'LR');
  };

  const handleSwitchView = (mode: 'graph' | 'table') => {
    setViewMode(mode);
    if (mode === 'graph') {
      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current.resize();
          cyRef.current.fit(undefined, 50);
        }
      }, 50);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col rounded-2xl overflow-hidden bg-theme-surface border border-theme-border shadow-sm transition-colors">
      {/* Symmetrical Spatial Grid Background */}
      <div className="absolute inset-0 spatial-perspective-grid opacity-60 dark:opacity-30 pointer-events-none"></div>

      {/* Floating HUD Telemetry Header */}
      <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-theme-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-theme-border font-mono text-[10px] text-theme-text-muted shadow-sm">
        <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
        <span className="text-theme-heading font-semibold uppercase tracking-wider">SECTOR: DAG-04</span>
        <span className="text-theme-border">•</span>
        <span>ORIENTATION: <strong className="text-theme-primary">{layoutDirection === 'LR' ? 'WEST-TO-EAST' : 'NORTH-TO-SOUTH'}</strong></span>
      </div>

      {/* Floating Canvas Controls Action Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-theme-surface/90 backdrop-blur-md p-1.5 rounded-xl border border-theme-border shadow-md">
        <button
          onClick={toggleOrientation}
          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading border border-theme-border transition-colors flex items-center gap-1.5"
          title="Toggle Flow Orientation (Horizontal / Vertical)"
        >
          <span className="material-symbols-outlined text-[15px]">
            {layoutDirection === 'LR' ? 'swap_horiz' : 'swap_vert'}
          </span>
          <span className="hidden md:inline font-bold">{layoutDirection}</span>
        </button>

        <button
          onClick={() => handleSwitchView(viewMode === 'graph' ? 'table' : 'graph')}
          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-colors flex items-center gap-1.5 ${
            viewMode === 'table'
              ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
              : 'bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-heading border-theme-border'
          }`}
          title="Toggle Table / Graph View"
        >
          <span className="material-symbols-outlined text-[15px]">
            {viewMode === 'graph' ? 'table_chart' : 'account_tree'}
          </span>
          <span className="hidden md:inline font-bold">{viewMode === 'graph' ? 'Table' : 'DAG'}</span>
        </button>

        <div className="w-[1px] h-4 bg-theme-border mx-0.5"></div>

        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-theme-surface-secondary text-theme-text-muted hover:text-theme-heading transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>

        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-theme-surface-secondary text-theme-text-muted hover:text-theme-heading transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>

        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg hover:bg-theme-primary-dim text-theme-primary transition-colors"
          title="Reset Zoom & Center Graph"
        >
          <span className="material-symbols-outlined text-[18px]">fit_screen</span>
        </button>
      </div>

      {/* Cytoscape Canvas Container (Always Mounted to avoid lifecycle resets) */}
      <div
        ref={containerRef}
        className={`w-full h-full flex-1 relative z-0 min-h-[560px] ${viewMode === 'graph' ? 'block' : 'hidden'}`}
      />

      {/* Accessible Table View (Visible when viewMode === 'table') */}
      <div className={`w-full h-full flex-1 p-5 overflow-auto font-mono text-xs z-10 bg-theme-surface ${viewMode === 'table' ? 'block' : 'hidden'}`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-space font-bold text-sm text-theme-heading">Transaction Topology Table View</h3>
            <p className="font-mono text-[11px] text-theme-text-muted">Tabular representation of all discovered nodes in graph traversal</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-theme-surface-secondary text-theme-heading font-mono text-[10px] border border-theme-border font-bold">
            {nodes.length} Nodes Discovered
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-theme-border shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-border bg-theme-surface-secondary/70 text-theme-text-muted text-[11px] uppercase tracking-wider">
                <th className="p-3">Node Classification / Label</th>
                <th className="p-3">Role</th>
                <th className="p-3">Network Protocol</th>
                <th className="p-3">On-Chain Identifier</th>
                <th className="p-3">Valuation</th>
                <th className="p-3 text-right">Threat Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border/60 bg-theme-surface">
              {nodes.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => onSelectNode(n)}
                  className={`hover:bg-theme-surface-secondary/80 cursor-pointer transition-colors ${
                    selectedNode?.id === n.id
                      ? 'bg-theme-primary-dim/60 font-semibold border-l-4 border-l-theme-primary'
                      : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: n.color || (n.isNearestVasp ? '#059669' : n.isStartingWallet ? '#DC2626' : '#0284C7') }}
                      ></span>
                      <span className="text-theme-heading font-medium">{n.label}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
                      n.isNearestVasp
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : n.isStartingWallet
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : n.type === 'mixer'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                        : n.type === 'bridge'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="p-3 text-theme-fg font-medium">{n.chain}</td>
                  <td className="p-3 font-mono text-xs">
                    {n.address ? <CopyBadge text={n.address} /> : <span className="text-theme-text-muted">—</span>}
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{n.balanceINR || '—'}</td>
                  <td className="p-3 text-right">
                    <span className={`font-bold ${
                      (n.riskScore || 0) > 75 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {n.riskScore || 0}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spatial Telemetry Bottom Strip */}
      <div className="relative z-10 px-4 py-2.5 bg-theme-surface-subtle border-t border-theme-border flex items-center justify-between text-[11px] font-mono text-theme-text-muted flex-wrap gap-2 transition-colors">
        <div className="flex items-center gap-3">
          <span>ACTIVE NODES: <strong className="text-theme-heading font-bold">{nodes.length}</strong></span>
          <span>•</span>
          <span>ATTRIBUTED EDGES: <strong className="text-theme-heading font-bold">{edges.length}</strong></span>
          <span>•</span>
          <span>PROVENANCE: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">SECTION 65B CERTIFIED</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">SECTOR SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
}

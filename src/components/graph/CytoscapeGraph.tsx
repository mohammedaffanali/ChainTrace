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

    // Theme-adaptive styling tokens adhering to Void Eclipse / Warm Cream palette
    const pillBg = isDarkMode ? '#1C1D20' : '#F4F0E6';
    const pillText = isDarkMode ? '#F4F0E6' : '#15171B';
    const pillBorder = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(21, 23, 27, 0.15)';
    const edgeLabelColor = isDarkMode ? '#7CB9E8' : '#1560BD';
    const edgeLineColor = isDarkMode ? '#436B95' : '#1560BD';
    const validNodeIds = new Set(nodes.map((n) => n.id));
    const validEdges = edges.filter((e) => validNodeIds.has(e.from) && validNodeIds.has(e.to));

    // Map domain elements into cytoscape format with crisp typography and distinct role styling
    const cyElements = [
      ...nodes.map((n) => {
        let nodeBg = '#436B95'; // Queen Blue default
        let borderColor = '#7CB9E8'; // Aero accent
        let nodeSize = 48;
        let formattedLabel = n.label;

        if (n.isNearestVasp || n.type === 'vasp') {
          nodeBg = '#1B512D'; // Forest Green
          borderColor = '#ADC178'; // Olivine
          nodeSize = 58;
          formattedLabel = n.label.replace(' (NEAREST VASP)', '') + '\n[VASP GATEWAY]';
        } else if (n.isStartingWallet) {
          nodeBg = '#960018'; // Carmin Red
          borderColor = '#B22222'; // Crimson Red
          nodeSize = 54;
          formattedLabel = 'SUSPECT ZERO\n' + (n.address ? n.address.slice(0, 8) + '...' + n.address.slice(-4) : 'TARGET');
        } else if (n.type === 'mixer') {
          nodeBg = '#C44536'; // Persian Red
          borderColor = '#960018';
          nodeSize = 48;
          formattedLabel = n.label + '\n[MIXER PROTOCOL]';
        } else if (n.type === 'bridge') {
          nodeBg = '#5D3A9C'; // Imperial Purple
          borderColor = '#B23AEE'; // Royal Amethyst
          nodeSize = 50;
          formattedLabel = n.label + '\n[CROSS-CHAIN BRIDGE]';
        } else {
          nodeBg = '#2A7F7F'; // Mineral Cyan
          borderColor = '#7CB9E8';
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
            'border-color': '#ADC178',
            'z-index': 100,
          },
        },
        {
          selector: 'node[?isStartingWallet]',
          style: {
            'border-width': 4,
            'border-color': '#B22222',
            'z-index': 100,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 5,
            'border-color': '#7CB9E8',
            'text-border-color': '#7CB9E8',
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
            'line-color': highlightAttribution ? '#ADC178' : edgeLineColor,
            'target-arrow-color': highlightAttribution ? '#ADC178' : edgeLineColor,
            'line-style': highlightAttribution ? 'dashed' : 'solid',
            'line-dash-pattern': [8, 4],
            'color': highlightAttribution ? (isDarkMode ? '#C2F8CB' : '#1B512D') : edgeLabelColor,
            'text-border-color': highlightAttribution ? '#ADC178' : pillBorder,
            'text-background-color': highlightAttribution ? (isDarkMode ? '#1C1D20' : '#FAFAF5') : pillBg,
            'z-index': 50,
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 5,
            'line-color': '#7CB9E8',
            'target-arrow-color': '#7CB9E8',
            'color': '#7CB9E8',
            'text-border-color': '#7CB9E8',
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
            'border-color': '#7CB9E8',
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
    <div className="relative w-full h-full min-h-[580px] flex flex-col rounded-2xl overflow-hidden glass-card border border-white/[0.08] shadow-glass-card transition-colors bg-[#1C1D20]/90 backdrop-blur-xl">
      {/* Symmetrical Spatial Grid Background */}
      <div className="absolute inset-0 spatial-perspective-grid opacity-30 pointer-events-none"></div>

      {/* Floating HUD Telemetry Header */}
      <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-[#15171B]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] font-mono text-[10px] text-[#9D9A92] shadow-glass-sm">
        <span className="w-2 h-2 rounded-full bg-[#7CB9E8] animate-pulse"></span>
        <span className="text-[#F4F0E6] font-semibold uppercase tracking-wider">SECTOR: DAG-04</span>
        <span className="text-white/20">•</span>
        <span>ORIENTATION: <strong className="text-[#7CB9E8]">{layoutDirection === 'LR' ? 'WEST-TO-EAST' : 'NORTH-TO-SOUTH'}</strong></span>
      </div>

      {/* Floating Canvas Controls Action Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#15171B]/85 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] shadow-glass-card">
        <button
          onClick={toggleOrientation}
          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0E6] border border-white/[0.08] transition-colors flex items-center gap-1.5"
          title="Toggle Flow Orientation (Horizontal / Vertical)"
        >
          <span className="material-symbols-outlined text-[15px] text-[#7CB9E8]">
            {layoutDirection === 'LR' ? 'swap_horiz' : 'swap_vert'}
          </span>
          <span className="hidden md:inline font-bold">{layoutDirection}</span>
        </button>

        <button
          onClick={() => handleSwitchView(viewMode === 'graph' ? 'table' : 'graph')}
          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-colors flex items-center gap-1.5 ${
            viewMode === 'table'
              ? 'bg-[#1560BD] text-[#F4F0E6] border-[#7CB9E8]/40 shadow-signal-denim'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0E6] border-white/[0.08]'
          }`}
          title="Toggle Table / Graph View"
        >
          <span className="material-symbols-outlined text-[15px] text-[#7CB9E8]">
            {viewMode === 'graph' ? 'table_chart' : 'account_tree'}
          </span>
          <span className="hidden md:inline font-bold">{viewMode === 'graph' ? 'Table' : 'DAG'}</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>

        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[#9D9A92] hover:text-[#F4F0E6] transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>

        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[#9D9A92] hover:text-[#F4F0E6] transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>

        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg hover:bg-[#1560BD]/20 text-[#7CB9E8] transition-colors"
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
      <div className={`w-full h-full flex-1 p-5 overflow-auto font-mono text-xs z-10 bg-[#1C1D20] ${viewMode === 'table' ? 'block' : 'hidden'}`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-base text-[#F4F0E6] font-semibold">Transaction Topology Table View</h3>
            <p className="font-mono text-[11px] text-[#9D9A92]">Tabular representation of all discovered nodes in graph traversal</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#F4F0E6] font-mono text-[10px] border border-white/[0.08] font-bold">
            {nodes.length} Nodes Discovered
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/[0.08] shadow-glass-sm bg-[#15171B]/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#9D9A92] text-[10px] uppercase tracking-wider font-mono">
                <th className="p-3">Node Classification / Label</th>
                <th className="p-3">Role</th>
                <th className="p-3">Network Protocol</th>
                <th className="p-3">On-Chain Identifier</th>
                <th className="p-3">Valuation</th>
                <th className="p-3 text-right">Threat Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {nodes.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => onSelectNode(n)}
                  className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${
                    selectedNode?.id === n.id
                      ? 'bg-white/[0.06] font-semibold border-l-2 border-l-[#7CB9E8]'
                      : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: n.color || (n.isNearestVasp ? '#1B512D' : n.isStartingWallet ? '#960018' : '#436B95') }}
                      ></span>
                      <span className="text-[#F4F0E6] font-medium">{n.label}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
                      n.isNearestVasp
                        ? 'bg-[#1B512D]/30 text-[#ADC178] border-[#ADC178]/30'
                        : n.isStartingWallet
                        ? 'bg-[#960018]/30 text-[#F0EAD6] border-[#B22222]/40'
                        : n.type === 'mixer'
                        ? 'bg-[#C44536]/30 text-[#F0EAD6] border-[#C44536]/40'
                        : n.type === 'bridge'
                        ? 'bg-[#5D3A9C]/30 text-[#B23AEE] border-[#5D3A9C]/40'
                        : 'bg-[#436B95]/30 text-[#7CB9E8] border-[#436B95]/40'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="p-3 text-[#D8D3C7] font-medium">{n.chain}</td>
                  <td className="p-3 font-mono text-xs">
                    {n.address ? <CopyBadge text={n.address} /> : <span className="text-[#9D9A92]">—</span>}
                  </td>
                  <td className="p-3 font-bold text-[#ADC178]">{n.balanceINR || '—'}</td>
                  <td className="p-3 text-right">
                    <span className={`font-bold font-mono ${
                      (n.riskScore || 0) > 75 ? 'text-[#B22222]' : 'text-[#ADC178]'
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
      <div className="relative z-10 px-4 py-2.5 bg-[#15171B]/90 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#9D9A92] flex-wrap gap-2 transition-colors">
        <div className="flex items-center gap-3">
          <span>ACTIVE NODES: <strong className="text-[#F4F0E6] font-bold">{nodes.length}</strong></span>
          <span className="text-white/20">•</span>
          <span>ATTRIBUTED EDGES: <strong className="text-[#F4F0E6] font-bold">{edges.length}</strong></span>
          <span className="text-white/20">•</span>
          <span>PROVENANCE: <strong className="text-[#ADC178] font-bold">SECTION 65B CERTIFIED</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B512D] border border-[#ADC178] animate-pulse"></span>
          <span className="text-[#ADC178] font-semibold">SECTOR SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
}

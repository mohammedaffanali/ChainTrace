'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import { GraphNode, GraphEdge } from '@/lib/graph/types';

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

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || viewMode !== 'graph') return;

    // Map domain elements into cytoscape format
    const cyElements = [
      ...nodes.map((n) => {
        let nodeColor = '#3B82F6';
        let borderColor = '#1D4ED8';
        if (n.isNearestVasp || n.type === 'vasp') {
          nodeColor = '#C8A96B';
          borderColor = '#A67C32';
        } else if (n.isStartingWallet) {
          nodeColor = '#EF4444';
          borderColor = '#B91C1C';
        } else if (n.type === 'mixer') {
          nodeColor = '#DC2626';
          borderColor = '#991B1B';
        } else if (n.type === 'bridge') {
          nodeColor = '#8B5CF6';
          borderColor = '#6D28D9';
        }

        return {
          data: {
            id: n.id,
            label: n.isNearestVasp ? `${n.label} (NEAREST VASP)` : n.label,
            sublabel: n.balanceINR || n.address.slice(0, 10) + '...',
            nodeType: n.type,
            rawNode: n,
            color: nodeColor,
            borderColor: borderColor,
            isNearestVasp: n.isNearestVasp,
          },
        };
      }),
      ...edges.map((e) => ({
        data: {
          id: e.id,
          source: e.from,
          target: e.to,
          label: e.amountINR || e.amountFormatted || e.label || '',
          isAttribution: e.isAttributionPath,
          rawEdge: e,
        },
      })),
    ];

    // Destroy existing instance if any
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Initialize Cytoscape core
    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'border-width': 2,
            'border-color': 'data(borderColor)',
            'width': 48,
            'height': 48,
            'label': 'data(label)',
            'font-family': 'Space Grotesk, sans-serif',
            'font-size': '10px',
            'font-weight': 'bold',
            'color': '#F1F5F9',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-width': 2,
            'text-outline-color': '#0B0F19',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node[?isNearestVasp]',
          style: {
            'width': 58,
            'height': 58,
            'border-width': 3,
            'border-color': '#F59E0B',
            'font-size': '11px',
            'color': '#F59E0B',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#38BDF8',
            'background-color': '#0284C7',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': 'monospace',
            'font-size': '9px',
            'color': '#94A3B8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-background-opacity': 0.8,
            'text-background-color': '#0F172A',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
          },
        },
        {
          selector: 'edge[?isAttribution]',
          style: {
            'width': highlightAttribution ? 3.5 : 2,
            'line-color': highlightAttribution ? '#C8A96B' : '#334155',
            'target-arrow-color': highlightAttribution ? '#C8A96B' : '#334155',
            'line-style': highlightAttribution ? 'dashed' : 'solid',
            'color': highlightAttribution ? '#F59E0B' : '#94A3B8',
            'font-weight': highlightAttribution ? 'bold' : 'normal',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4,
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            'color': '#38BDF8',
          },
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2,
          },
        },
        {
          selector: '.focused',
          style: {
            'opacity': 1.0,
            'z-index': 999,
          },
        },
      ],
      layout: {
        name: 'dagre',
        // @ts-ignore
        rankDir: 'LR',
        nodeSep: 60,
        rankSep: 100,
        padding: 40,
      },
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

    // Dynamic focus & dimming (Trace Reveal / Pathway Focus)
    if (selectedNode) {
      const targetNodeId = selectedNode.id;
      const cyTargetNode = cy.getElementById(targetNodeId);
      const connectedEdges = cyTargetNode.connectedEdges();
      const neighborNodes = connectedEdges.connectedNodes();

      cy.elements().addClass('dimmed').removeClass('focused');
      cyTargetNode.removeClass('dimmed').addClass('focused');
      connectedEdges.removeClass('dimmed').addClass('focused');
      neighborNodes.removeClass('dimmed');
    } else if (selectedEdge) {
      const cyEdge = cy.getElementById(selectedEdge.id);
      const connectedNodes = cyEdge.connectedNodes();

      cy.elements().addClass('dimmed').removeClass('focused');
      cyEdge.removeClass('dimmed').addClass('focused');
      connectedNodes.removeClass('dimmed').addClass('focused');
    } else if (highlightAttribution) {
      const attrEdges = cy.edges('[?isAttribution]');
      const attrNodes = attrEdges.connectedNodes();

      cy.elements().removeClass('focused');
      cy.elements().addClass('dimmed');
      attrEdges.removeClass('dimmed').addClass('focused');
      attrNodes.removeClass('dimmed').addClass('focused');
    } else {
      cy.elements().removeClass('dimmed').removeClass('focused');
    }

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, highlightAttribution, selectedNode, selectedEdge, viewMode, onSelectNode, onSelectEdge]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() / 1.2);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 30);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Floating Canvas Action Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
          className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center gap-1"
          title="Toggle Mobile Table View"
        >
          <span className="material-symbols-outlined text-[15px]">
            {viewMode === 'graph' ? 'table_chart' : 'account_tree'}
          </span>
          <span>{viewMode === 'graph' ? 'Table View' : 'Graph View'}</span>
        </button>

        {viewMode === 'graph' && (
          <>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button
              onClick={handleFit}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Fit to Screen"
            >
              <span className="material-symbols-outlined text-[18px]">fit_screen</span>
            </button>
          </>
        )}
      </div>

      {viewMode === 'graph' ? (
        <div ref={containerRef} className="w-full h-[540px] rounded-xl bg-[#090D16] cursor-grab active:cursor-grabbing" />
      ) : (
        /* Mobile / Tabular Fallback View */
        <div className="w-full min-h-[540px] rounded-xl bg-theme-surface p-4 overflow-x-auto font-mono text-xs">
          <h3 className="font-space font-bold text-sm text-theme-heading mb-3">
            Multi-Hop Transaction Topology Ledger (Responsive View)
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-muted text-[10px] uppercase">
                <th className="py-2 px-3">Hop</th>
                <th className="py-2 px-3">Source Node</th>
                <th className="py-2 px-3">Destination Node</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Attribution Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {edges.map((e, idx) => (
                <tr
                  key={e.id}
                  onClick={() => onSelectEdge(e)}
                  className={`cursor-pointer hover:bg-theme-surface-secondary transition-colors ${
                    selectedEdge?.id === e.id ? 'bg-theme-primary/10' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-theme-primary font-bold">Hop {idx + 1}</td>
                  <td className="py-2 px-3 text-theme-fg">{e.from}</td>
                  <td className="py-2 px-3 text-theme-fg">{e.to}</td>
                  <td className="py-2 px-3 text-emerald-500 font-bold">{e.amountINR || e.amountFormatted}</td>
                  <td className="py-2 px-3 text-theme-text-muted">{e.type}</td>
                  <td className="py-2 px-3">
                    {e.isAttributionPath ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                        ATTRIBUTION
                      </span>
                    ) : (
                      <span className="text-theme-text-muted text-[10px]">Transit</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

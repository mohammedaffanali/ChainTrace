/**
 * CHAINTRACE // Graph Deterministic Layout Computer
 * Calculates clean layered DAG coordinates (x, y) for SVG canvas rendering.
 */

import { GraphNode, GraphEdge } from './types';

export interface LayoutOptions {
  width?: number;
  height?: number;
  startX?: number;
  layerSpacing?: number;
}

export function computeGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options?: LayoutOptions
): { nodes: GraphNode[]; width: number; height: number } {
  if (nodes.length === 0) {
    return { nodes: [], width: 960, height: 480 };
  }

  const startX = options?.startX ?? 120;
  const layerSpacing = options?.layerSpacing ?? 240;

  // Group nodes by hop distance
  const layers = new Map<number, GraphNode[]>();
  let maxHop = 0;

  for (const node of nodes) {
    const hop = node.hopDistance ?? 0;
    maxHop = Math.max(maxHop, hop);
    if (!layers.has(hop)) {
      layers.set(hop, []);
    }
    layers.get(hop)!.push(node);
  }

  // Find max nodes in any single layer to calculate canvas height
  let maxNodesInLayer = 1;
  for (const list of layers.values()) {
    maxNodesInLayer = Math.max(maxNodesInLayer, list.length);
  }

  const calculatedHeight = Math.max(480, maxNodesInLayer * 130);
  const calculatedWidth = Math.max(960, startX + (maxHop + 1) * layerSpacing + 80);

  // Position nodes layer by layer
  for (const [hop, layerNodes] of layers.entries()) {
    const x = startX + hop * layerSpacing;
    const count = layerNodes.length;

    layerNodes.forEach((node, index) => {
      const y = ((index + 1) / (count + 1)) * calculatedHeight;
      node.x = Math.round(x);
      node.y = Math.round(y);

      // Assign node theme color
      if (node.isNearestVasp) {
        node.color = '#C8A96B'; // Gold for nearest VASP
      } else if (node.type === 'vasp') {
        node.color = '#10B981'; // Emerald
      } else if (node.isStartingWallet) {
        node.color = '#EF4444'; // Red
      } else if (node.type === 'mixer') {
        node.color = '#EF4444'; // Red
      } else if (node.type === 'bridge') {
        node.color = '#8B5CF6'; // Purple
      } else if (node.type === 'dex') {
        node.color = '#06B6D4'; // Cyan
      } else if (node.type === 'contract') {
        node.color = '#64748B'; // Slate
      } else if (node.type === 'cluster') {
        node.color = '#F59E0B'; // Amber
      } else {
        node.color = '#3B82F6'; // Blue
      }
    });
  }

  return {
    nodes,
    width: calculatedWidth,
    height: calculatedHeight,
  };
}

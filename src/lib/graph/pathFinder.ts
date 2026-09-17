/**
 * CHAINTRACE // Nearest VASP Path Discovery Engine
 * Finds multi-hop directed paths between investigated wallets and known VASP infrastructure.
 */

import {
  GraphNode,
  GraphEdge,
  VaspPath,
  PathHopItem,
  PathRelationshipType,
  GraphTraversalOptions,
} from './types';
import { GraphBuilder } from './graphBuilder';

/**
 * Discovers paths from root address/node to any VASP nodes in the graph using BFS.
 */
export function findVaspPaths(
  firstArg: string | GraphNode[],
  secondArg: GraphNode[] | GraphEdge[],
  thirdArg?: GraphEdge[] | string,
  fourthArg?: string
): VaspPath[] {
  let rootNodeId: string;
  let nodes: GraphNode[];
  let edges: GraphEdge[];

  if (Array.isArray(firstArg)) {
    // Called as: findVaspPaths(nodes, edges, startingAddress?, chain?)
    nodes = firstArg;
    edges = (secondArg as GraphEdge[]) || [];
    const targetAddr = typeof thirdArg === 'string' ? thirdArg.toLowerCase() : undefined;

    // Find starting node ID
    let rootNode: GraphNode | undefined;
    if (targetAddr) {
      rootNode = nodes.find(
        (n) => n.address.toLowerCase() === targetAddr || n.id.toLowerCase().includes(targetAddr)
      );
    }
    if (!rootNode) {
      rootNode = nodes.find((n) => n.isStartingWallet || n.hopDistance === 0) || nodes[0];
    }
    rootNodeId = rootNode ? rootNode.id : '';
  } else {
    // Called as: findVaspPaths(rootNodeId, nodes, edges)
    rootNodeId = firstArg;
    nodes = (secondArg as GraphNode[]) || [];
    edges = (thirdArg as GraphEdge[]) || [];
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
    // Also allow address lookup
    nodeMap.set(n.address.toLowerCase(), n);
  }

  // Adjacency list: fromNodeId -> Array<{ toNodeId: string; edge: GraphEdge }>
  const adj = new Map<string, Array<{ to: string; edge: GraphEdge }>>();
  for (const e of edges) {
    if (!adj.has(e.from)) {
      adj.set(e.from, []);
    }
    adj.get(e.from)!.push({ to: e.to, edge: e });
  }

  let rootNode = nodeMap.get(rootNodeId);
  if (!rootNode) {
    // Fallback: match by starting wallet or first node
    rootNode = nodes.find((n) => n.isStartingWallet || n.hopDistance === 0) || nodes[0];
    if (rootNode) rootNodeId = rootNode.id;
  }
  if (!rootNode) return [];

  // BFS Queue to find all paths to VASP targets
  interface BFSQueueItem {
    currentId: string;
    pathNodeIds: string[];
    edgesUsed: GraphEdge[];
  }

  const queue: BFSQueueItem[] = [
    {
      currentId: rootNodeId,
      pathNodeIds: [rootNodeId],
      edgesUsed: [],
    },
  ];

  const visitedInPath = new Set<string>();
  const discoveredPaths: VaspPath[] = [];

  while (queue.length > 0) {
    const { currentId, pathNodeIds, edgesUsed } = queue.shift()!;
    const currentNode = nodeMap.get(currentId);

    if (!currentNode) continue;

    // Check if current node is a VASP (and not the root node itself)
    if (pathNodeIds.length > 1 && (currentNode.type === 'vasp' || currentNode.vaspAssociation)) {
      const hops = pathNodeIds.length - 1;
      const vaspInfo = currentNode.vaspAssociation?.vasp;

      // Assign non-speculative relationship label
      let relationshipType: PathRelationshipType = 'INDIRECT_TRANSIT';
      if (hops === 1) {
        relationshipType = currentNode.cluster ? 'KNOWN_CLUSTER' : 'DIRECT_DEPOSIT';
      } else if (hops > 1) {
        relationshipType = 'INDIRECT_TRANSIT';
      } else {
        relationshipType = 'INSUFFICIENT_EVIDENCE';
      }

      // Construct hop path items
      const pathItems: PathHopItem[] = pathNodeIds.map((id, idx) => {
        const node = nodeMap.get(id)!;
        let itemType: any = node.type;
        if (idx === pathNodeIds.length - 1 && node.vaspAssociation) {
          const addrType = node.vaspAssociation.addressEntity?.addressType;
          if (addrType === 'deposit') itemType = 'vasp_deposit';
          else if (addrType === 'hot_wallet') itemType = 'vasp_hot_wallet';
          else if (addrType === 'cold_wallet') itemType = 'vasp_cold_wallet';
          else itemType = 'vasp_deposit';
        }
        return {
          address: node.address,
          chain: node.chain,
          type: itemType,
          label: node.label,
        };
      });

      // Construct transaction items
      const txItems = edgesUsed.map((e) => ({
        txHash: e.txHash,
        from: nodeMap.get(e.from)?.address || e.from,
        to: nodeMap.get(e.to)?.address || e.to,
        amount: e.amountFormatted || e.amount,
        asset: e.asset,
        timestamp: e.timestamp,
        fee: e.fee,
        chain: e.sourceChain,
      }));

      const timestamps = txItems.map((t) => t.timestamp).sort((a, b) => a - b);
      const firstHopTime = timestamps[0] || 0;
      const lastHopTime = timestamps[timestamps.length - 1] || 0;

      // Construct chronological evidence trail
      const evidence = edgesUsed.map((e, idx) => {
        const fromAddr = nodeMap.get(e.from)?.address || e.from;
        const toAddr = nodeMap.get(e.to)?.address || e.to;
        return `Hop ${idx + 1}: ${fromAddr.slice(0, 8)}... transferred ${e.amountFormatted} to ${toAddr.slice(0, 8)}... via tx ${e.txHash.slice(0, 14)}...`;
      });

      discoveredPaths.push({
        hops,
        path: pathItems,
        transactions: txItems,
        timestamps: {
          firstHopTime,
          lastHopTime,
          totalSpanSeconds: Math.max(0, lastHopTime - firstHopTime),
        },
        evidence,
        relationshipType,
        targetVasp: {
          id: vaspInfo?.id || 'vasp-target',
          name: vaspInfo?.name || currentNode.label,
          legalName: vaspInfo?.legalName || vaspInfo?.name || currentNode.label,
          fiuStatus: vaspInfo?.registrationStatus || 'REGISTERED',
          regulatoryIdentifier: vaspInfo?.regulatoryIdentifier || 'FIU-IND VERIFIED',
          depositAddress: currentNode.address,
          confidence: currentNode.vaspAssociation?.confidence || 95,
        },
      });

      // Once a path to this VASP is found, do not traverse further from it
      continue;
    }

    // Limit maximum hop exploration for paths
    if (pathNodeIds.length >= 6) {
      continue;
    }

    // Explore neighbors
    const neighbors = adj.get(currentId) || [];
    for (const { to, edge } of neighbors) {
      if (!pathNodeIds.includes(to)) {
        queue.push({
          currentId: to,
          pathNodeIds: [...pathNodeIds, to],
          edgesUsed: [...edgesUsed, edge],
        });
      }
    }
  }

  // Sort discovered paths by shortest hop distance first
  return discoveredPaths.sort((a, b) => a.hops - b.hops);
}

/**
 * Finds nearest VASP from discovered paths, OR from address/chain lookup.
 */
export function findNearestVasp(paths: VaspPath[]): VaspPath | null;
export function findNearestVasp(
  address: string,
  chain: string,
  options?: GraphTraversalOptions
): Promise<VaspPath | null>;
export function findNearestVasp(
  arg1: string | VaspPath[],
  arg2?: string,
  arg3?: GraphTraversalOptions
): (VaspPath | null) | Promise<VaspPath | null> {
  if (Array.isArray(arg1)) {
    if (arg1.length === 0) return null;
    return arg1.slice().sort((a, b) => a.hops - b.hops)[0] || null;
  }

  return (async () => {
    const graph = await GraphBuilder.buildTransactionGraph(arg1, arg2 || 'ethereum', arg3);
    if (graph.paths.length > 0) {
      return graph.paths[0];
    }
    return null;
  })();
}

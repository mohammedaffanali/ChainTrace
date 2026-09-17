/**
 * CHAINTRACE // Transaction Graph Builder & Bounded Traversal
 * Constructs multi-hop directed graphs from real blockchain transactions.
 */

import {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphEdgeType,
  GraphTraversalOptions,
  TransactionGraph,
  VaspPath,
} from './types';
import { BlockchainService } from '../blockchain/service';
import { NormalizedTransaction } from '../blockchain/types';
import { globalVaspLookupService } from '../vasp/lookupService';
import { VaspRepository } from '../vasp/repository';
import { computeGraphLayout } from './layout';
import { findVaspPaths } from './pathFinder';

// Known protocols for intelligent node type tagging
const KNOWN_MIXERS = new Set<string>([
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc',
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936',
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf',
  '0xa160cdab225685da1d56aa342ad8841c3b53f291',
]);

const KNOWN_BRIDGES = new Set<string>([
  '0x8849bcd0381000000000000000000000000055c2',
  '0x45f1a95b4178f14b24917b07c70057360932543a',
  '0x2a3dd3eb832a84e14f04c6ff24f8d670f5e1ad34',
  '0x3ee1842367830c43d16a2104d870aa0712099341',
  '0xa0c68c638235ee32657e8f720a23cec1bfc77c77', // Polygon Plasma Bridge
]);

const KNOWN_DEXES = new Set<string>([
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
  '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 Router
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap Universal Router
  '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5
  '0x10ed43c718714eb63d5aa57b78b54704e256024e', // PancakeSwap Router
]);

export class GraphBuilder {
  /**
   * Builds an actual multi-hop transaction graph using bounded Breadth-First Search (BFS).
   */
  public static async buildTransactionGraph(
    address: string,
    chain: string,
    options?: GraphTraversalOptions
  ): Promise<TransactionGraph> {
    const startTime = Date.now();
    const cleanAddr = (address || '').trim();
    const cleanChain = (chain || 'ethereum').trim().toLowerCase();

    const maxHops = Math.min(Math.max(options?.maxHops ?? 3, 1), 5);
    const maxNodes = Math.min(Math.max(options?.maxNodes ?? 40, 5), 100);
    const txLimit = Math.min(Math.max(options?.transactionLimit ?? 20, 5), 50);
    const direction = options?.direction ?? 'outgoing';
    const minAmount = options?.minAmount ?? 0;
    const timeoutMs = options?.timeoutMs ?? 12000;
    const effectiveMode = options?.mode || BlockchainService.getSystemMode();

    const nodesMap = new Map<string, GraphNode>();
    const edgesMap = new Map<string, GraphEdge>();
    const visitedAddresses = new Set<string>();

    const makeNodeId = (addr: string, ch: string) => {
      const normAddr = VaspRepository.normalizeAddress(addr, ch);
      return `node-${ch.toLowerCase()}-${normAddr}`;
    };

    // 1. Initialize starting seed node
    const rootNormAddr = VaspRepository.normalizeAddress(cleanAddr, cleanChain);
    const rootNodeId = makeNodeId(rootNormAddr, cleanChain);

    // Initial VASP lookup for starting node
    const rootVaspCheck = await globalVaspLookupService.findVaspByAddress(rootNormAddr, cleanChain);

    const rootNode: GraphNode = {
      id: rootNodeId,
      address: rootNormAddr,
      chain: cleanChain,
      type: rootVaspCheck.matched ? 'vasp' : 'wallet',
      label: rootVaspCheck.matched
        ? `${rootVaspCheck.vasp?.name} (${rootVaspCheck.addressType || 'Entity'})`
        : `Suspect Target (#${rootNormAddr.slice(-4)})`,
      balanceINR: 'Loading...',
      riskScore: rootVaspCheck.matched ? 15 : 92,
      threatLevel: rootVaspCheck.matched ? 'LOW' : 'CRITICAL',
      vaspAssociation: rootVaspCheck.matched && rootVaspCheck.vasp
        ? {
            vasp: rootVaspCheck.vasp,
            addressEntity: rootVaspCheck.address || undefined,
            associationType: rootVaspCheck.associationType,
            confidence: rootVaspCheck.confidence ?? 95,
            factualSummary: rootVaspCheck.factualSummary || rootVaspCheck.associationDescription,
          }
        : undefined,
      cluster: rootVaspCheck.cluster || undefined,
      hopDistance: 0,
      isStartingWallet: true,
      isNearestVasp: rootVaspCheck.matched,
      x: 120,
      y: 240,
      color: rootVaspCheck.matched ? '#10B981' : '#EF4444',
    };

    nodesMap.set(rootNodeId, rootNode);
    visitedAddresses.add(`${cleanChain}:${rootNormAddr}`);

    // 2. BFS Exploration Queue
    interface QueueItem {
      address: string;
      chain: string;
      hop: number;
      parentNodeId?: string;
    }

    const queue: QueueItem[] = [
      {
        address: rootNormAddr,
        chain: cleanChain,
        hop: 0,
      },
    ];

    let truncated = false;

    // Process BFS Queue
    while (queue.length > 0 && nodesMap.size < maxNodes) {
      // Timeout safeguard
      if (Date.now() - startTime > timeoutMs) {
        truncated = true;
        break;
      }

      // Cancellation support
      if (options?.cancelSignal?.aborted) {
        truncated = true;
        break;
      }

      const current = queue.shift()!;

      // Do not expand beyond maxHops
      if (current.hop >= maxHops) {
        continue;
      }

      // Fetch transactions for current address
      let transactions: NormalizedTransaction[] = [];
      try {
        const queryResult = await BlockchainService.queryAddress({
          address: current.address,
          chain: current.chain,
          mode: effectiveMode,
          limit: txLimit,
        });

        transactions = queryResult.transactions || [];

        // Update balance on current node if loaded
        const currentNode = nodesMap.get(makeNodeId(current.address, current.chain));
        if (currentNode && queryResult.balance?.fiatValueINR) {
          currentNode.balanceINR = queryResult.balance.fiatValueINR;
        }
      } catch {
        // Continue BFS even if one address node fails to query
        continue;
      }

      // 3. Process transactions and expand neighbors
      const currentNorm = VaspRepository.normalizeAddress(current.address, current.chain).toLowerCase();

      for (const tx of transactions) {
        if (nodesMap.size >= maxNodes) {
          truncated = true;
          break;
        }

        const fromNorm = VaspRepository.normalizeAddress(tx.from, tx.chain).toLowerCase();
        const toNorm = VaspRepository.normalizeAddress(tx.to, tx.chain).toLowerCase();

        const isOutgoing = fromNorm === currentNorm;
        const isIncoming = toNorm === currentNorm;

        // Apply Direction Filter
        if (direction === 'outgoing' && !isOutgoing) continue;
        if (direction === 'incoming' && !isIncoming) continue;

        // Apply Min Amount Filter
        if (minAmount > 0) {
          const numVal = parseFloat(tx.amount || '0');
          if (!isNaN(numVal) && numVal < minAmount) continue;
        }

        // Apply Time Range Filter
        if (options?.timeRange) {
          if (options.timeRange.start && tx.timestamp < options.timeRange.start) continue;
          if (options.timeRange.end && tx.timestamp > options.timeRange.end) continue;
        }

        // Determine neighbor address
        const neighborAddr = isOutgoing ? tx.to : tx.from;
        if (!neighborAddr || neighborAddr === '0x0000000000000000000000000000000000000000') {
          continue;
        }

        const neighborNorm = VaspRepository.normalizeAddress(neighborAddr, tx.chain);
        const neighborNodeId = makeNodeId(neighborNorm, tx.chain);

        // Check if neighbor already exists in graph
        let neighborNode = nodesMap.get(neighborNodeId);

        if (!neighborNode) {
          // Identify node type and VASP association
          const vaspLookup = await globalVaspLookupService.findVaspByAddress(neighborNorm, tx.chain);

          let nodeType: GraphNodeType = 'wallet';
          let nodeLabel = `Node (#${neighborNorm.slice(-4)})`;
          let riskScore = 65;

          const lower = neighborNorm.toLowerCase();
          if (vaspLookup.matched && vaspLookup.vasp) {
            nodeType = 'vasp';
            nodeLabel = `${vaspLookup.vasp.name} (${vaspLookup.addressType || 'Custody'})`;
            riskScore = 12;
          } else if (KNOWN_MIXERS.has(lower)) {
            nodeType = 'mixer';
            nodeLabel = 'Tornado.Cash Proxy Router';
            riskScore = 99;
          } else if (KNOWN_BRIDGES.has(lower)) {
            nodeType = 'bridge';
            nodeLabel = 'Cross-Chain Bridge Gateway';
            riskScore = 75;
          } else if (KNOWN_DEXES.has(lower)) {
            nodeType = 'dex';
            nodeLabel = 'DEX Liquidity Pool Router';
            riskScore = 40;
          } else if (tx.tokenAddress) {
            nodeType = 'wallet';
            nodeLabel = `Wallet (${neighborNorm.slice(0, 6)}...${neighborNorm.slice(-4)})`;
            riskScore = 70;
          }

          const fiatAmountINR = (parseFloat(tx.amount || '1') * 88.5 * 1000).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          });

          neighborNode = {
            id: neighborNodeId,
            address: neighborNorm,
            chain: tx.chain,
            type: nodeType,
            label: nodeLabel,
            balanceINR: fiatAmountINR,
            riskScore,
            threatLevel: riskScore >= 85 ? 'CRITICAL' : riskScore >= 65 ? 'HIGH' : 'LOW',
            vaspAssociation: vaspLookup.matched && vaspLookup.vasp
              ? {
                  vasp: vaspLookup.vasp,
                  addressEntity: vaspLookup.address || undefined,
                  associationType: vaspLookup.associationType,
                  confidence: vaspLookup.confidence ?? 95,
                  factualSummary: vaspLookup.factualSummary || vaspLookup.associationDescription,
                }
              : undefined,
            cluster: vaspLookup.cluster || undefined,
            hopDistance: current.hop + 1,
            isNearestVasp: vaspLookup.matched,
            x: 120 + (current.hop + 1) * 240,
            y: 240,
            color: '#3B82F6',
          };

          nodesMap.set(neighborNodeId, neighborNode);
        }

        // Create directed transaction edge
        const sourceId = isOutgoing ? makeNodeId(current.address, current.chain) : neighborNodeId;
        const targetId = isOutgoing ? neighborNodeId : makeNodeId(current.address, current.chain);
        const edgeId = `edge-${tx.hash}-${sourceId}-${targetId}`;

        if (!edgesMap.has(edgeId)) {
          let edgeType: GraphEdgeType = 'TRANSFERRED_TO';
          if (neighborNode.type === 'vasp') {
            edgeType = isOutgoing ? 'DEPOSITED_TO' : 'WITHDREW_FROM';
          } else if (neighborNode.type === 'bridge') {
            edgeType = 'BRIDGED_TO';
          } else if (neighborNode.type === 'contract' || neighborNode.type === 'dex') {
            edgeType = 'INTERACTED_WITH';
          }

          const amountINR = (parseFloat(tx.amount || '0') * 88.5).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          });

          const edge: GraphEdge = {
            id: edgeId,
            from: sourceId,
            to: targetId,
            type: edgeType,
            txHash: tx.hash,
            timestamp: tx.timestamp,
            asset: tx.asset,
            amount: tx.amount,
            amountFormatted: `${tx.amount} ${tx.asset}`,
            amountINR: amountINR.startsWith('₹') ? amountINR : `₹${amountINR}`,
            fee: tx.fee || '0.001 ETH',
            sourceChain: tx.chain,
            destinationChain: tx.chain,
            isAttributionPath: false,
            label: `${tx.amount} ${tx.asset}`,
          };

          edgesMap.set(edgeId, edge);
        }

        // Queue neighbor for next hop if not visited and within maxHops
        const neighborKey = `${tx.chain}:${neighborNorm}`;
        if (!visitedAddresses.has(neighborKey) && current.hop + 1 < maxHops) {
          visitedAddresses.add(neighborKey);
          queue.push({
            address: neighborNorm,
            chain: tx.chain,
            hop: current.hop + 1,
            parentNodeId: makeNodeId(current.address, current.chain),
          });
        }
      }
    }

    const rawNodes = Array.from(nodesMap.values());
    const rawEdges = Array.from(edgesMap.values());

    // 4. Discover all paths to VASP infrastructure
    const paths = findVaspPaths(rootNodeId, rawNodes, rawEdges);

    // If paths to VASP exist, mark the edges on the shortest path as attribution paths
    if (paths.length > 0) {
      const shortest = paths[0];
      const pathTxHashes = new Set(shortest.transactions.map((t) => t.txHash));
      for (const edge of rawEdges) {
        if (pathTxHashes.has(edge.txHash)) {
          edge.isAttributionPath = true;
          edge.label = `ATTRIBUTION PATH (${edge.amountFormatted})`;
        }
      }
    }

    // 5. Compute visually pleasing DAG coordinates
    const layout = computeGraphLayout(rawNodes, rawEdges);

    // 6. Calculate VASP candidates summary
    const vaspCandidates = paths.map((p) => ({
      vasp: {
        id: p.targetVasp.id,
        name: p.targetVasp.name,
        legalName: p.targetVasp.legalName,
        country: 'India',
        jurisdiction: 'IND',
        registrationStatus: p.targetVasp.fiuStatus as any,
        regulatoryIdentifier: p.targetVasp.regulatoryIdentifier,
        status: 'ACTIVE' as const,
        riskLevel: 'LOW' as const,
        source: 'FIU-IND Verified Registry',
        sourceType: 'verified_public_source' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      hopDistance: p.hops,
      relationshipType: p.relationshipType,
      confidence: p.targetVasp.confidence,
    }));

    let maxHopReached = 0;
    for (const n of layout.nodes) {
      maxHopReached = Math.max(maxHopReached, n.hopDistance);
    }

    return {
      mode: effectiveMode,
      startingAddress: rootNormAddr,
      chain: cleanChain,
      nodes: layout.nodes,
      edges: rawEdges,
      paths,
      vaspCandidates,
      stats: {
        totalNodes: layout.nodes.length,
        totalEdges: rawEdges.length,
        maxHopReached,
        elapsedMs: Date.now() - startTime,
        truncated,
      },
    };
  }
}

export async function buildTransactionGraph(
  address: string,
  chain: string,
  options?: GraphTraversalOptions
): Promise<TransactionGraph> {
  return GraphBuilder.buildTransactionGraph(address, chain, options);
}

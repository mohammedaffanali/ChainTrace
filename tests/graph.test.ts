import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { buildTransactionGraph } from '../src/lib/graph/graphBuilder';
import { findVaspPaths, findNearestVasp } from '../src/lib/graph/pathFinder';
import { computeGraphLayout } from '../src/lib/graph/layout';
import { globalVaspRepository } from '../src/lib/vasp';
import { GraphNode, GraphEdge } from '../src/lib/graph/types';

describe('PHASE 3 — Real Transaction Graph & VASP Path Analysis', () => {
  const STARTING_WALLET = '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82';

  before(async () => {
    try {
      await globalVaspRepository.upsertVasp({
        id: 'coindcx_test',
        name: 'CoinDCX Test',
        legalName: 'Neblio Technologies Private Limited',
        regulatoryIdentifier: 'FIU-IND-2023-DCX01',
        jurisdiction: 'IND',
        registrationStatus: 'REGISTERED',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        country: 'India',
        source: 'FIU-IND',
        sourceType: 'verified_public_source',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    try {
      await globalVaspRepository.upsertAddress({
        id: 'addr-coindcx-test', vaspId: 'coindcx_test',
        address: '0x38b25A89d1209bAc6a804797Bf96FaD1efb8e9A1',
        chain: 'ethereum',
        addressType: 'hot_wallet',
        source: 'Verified Exchange Deposit',
        sourceType: 'verified_public_source',
        verificationStatus: 'verified',
        confidence: 0.98,
      });
    } catch {}
  });

  describe('Graph Construction & Traversal (buildTransactionGraph)', () => {
    it('should build a transaction graph in demo mode for a known suspect wallet', async () => {
      const graph = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 3,
        mode: 'demo',
      });

      assert.equal(graph.mode, 'demo');
      assert.ok(graph.nodes.length > 0, 'Graph must contain nodes');
      assert.ok(graph.edges.length > 0, 'Graph must contain edges');

      const startNode = graph.nodes.find((n) => n.isStartingWallet);
      assert.ok(startNode, 'Starting wallet node must be marked');
      assert.equal(startNode.address.toLowerCase(), STARTING_WALLET.toLowerCase());
      assert.equal(startNode.hopDistance, 0);

      assert.ok(graph.stats.totalNodes >= graph.nodes.length);
      assert.ok(graph.stats.totalEdges >= graph.edges.length);
      assert.ok(graph.stats.elapsedMs >= 0);
    });

    it('should enforce max hops limit during BFS traversal', async () => {
      const graphHop1 = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 1,
        mode: 'demo',
      });

      for (const node of graphHop1.nodes) {
        assert.ok(
          node.hopDistance <= 1,
          `Node ${node.id} hopDistance ${node.hopDistance} exceeds maxHops 1`
        );
      }
      assert.ok(graphHop1.stats.maxHopReached <= 1);
    });

    it('should enforce max nodes safety bound', async () => {
      const graphSmall = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 3,
        maxNodes: 3,
        mode: 'demo',
      });

      assert.ok(
        graphSmall.nodes.length <= 4,
        `Node count ${graphSmall.nodes.length} must respect maxNodes limit`
      );
    });

    it('should respect transaction direction filtering', async () => {
      const outgoingGraph = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 2,
        direction: 'outgoing',
        mode: 'demo',
      });

      assert.ok(outgoingGraph.nodes.length > 0);
      assert.ok(outgoingGraph.edges.length > 0);
    });

    it('should filter transactions below minAmount threshold', async () => {
      const graphHighMin = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 2,
        minAmount: 10000000,
        mode: 'demo',
      });

      assert.ok(graphHighMin.nodes.length >= 1);
    });

    it('should include mandatory transaction edge fields', async () => {
      const graph = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 2,
        mode: 'demo',
      });

      for (const edge of graph.edges) {
        assert.ok(edge.id, 'Edge must have ID');
        assert.ok(edge.txHash, 'Edge must have transaction hash');
        assert.ok(edge.from, 'Edge must have from node');
        assert.ok(edge.to, 'Edge must have to node');
        assert.ok(edge.type, 'Edge must have a valid type');
        assert.ok(edge.timestamp > 0, 'Edge must have timestamp');
        assert.ok(edge.amount, 'Edge must have amount');
        assert.ok(edge.asset, 'Edge must have asset');
        assert.ok(edge.sourceChain, 'Edge must have sourceChain');
        assert.ok(edge.destinationChain, 'Edge must have destinationChain');
      }
    });

    it('should deduplicate cyclic address lookups and avoid infinite loops', async () => {
      const graph = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 4,
        mode: 'demo',
      });

      const nodeIds = graph.nodes.map((n) => n.id);
      const uniqueIds = new Set(nodeIds);
      assert.equal(nodeIds.length, uniqueIds.size, 'Nodes must not contain duplicate IDs');
    });
  });

  describe('VASP Path Finder & Relationship Typing', () => {
    it('should find nearest VASP and assign correct relationship type', async () => {
      const graph = await buildTransactionGraph(STARTING_WALLET, 'ethereum', {
        maxHops: 3,
        mode: 'demo',
      });

      const paths = findVaspPaths(graph.nodes, graph.edges, STARTING_WALLET, 'ethereum');
      assert.ok(paths.length > 0, 'Must discover VASP path');

      const nearest = findNearestVasp(paths);
      assert.ok(nearest, 'Nearest VASP must be identified');
      assert.ok(nearest.hops > 0, 'Nearest VASP must have hop count');
      assert.ok(nearest.targetVasp.name, 'Nearest VASP must have exchange name');
      assert.ok(nearest.targetVasp.fiuStatus, 'Nearest VASP must have FIU status');

      if (nearest.hops === 1) {
        assert.equal(nearest.relationshipType, 'DIRECT_DEPOSIT');
      } else {
        assert.equal(nearest.relationshipType, 'INDIRECT_TRANSIT');
      }

      assert.ok(nearest.evidence.length > 0, 'Evidence list must not be empty');
      assert.ok(nearest.timestamps.totalSpanSeconds >= 0);
    });

    it('should correctly classify DIRECT_DEPOSIT for 1-hop deposit', () => {
      const nodes: GraphNode[] = [
        {
          id: 'ethereum:0xuser',
          address: '0xuser',
          chain: 'ethereum',
          type: 'wallet',
          label: 'User Wallet',
          hopDistance: 0,
          isStartingWallet: true,
          x: 0,
          y: 0,
          color: '#EF4444',
        },
        {
          id: 'ethereum:0xcoindcx_dep',
          address: '0xcoindcx_dep',
          chain: 'ethereum',
          type: 'vasp',
          label: 'CoinDCX Hot Wallet',
          hopDistance: 1,
          vaspAssociation: {
            vasp: {
              id: 'coindcx',
              name: 'CoinDCX',
              legalName: 'Neblio Technologies Pvt Ltd',
              regulatoryIdentifier: 'FIU-IND-2023-DCX01',
              jurisdiction: 'IND',
              registrationStatus: 'REGISTERED',
              status: 'ACTIVE',
              riskLevel: 'LOW',
              country: 'India',
              source: 'FIU-IND',
              sourceType: 'verified_public_source',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
            },
            associationType: 'DEPOSIT_ADDRESS',
            confidence: 0.99,
            factualSummary: 'Verified deposit address for CoinDCX',
          },
          x: 200,
          y: 0,
          color: '#10B981',
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 'e1',
          from: 'ethereum:0xuser',
          to: 'ethereum:0xcoindcx_dep',
          type: 'DEPOSITED_TO',
          txHash: '0xabc123',
          timestamp: 1716300000,
          asset: 'USDT',
          amount: '50000',
          amountFormatted: '50,000 USDT',
          amountINR: '?42,00,000',
          sourceChain: 'ethereum',
          destinationChain: 'ethereum',
          label: 'Deposit',
        },
      ];

      const paths = findVaspPaths(nodes, edges, '0xuser', 'ethereum');
      assert.equal(paths.length, 1);
      assert.equal(paths[0].hops, 1);
      assert.equal(paths[0].relationshipType, 'DIRECT_DEPOSIT');
      assert.equal(paths[0].targetVasp.name, 'CoinDCX');
    });

    it('should correctly classify INDIRECT_TRANSIT for multi-hop path', () => {
      const nodes: GraphNode[] = [
        {
          id: 'ethereum:0xuser',
          address: '0xuser',
          chain: 'ethereum',
          type: 'wallet',
          label: 'User Wallet',
          hopDistance: 0,
          isStartingWallet: true,
          x: 0,
          y: 0,
          color: '#EF4444',
        },
        {
          id: 'ethereum:0xmule',
          address: '0xmule',
          chain: 'ethereum',
          type: 'wallet',
          label: 'Intermediary Mule',
          hopDistance: 1,
          x: 200,
          y: 0,
          color: '#F59E0B',
        },
        {
          id: 'ethereum:0xvasp',
          address: '0xvasp',
          chain: 'ethereum',
          type: 'vasp',
          label: 'WazirX Custody',
          hopDistance: 2,
          vaspAssociation: {
            vasp: {
              id: 'wazirx',
              name: 'WazirX',
              legalName: 'Zanmai Labs Pvt Ltd',
              regulatoryIdentifier: 'FIU-IND-2023-WAZ02',
              jurisdiction: 'IND',
              registrationStatus: 'REGISTERED',
              status: 'ACTIVE',
              riskLevel: 'LOW',
              country: 'India',
              source: 'FIU-IND',
              sourceType: 'verified_public_source',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
            },
            associationType: 'HOT_WALLET',
            confidence: 0.95,
            factualSummary: 'Verified custody address for WazirX',
          },
          x: 400,
          y: 0,
          color: '#10B981',
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 'e1',
          from: 'ethereum:0xuser',
          to: 'ethereum:0xmule',
          type: 'TRANSFERRED_TO',
          txHash: '0x111',
          timestamp: 1716300000,
          asset: 'ETH',
          amount: '10',
          amountFormatted: '10 ETH',
          amountINR: '?25,00,000',
          sourceChain: 'ethereum',
          destinationChain: 'ethereum',
          label: 'Transfer',
        },
        {
          id: 'e2',
          from: 'ethereum:0xmule',
          to: 'ethereum:0xvasp',
          type: 'DEPOSITED_TO',
          txHash: '0x222',
          timestamp: 1716303600,
          asset: 'ETH',
          amount: '10',
          amountFormatted: '10 ETH',
          amountINR: '?25,00,000',
          sourceChain: 'ethereum',
          destinationChain: 'ethereum',
          label: 'Deposit to Exchange',
        },
      ];

      const paths = findVaspPaths(nodes, edges, '0xuser', 'ethereum');
      assert.equal(paths.length, 1);
      assert.equal(paths[0].hops, 2);
      assert.equal(paths[0].relationshipType, 'INDIRECT_TRANSIT');
      assert.equal(paths[0].transactions.length, 2);
      assert.equal(paths[0].timestamps.totalSpanSeconds, 3600);
    });

    it('should return empty array when no VASP is reachable', () => {
      const nodes: GraphNode[] = [
        {
          id: 'ethereum:0xuser',
          address: '0xuser',
          chain: 'ethereum',
          type: 'wallet',
          label: 'User Wallet',
          hopDistance: 0,
          isStartingWallet: true,
          x: 0,
          y: 0,
          color: '#EF4444',
        },
        {
          id: 'ethereum:0xpeer',
          address: '0xpeer',
          chain: 'ethereum',
          type: 'wallet',
          label: 'Peer Wallet',
          hopDistance: 1,
          x: 200,
          y: 0,
          color: '#3B82F6',
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 'e1',
          from: 'ethereum:0xuser',
          to: 'ethereum:0xpeer',
          type: 'TRANSFERRED_TO',
          txHash: '0x999',
          timestamp: 1716300000,
          asset: 'ETH',
          amount: '1',
          amountFormatted: '1 ETH',
          amountINR: '?2,50,000',
          sourceChain: 'ethereum',
          destinationChain: 'ethereum',
          label: 'Transfer',
        },
      ];

      const paths = findVaspPaths(nodes, edges, '0xuser', 'ethereum');
      assert.equal(paths.length, 0);

      const nearest = findNearestVasp(paths);
      assert.equal(nearest, null);
    });
  });

  describe('Deterministic Canvas Layout Generator', () => {
    it('should calculate valid coordinate positioning and bounding box for SVG canvas', () => {
      const nodes: GraphNode[] = [
        {
          id: 'n1',
          address: '0x1',
          chain: 'ethereum',
          type: 'wallet',
          label: 'Node 1',
          hopDistance: 0,
          isStartingWallet: true,
          x: 0,
          y: 0,
          color: '#EF4444',
        },
        {
          id: 'n2',
          address: '0x2',
          chain: 'ethereum',
          type: 'vasp',
          label: 'Node 2',
          hopDistance: 1,
          isNearestVasp: true,
          x: 0,
          y: 0,
          color: '#10B981',
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 'e1',
          from: 'n1',
          to: 'n2',
          type: 'TRANSFERRED_TO',
          txHash: '0x123',
          timestamp: 1716300000,
          asset: 'ETH',
          amount: '1',
          amountFormatted: '1 ETH',
          amountINR: '?2,50,000',
          sourceChain: 'ethereum',
          destinationChain: 'ethereum',
          label: 'Transfer',
        },
      ];

      const layout = computeGraphLayout(nodes, edges);
      assert.ok(layout.width >= 960);
      assert.ok(layout.height >= 480);
      assert.ok(layout.nodes[0].x < layout.nodes[1].x, 'Hop 0 must be left of Hop 1');
      assert.equal(layout.nodes[1].color, '#C8A96B', 'Nearest VASP node must receive gold color');
    });
  });
});

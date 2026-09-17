import os
import networkx as nx
from typing import Dict, Any, List, Optional
from app.services.vasp.vasp_service import vasp_service
from app.core.config import settings

class GraphIntelligenceService:
    def __init__(self):
        self.neo4j_driver = None
        self._init_neo4j()

    def _init_neo4j(self):
        try:
            from neo4j import GraphDatabase
            uri = getattr(settings, "NEO4J_URI", os.getenv("NEO4J_URI", "bolt://localhost:7687"))
            user = getattr(settings, "NEO4J_USER", os.getenv("NEO4J_USER", "neo4j"))
            password = getattr(settings, "NEO4J_PASSWORD", os.getenv("NEO4J_PASSWORD", "chaintrace2026"))
            self.neo4j_driver = GraphDatabase.driver(uri, auth=(user, password))
            self.neo4j_driver.verify_connectivity()
            print("[INFO] GraphService connected to production Neo4j instance.")
        except Exception:
            self.neo4j_driver = None

    def build_flow_graph(
        self,
        starting_address: str,
        chain: str = "ethereum",
        max_hops: int = 2,
        transactions: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        """
        Builds a directed fund-flow graph.
        If real on-chain normalized transactions are passed, builds dynamic topological graph.
        Otherwise falls back to demonstration graph with explicit DEMO labelling.
        """
        norm_chain = chain.lower().strip()
        start_clean = starting_address.strip()

        # 1. Build from real on-chain transactions if provided
        if transactions and len(transactions) > 0:
            G = nx.DiGraph()
            G.add_node(
                start_clean,
                id=start_clean,
                type="starting_wallet",
                label=f"Target: {start_clean[:6]}...{start_clean[-4:]}",
                address=start_clean,
                chain=norm_chain,
                is_starting_wallet=True,
                hopDistance=0
            )

            target_vasp_name = None
            vasp_nodes = []

            for tx in transactions:
                # Handle both dict and Pydantic model
                from_addr = getattr(tx, "from_address", None) or (tx.get("from_address") if isinstance(tx, dict) else "")
                to_addr = getattr(tx, "to_address", None) or (tx.get("to_address") if isinstance(tx, dict) else "")
                tx_hash = getattr(tx, "transaction_hash", None) or (tx.get("transaction_hash") if isinstance(tx, dict) else "")
                val = getattr(tx, "value", 0.0) if hasattr(tx, "value") else (tx.get("value", 0.0) if isinstance(tx, dict) else 0.0)
                asset = getattr(tx, "asset", "ETH") if hasattr(tx, "asset") else (tx.get("asset", "ETH") if isinstance(tx, dict) else "ETH")
                ts = getattr(tx, "timestamp", 0) if hasattr(tx, "timestamp") else (tx.get("timestamp", 0) if isinstance(tx, dict) else 0)

                from_clean = (from_addr or "").strip()
                to_clean = (to_addr or "").strip()

                if not from_clean or not to_clean:
                    continue

                for addr in [from_clean, to_clean]:
                    if addr not in G:
                        lookup = vasp_service.lookup_address(addr, norm_chain)
                        is_vasp = lookup.get("matched", False)
                        v_name = lookup.get("vasp", {}).get("name") if is_vasp else None
                        
                        node_type = "vasp" if is_vasp else "wallet"
                        label = f"VASP: {v_name}" if is_vasp else f"{addr[:6]}...{addr[-4:]}"

                        if is_vasp:
                            vasp_nodes.append(addr)
                            if not target_vasp_name:
                                target_vasp_name = v_name

                        G.add_node(
                            addr,
                            id=addr,
                            type=node_type,
                            label=label,
                            address=addr,
                            chain=norm_chain,
                            is_vasp=is_vasp,
                            vasp_name=v_name,
                            hopDistance=1 if addr != start_clean else 0
                        )

                # Add directed edge
                edge_id = f"{from_clean}_{to_clean}_{tx_hash[:10]}"
                G.add_edge(
                    from_clean,
                    to_clean,
                    id=edge_id,
                    from_node=from_clean,
                    to_node=to_clean,
                    tx_hash=tx_hash,
                    amount=val,
                    asset=asset,
                    timestamp=ts,
                    type="TRANSFERRED_TO"
                )

            # Compute shortest path to any discovered VASP
            shortest_path = [start_clean]
            if vasp_nodes:
                for v_addr in vasp_nodes:
                    try:
                        p = nx.shortest_path(G, source=start_clean, target=v_addr)
                        if len(p) > 1 and (len(shortest_path) == 1 or len(p) < len(shortest_path)):
                            shortest_path = p
                    except (nx.NetworkXNoPath, nx.NodeNotFound):
                        pass

            nodes_out = [{"id": n, **G.nodes[n]} for n in G.nodes]
            edges_out = [{"source": u, "target": v, **G.edges[u, v]} for u, v in G.edges]

            return {
                "engine": "DYNAMIC_NETWORKX_LIVE",
                "is_live_data": True,
                "nodes": nodes_out,
                "edges": edges_out,
                "path": shortest_path,
                "hops": len(shortest_path) - 1 if len(shortest_path) > 1 else 0,
                "target_vasp": target_vasp_name or "Unknown / Unattributed",
                "total_nodes": len(nodes_out),
                "total_edges": len(edges_out)
            }

        # 2. Production Neo4j shortest path query if connected
        if self.neo4j_driver:
            try:
                with self.neo4j_driver.session() as session:
                    cypher_query = """
                    MATCH (start:Wallet {address: $address})
                    MATCH (target:VaspAddress)
                    MATCH p = shortestPath((start)-[:TRANSFERRED_TO*..5]->(target))
                    RETURN p, length(p) as hops
                    LIMIT 1
                    """
                    result = session.run(cypher_query, address=start_clean)
                    record = result.single()
                    if record:
                        path = record["p"]
                        nodes = [{"id": n["address"], "label": n.get("name", n["address"][:8]), "type": list(n.labels)[0].lower()} for n in path.nodes]
                        edges = [{"source": r.start_node["address"], "target": r.end_node["address"], "tx_hash": r.get("tx_hash", "")} for r in path.relationships]
                        return {
                            "engine": "PRODUCTION_NEO4J",
                            "is_live_data": True,
                            "nodes": nodes,
                            "edges": edges,
                            "path": [n["address"] for n in path.nodes],
                            "hops": record["hops"],
                            "target_vasp": path.nodes[-1].get("vasp_name", "Known VASP")
                        }
            except Exception as e:
                print(f"[WARN] Neo4j traversal query failed, falling back to NetworkX: {e}")

        # 3. Explicitly labeled fallback for offline / mock testing
        G = nx.DiGraph()
        G.add_node(start_clean, id=start_clean, type="wallet", label=f"Target: {start_clean[:6]}...", chain=norm_chain, hopDistance=0)
        
        hop1 = "0x28c6c06298d514db089934071355e5743bf21d60" if norm_chain == "ethereum" else "TYD5H3vi1sz2rXXg7c1QWB69zdtGYFxZRQ"
        lookup = vasp_service.lookup_address(hop1, norm_chain)
        vasp_name = lookup["vasp"]["name"] if lookup["matched"] else "Unknown Destination"
        node_type = "vasp" if lookup["matched"] else "wallet"

        G.add_node(hop1, id=hop1, type=node_type, label=vasp_name, chain=norm_chain, hopDistance=1)
        G.add_edge(start_clean, hop1, source=start_clean, target=hop1, tx_hash="0x9f18a47b2c019d67812984ea", amount=12.45, asset="ETH" if norm_chain == "ethereum" else "TRX", type="TRANSFERRED_TO")

        nodes = [{"id": n, **G.nodes[n]} for n in G.nodes]
        edges = [{"source": u, "target": v, **G.edges[u, v]} for u, v in G.edges]
        shortest_path = [start_clean, hop1]

        return {
            "engine": "FALLBACK_DEMO_NETWORKX",
            "is_live_data": False,
            "nodes": nodes,
            "edges": edges,
            "path": shortest_path,
            "hops": 1,
            "target_vasp": vasp_name
        }

graph_service = GraphIntelligenceService()

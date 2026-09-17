import datetime
import time
from typing import Dict, Any

from app.core.celery_app import celery_app
from app.services.graph.graph_service import graph_service
from app.services.vasp.vasp_service import vasp_service
from app.services.scoring.explainable_scoring import compute_attribution
from app.services.reports.pdf_generator import generate_evidentiary_pdf

@celery_app.task(bind=True, name="app.tasks.forensic_tasks.traverse_multi_hop_graph")
def traverse_multi_hop_graph_task(self, starting_address: str, chain: str = "ethereum", max_hops: int = 3) -> Dict[str, Any]:
    self.update_state(state="INDEXING_BLOCKCHAIN", meta={"progress": 25, "status": "Indexing ledger mempool & transactions"})
    time.sleep(0.5)
    
    self.update_state(state="TRAVERSING_TOPOLOGY", meta={"progress": 60, "status": f"Traversing graph across {max_hops} hops"})
    graph_result = graph_service.build_flow_graph(starting_address, chain, max_hops)
    time.sleep(0.5)
    
    self.update_state(state="SCORING_VASP_CANDIDATES", meta={"progress": 85, "status": "Executing 7-signal attribution scoring"})
    lookup = vasp_service.lookup_address(starting_address, chain)
    
    vasp_entity = lookup['vasp'] if lookup['matched'] else {
        'id': 'vasp_unattributed',
        'name': 'No Identified VASP Cluster',
        'fiuStatus': 'UNREGISTERED',
        'jurisdiction': 'UNKNOWN'
    }
    
    attribution_result = compute_attribution(
        target_address=starting_address,
        chain=chain,
        vasp_entity=vasp_entity,
        hops=graph_result.get('hops', 1),
        is_deposit_match=lookup['matched'],
        cluster_member=lookup['matched'],
        is_fiu_registered=(vasp_entity.get('fiuStatus') == 'REGISTERED')
    )
    
    return {
        "task_id": self.request.id,
        "completed_at": datetime.datetime.utcnow().isoformat(),
        "graph": graph_result,
        "attribution": attribution_result
    }

@celery_app.task(bind=True, name="app.tasks.forensic_tasks.generate_forensic_report_pdf")
def generate_forensic_report_pdf_task(self, report_params: Dict[str, Any]) -> Dict[str, Any]:
    self.update_state(state="COMPILING_EVIDENCE", meta={"progress": 40, "status": "Compiling Section 65B Electronic Certificate"})
    pdf_bytes = generate_evidentiary_pdf(**report_params)
    
    return {
        "task_id": self.request.id,
        "completed_at": datetime.datetime.utcnow().isoformat(),
        "pdf_size_bytes": len(pdf_bytes),
        "status": "COMPLETED"
    }

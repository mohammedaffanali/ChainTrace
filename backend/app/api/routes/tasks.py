import uuid
import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.task import TaskRecord
from app.services.graph.graph_service import graph_service
from app.services.vasp.vasp_service import vasp_service
from app.services.scoring.explainable_scoring import compute_attribution

router = APIRouter()

class TraceTaskRequest(BaseModel):
    wallet_address: str
    chain: str = "ethereum"
    max_hops: int = 3
    user_id: Optional[str] = "officer_default"

class TaskStatusResponse(BaseModel):
    task_id: str
    task_name: str
    status: str
    progress_percent: int
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime.datetime

@router.post("/trace", response_model=Dict[str, Any], status_code=status.HTTP_202_ACCEPTED)
async def dispatch_trace_task(
    payload: TraceTaskRequest,
    db: AsyncSession = Depends(get_db)
):
    task_id = str(uuid.uuid4())
    
    # Check if Celery worker is dispatchable via Redis
    dispatched_to_celery = False
    try:
        from app.tasks.forensic_tasks import traverse_multi_hop_graph_task
        async_result = traverse_multi_hop_graph_task.apply_async(
            args=[payload.wallet_address, payload.chain, payload.max_hops],
            task_id=task_id
        )
        dispatched_to_celery = True
    except Exception:
        # Graceful development fallback: Celery/Redis offline
        pass

    if not dispatched_to_celery:
        # Synchronous fallback calculation for dev/demo mode
        graph_res = graph_service.build_flow_graph(payload.wallet_address, payload.chain, payload.max_hops)
        lookup = vasp_service.lookup_address(payload.wallet_address, payload.chain)
        vasp_entity = lookup['vasp'] if lookup['matched'] else {
            'id': 'vasp_unattributed',
            'name': 'No Identified VASP Cluster',
            'fiuStatus': 'UNREGISTERED',
            'jurisdiction': 'UNKNOWN'
        }
        attrib_res = compute_attribution(
            target_address=payload.wallet_address,
            chain=payload.chain,
            vasp_entity=vasp_entity,
            hops=graph_res.get('hops', 1),
            is_deposit_match=lookup['matched'],
            cluster_member=lookup['matched'],
            is_fiu_registered=(vasp_entity.get('fiuStatus') == 'REGISTERED')
        )
        final_result = {
            "graph": graph_res,
            "attribution": attrib_res,
            "completed_at": datetime.datetime.utcnow().isoformat()
        }
        
        record = TaskRecord(
            task_id=task_id,
            task_name="app.tasks.forensic_tasks.traverse_multi_hop_graph",
            user_id=payload.user_id,
            status="COMPLETED",
            progress_percent=100,
            parameters=payload.model_dump(),
            result_json=final_result,
            started_at=datetime.datetime.utcnow(),
            completed_at=datetime.datetime.utcnow()
        )
    else:
        record = TaskRecord(
            task_id=task_id,
            task_name="app.tasks.forensic_tasks.traverse_multi_hop_graph",
            user_id=payload.user_id,
            status="QUEUED",
            progress_percent=0,
            parameters=payload.model_dump(),
            started_at=datetime.datetime.utcnow()
        )

    db.add(record)
    await db.commit()

    return {
        "task_id": task_id,
        "status": record.status,
        "mode": "CELERY_REDIS" if dispatched_to_celery else "SYNCHRONOUS_DEMO_FALLBACK",
        "progress": record.progress_percent,
        "message": "Multi-hop graph forensic trace enqueued successfully."
    }

@router.get("/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(TaskRecord).where(TaskRecord.task_id == task_id)
    res = await db.execute(stmt)
    task = res.scalars().first()
    
    if not task:
        # Check Celery directly
        try:
            from app.core.celery_app import celery_app
            async_res = celery_app.AsyncResult(task_id)
            if async_res.state == "SUCCESS":
                return TaskStatusResponse(
                    task_id=task_id,
                    task_name="celery_job",
                    status="COMPLETED",
                    progress_percent=100,
                    result=async_res.result,
                    created_at=datetime.datetime.utcnow()
                )
        except Exception:
            pass
        raise HTTPException(status_code=404, detail=f"Task record {task_id} not found.")

    return TaskStatusResponse(
        task_id=task.task_id,
        task_name=task.task_name,
        status=task.status,
        progress_percent=task.progress_percent,
        result=task.result_json,
        error_message=task.error_message,
        created_at=task.created_at
    )

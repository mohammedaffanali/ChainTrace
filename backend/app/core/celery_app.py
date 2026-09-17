import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# DB 0: Celery Broker (queues, routing, acknowledgments)
# DB 1: Celery Result Backend (task status, JSON outputs)
broker_url = f"{REDIS_URL}/0"
result_backend = f"{REDIS_URL}/1"

celery_app = Celery(
    "chaintrace_worker",
    broker=broker_url,
    backend=result_backend,
    include=["app.tasks.forensic_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    result_expires=3600,
    task_track_started=True,
    task_routes={
        "app.tasks.forensic_tasks.scrape_and_index_wallet": {"queue": "blockchain_indexing"},
        "app.tasks.forensic_tasks.traverse_multi_hop_graph": {"queue": "graph_processing"},
        "app.tasks.forensic_tasks.compute_explainable_attribution": {"queue": "forensic_scoring"},
        "app.tasks.forensic_tasks.generate_forensic_report_pdf": {"queue": "report_generation"},
    }
)

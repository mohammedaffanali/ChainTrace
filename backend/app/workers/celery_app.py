from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "chaintrace_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True
)

@celery_app.task(name="tasks.trace_wallet_async")
def trace_wallet_async(wallet_address: str, chain: str = "ethereum"):
    return {
        "status": "completed",
        "wallet": wallet_address,
        "chain": chain,
        "processed_by": "celery_worker"
    }

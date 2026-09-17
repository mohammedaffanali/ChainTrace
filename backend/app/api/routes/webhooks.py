import logging
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.wallet_analysis import WebhookEventRecord
from app.providers.alchemy_provider import AlchemyProvider

logger = logging.getLogger("chaintrace.api.webhooks")

router = APIRouter()

@router.post("/alchemy", status_code=status.HTTP_200_OK)
async def receive_alchemy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    raw_body = await request.body()
    sig_header = request.headers.get("x-alchemy-signature", "")

    # Validate webhook signature if signing key is configured
    signing_key = settings.ALCHEMY_WEBHOOK_SIGNING_KEY
    if signing_key:
        valid = AlchemyProvider.verify_webhook_signature(raw_body, sig_header, signing_key)
        if not valid:
            logger.warning("Rejected webhook: Invalid Alchemy HMAC signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook HMAC signature"
            )

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = data.get("id") or str(data.get("webhookId", "unknown"))
    network = str(data.get("network", "ethereum")).lower()
    event_type = str(data.get("type", "ADDRESS_ACTIVITY"))

    # Event deduplication check
    stmt = select(WebhookEventRecord).where(WebhookEventRecord.event_id == event_id)
    res = await db.execute(stmt)
    existing = res.scalars().first()

    if existing:
        logger.info(f"Duplicate webhook event {event_id} ignored.")
        return {"status": "ignored", "reason": "duplicate_event", "event_id": event_id}

    # Record event
    record = WebhookEventRecord(
        event_id=event_id,
        source="alchemy",
        network=network,
        event_type=event_type,
        payload=data,
        processed=True
    )
    db.add(record)
    await db.commit()

    logger.info(f"Successfully processed and recorded webhook event: {event_id}")
    return {"status": "received", "event_id": event_id}

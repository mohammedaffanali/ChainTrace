import uuid
import datetime
from typing import Optional, Any
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class WalletAnalysisRecord(Base):
    __tablename__ = "wallet_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_address: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    network: Mapped[str] = mapped_column(String(32), nullable=False)
    data_source: Mapped[str] = mapped_column(String(64), nullable=False)
    latest_block: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_live_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    balance_native: Mapped[float] = mapped_column(Numeric(18, 6), default=0.0, nullable=False)
    symbol: Mapped[str] = mapped_column(String(16), default="ETH", nullable=False)
    attribution_status: Mapped[str] = mapped_column(String(64), nullable=False)
    attributed_vasp: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Numeric(4, 3), default=0.0, nullable=False)
    graph_snapshot: Mapped[Any] = mapped_column(JSON, nullable=False)
    raw_payload: Mapped[Any] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

class WebhookEventRecord(Base):
    __tablename__ = "webhook_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    source: Mapped[str] = mapped_column(String(32), default="alchemy", nullable=False)
    network: Mapped[str] = mapped_column(String(32), nullable=False)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[Any] = mapped_column(JSON, nullable=False)
    processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

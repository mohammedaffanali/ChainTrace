import uuid
import datetime
from typing import Optional, Any
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, index=True, nullable=False)
    officer_badge_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    officer_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    action: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    target_resource: Mapped[str] = mapped_column(String(255), nullable=False)
    agency_branch: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    details_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    integrity_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    legal_authority: Mapped[str] = mapped_column(String(255), default="CrPC Sec 91 / PMLA Sec 50")

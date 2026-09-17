import uuid
import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Numeric, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Investigation(Base, TimestampMixin):
    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    agency: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE_TRACE", index=True, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), default="HIGH", nullable=False)
    total_exposure_inr: Mapped[float] = mapped_column(Numeric(18, 2), default=0.0, nullable=False)

    # Relationships
    created_by_user = relationship("User", back_populates="investigations")
    wallets = relationship("InvestigationWallet", back_populates="investigation", cascade="all, delete-orphan")
    notes = relationship("InvestigationNote", back_populates="investigation", cascade="all, delete-orphan")
    attributions = relationship("AttributionResult", back_populates="investigation")

class InvestigationWallet(Base):
    __tablename__ = "investigation_wallets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id"), nullable=False)
    address: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    chain: Mapped[str] = mapped_column(String(32), nullable=False) # ethereum, polygon, tron, etc.
    label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    is_seed_target: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    risk_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    added_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("investigation_id", "chain", "address", name="uq_inv_wallet"),
    )

    investigation = relationship("Investigation", back_populates="wallets")

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id"), nullable=False)
    author_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    note_type: Mapped[str] = mapped_column(String(32), default="OBSERVATION", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="notes")
    author_user = relationship("User", back_populates="notes")

import uuid
import datetime
from typing import Optional, List, Any
from sqlalchemy import String, Integer, Numeric, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class AttributionResult(Base):
    __tablename__ = "attribution_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("investigations.id"), nullable=True)
    wallet_address: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    chain: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False) # ATTRIBUTED_CANDIDATE, NO_RELIABLE_ATTRIBUTION
    primary_vasp_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("vasps.id"), nullable=True)
    composite_confidence: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    confidence_band: Mapped[str] = mapped_column(String(32), nullable=False)
    nearest_hops: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    relationship_type: Mapped[str] = mapped_column(String(32), nullable=False)
    signal_decomposition_json: Mapped[Any] = mapped_column(JSON, nullable=False)
    anti_overclaiming_statement: Mapped[str] = mapped_column(Text, nullable=False)
    evaluated_by_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    is_production_grade: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="attributions")
    primary_vasp = relationship("Vasp", back_populates="attributions")
    evidence_records = relationship("EvidenceRecord", back_populates="attribution", cascade="all, delete-orphan")

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attribution_id: Mapped[str] = mapped_column(String(36), ForeignKey("attribution_results.id"), nullable=False)
    signal_name: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    weight: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    observed_facts: Mapped[Any] = mapped_column(JSON, nullable=False) # List of fact strings
    inferences: Mapped[Any] = mapped_column(JSON, nullable=False)     # List of inference strings
    statutory_basis: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

    attribution = relationship("AttributionResult", back_populates="evidence_records")

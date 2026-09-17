import datetime
from typing import Optional, List
from sqlalchemy import String, Numeric, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Vasp(Base, TimestampMixin):
    __tablename__ = "vasps"

    id: Mapped[str] = mapped_column(String(64), primary_key=True) # e.g. vasp_coindcx, vasp_binance
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    legal_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(64), nullable=False)
    jurisdiction: Mapped[str] = mapped_column(String(32), nullable=False)
    fiu_status: Mapped[str] = mapped_column(String(32), index=True, nullable=False) # REGISTERED, NOTICE_SERVED, etc.
    fiu_registration_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False)
    risk_level: Mapped[str] = mapped_column(String(16), default="LOW", nullable=False)
    nodal_officer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    nodal_officer_phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relationships
    clusters = relationship("WalletCluster", back_populates="vasp", cascade="all, delete-orphan")
    addresses = relationship("VaspAddress", back_populates="vasp", cascade="all, delete-orphan")
    attributions = relationship("AttributionResult", back_populates="primary_vasp")

class WalletCluster(Base, TimestampMixin):
    __tablename__ = "wallet_clusters"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    vasp_id: Mapped[str] = mapped_column(String(64), ForeignKey("vasps.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    chain: Mapped[str] = mapped_column(String(32), nullable=False)
    cluster_type: Mapped[str] = mapped_column(String(32), default="DEPOSIT_SWEEP", nullable=False)
    confidence: Mapped[float] = mapped_column(Numeric(4, 3), default=0.95, nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(32), default="VERIFIED", nullable=False)

    vasp = relationship("Vasp", back_populates="clusters")
    addresses = relationship("VaspAddress", back_populates="cluster")

class VaspAddress(Base, TimestampMixin):
    __tablename__ = "vasp_addresses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    vasp_id: Mapped[str] = mapped_column(String(64), ForeignKey("vasps.id"), nullable=False)
    cluster_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("wallet_clusters.id"), nullable=True)
    address: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    chain: Mapped[str] = mapped_column(String(32), nullable=False)
    address_type: Mapped[str] = mapped_column(String(32), default="deposit", nullable=False)
    confidence: Mapped[float] = mapped_column(Numeric(4, 3), default=0.95, nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(32), default="VERIFIED", nullable=False)
    verified_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    __table_args__ = (
        UniqueConstraint("chain", "address", name="uq_chain_vasp_addr"),
    )

    vasp = relationship("Vasp", back_populates="addresses")
    cluster = relationship("WalletCluster", back_populates="addresses")

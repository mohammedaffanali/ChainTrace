import uuid
import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    badge_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    designation: Mapped[str] = mapped_column(String(128), nullable=False, default="Forensic Investigator")
    agency: Mapped[str] = mapped_column(String(255), nullable=False, default="Cyber Crime Unit // FIU-IND Liaison")
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="INVESTIGATOR") # "INVESTIGATOR" | "ANALYST" | "ADMINISTRATOR"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    investigations = relationship("Investigation", back_populates="created_by_user", cascade="all, delete-orphan")
    notes = relationship("InvestigationNote", back_populates="author_user")

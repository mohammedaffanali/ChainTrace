import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.models.base import Base

logger = logging.getLogger("chaintrace.db")

# Determine engine type and active runtime mode
active_db_url = settings.ASYNC_DATABASE_URL
is_fallback_mode = "sqlite" in active_db_url.lower()

if is_fallback_mode:
    logger.warning("==================================================================")
    logger.warning("CHAINTRACE // RUNTIME ENGINE: FALLBACK DEVELOPMENT / DEMO (SQLITE)")
    logger.warning("Evidentiary Status: NON_EVIDENTIARY_SIMULATION")
    logger.warning("==================================================================")
    # Ensure data directory exists for SQLite
    os.makedirs(os.path.dirname(settings.SQLITE_DB_PATH), exist_ok=True)
    engine = create_async_engine(
        active_db_url,
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    logger.info("CHAINTRACE // RUNTIME ENGINE: PRODUCTION (POSTGRESQL + ASYNCPG)")
    engine = create_async_engine(
        active_db_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Initializes schema and seeds essential forensic records if table is empty."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

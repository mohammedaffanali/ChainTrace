import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CHAINTRACE Backend Intelligence API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development") # "production" | "development" | "test"
    
    # Security & JWT Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chaintrace_super_secure_jwt_secret_key_2026_forensics_pmla")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true" # True in prod
    COOKIE_SAMESITE: str = "lax"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Relational Database Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "chaintrace")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)
    
    # SQLite Fallback for Dev/Demo
    SQLITE_DB_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data",
        "chaintrace_fallback.db"
    )

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            # Normalize to asyncpg if postgresql
            if self.DATABASE_URL.startswith("postgresql://"):
                return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
            return self.DATABASE_URL
        
        # In production, require PostgreSQL
        if self.ENVIRONMENT == "production":
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        # Check if local postgres is preferred via env, else use dev sqlite fallback
        if os.getenv("USE_POSTGRES", "false").lower() == "true":
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        return f"sqlite+aiosqlite:///{self.SQLITE_DB_PATH}"

    # Blockchain Provider RPCs & Explorer APIs
    ETH_RPC_URL: str = os.getenv("ETH_RPC_URL", "https://cloudflare-eth.com")
    POLYGON_RPC_URL: str = os.getenv("POLYGON_RPC_URL", "https://polygon-rpc.com")
    ETHERSCAN_API_KEY: Optional[str] = os.getenv("ETHERSCAN_API_KEY", "")
    POLYGONSCAN_API_KEY: Optional[str] = os.getenv("POLYGONSCAN_API_KEY", "")
    TRONGRID_API_KEY: Optional[str] = os.getenv("TRONGRID_API_KEY", "")
    TRON_FULL_NODE_URL: str = os.getenv("TRON_FULL_NODE_URL", "https://api.trongrid.io")

    # Graph Databases & Storage
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "chaintrace_password")

    # Asynchronous Workers & Broker
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

    # Path to VASP JSON Database
    VASP_DATA_PATH: str = os.getenv(
        "VASP_DATA_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "vasp_database.json")
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()

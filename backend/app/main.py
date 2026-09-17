from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, wallets, attribution, investigations, reports, tasks, vasp_admin, websocket, users, wallet_analysis, webhooks
from app.db.init_data import seed_database
from app.db.session import is_fallback_mode

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data on startup
    try:
        await seed_database()
    except Exception as e:
        print(f"[WARN] Database initialization notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware supporting credentials and HTTP-only cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evidentiary telemetry & security headers middleware
@app.middleware("http")
async def add_evidentiary_telemetry_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Telemetry and security headers
    engine_name = "FALLBACK-DEMO-SQLITE-NETWORKX" if is_fallback_mode else "PRODUCTION-POSTGRES-NEO4J"
    evidentiary_status = "NON_EVIDENTIARY_SIMULATION" if is_fallback_mode else "PRODUCTION_GRADE"
    
    response.headers["X-ChainTrace-Engine"] = engine_name
    response.headers["X-ChainTrace-Evidentiary-Status"] = evidentiary_status
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# Register API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["User Management"])
app.include_router(wallets.router, prefix=f"{settings.API_V1_STR}/wallets", tags=["Wallets"])
app.include_router(attribution.router, prefix=f"{settings.API_V1_STR}/attribution", tags=["Attribution"])
app.include_router(investigations.router, prefix=f"{settings.API_V1_STR}/investigations", tags=["Investigations"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["Tasks"])
app.include_router(vasp_admin.router, prefix=f"{settings.API_V1_STR}/vasp", tags=["VASP Admin"])
app.include_router(websocket.router, prefix=f"{settings.API_V1_STR}/ws", tags=["Live Telemetry WebSocket"])
app.include_router(wallet_analysis.router, prefix=f"{settings.API_V1_STR}/analysis", tags=["Wallet Intelligence Analysis"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["Blockchain Webhooks"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "runtime_mode": "FALLBACK_DEMO" if is_fallback_mode else "PRODUCTION",
        "engine": "FALLBACK-DEMO-SQLITE-NETWORKX" if is_fallback_mode else "PRODUCTION-POSTGRES-NEO4J",
        "evidentiary_status": "NON_EVIDENTIARY_SIMULATION" if is_fallback_mode else "PRODUCTION_GRADE",
        "services": {
            "database": "CONNECTED_SQLITE_FALLBACK" if is_fallback_mode else "CONNECTED_POSTGRESQL",
            "neo4j": "FALLBACK_NETWORKX_STUB" if is_fallback_mode else "CONFIGURED",
            "redis": "CONFIGURED"
        }
    }

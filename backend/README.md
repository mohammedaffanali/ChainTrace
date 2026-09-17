# CHAINTRACE — Blockchain Intelligence Backend (Python & Web3.py)

FastAPI & Web3.py intelligence service for **CHAINTRACE** (Smart India Hackathon 2026).

## Technology Architecture
- **Web3.py**: EVM native queries, checksum normalization, EIP-55 verification, contract bytecode inspection.
- **FastAPI**: Asynchronous high-throughput REST API with OpenAPI autodocs.
- **NetworkX & Neo4j**: Multi-hop directed graph traversal, clustering, and shortest-path identification to nearest VASPs.
- **7-Signal Scoring Engine**: Mathematically weighted attribution confidence model with zero speculative overclaiming.
- **Celery & Redis**: Asynchronous forensic trace workers.

## Quick Start (Local)

1. Activate virtual environment:
   ackend\venv\Scripts\activate (Windows) or source backend/venv/bin/activate (Linux/macOS)

2. Run automated tests:
   python -m pytest backend/tests

3. Start API server:
   uvicorn app.main:app --reload --port 8000

## Docker Deployment
`ash
cd backend
docker compose up --build
`

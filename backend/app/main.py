"""
AMO SecurePay API — FastAPI application entry point.

Start with:
  uvicorn app.main:app --reload --port 8000
"""

import logging
import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routers.transfers import router as transfers_router

# ---------------------------------------------------------------------------
# Structured logging configuration
# ---------------------------------------------------------------------------
_LOG_CONFIG = {
    "version":            1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "[%(asctime)s] %(levelname)-8s %(name)s — %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class":     "logging.StreamHandler",
            "formatter": "default",
            "stream":    "ext://sys.stdout",
        }
    },
    "root": {
        "level":    "INFO",
        "handlers": ["console"],
    },
    # Silence noisy third-party loggers
    "loggers": {
        "httpx":         {"level": "WARNING"},
        "httpcore":      {"level": "WARNING"},
        "sqlalchemy.engine": {"level": "WARNING"},
    },
}

logging.config.dictConfig(_LOG_CONFIG)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Application lifespan — runs on startup and shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup  → create all tables (idempotent via CREATE TABLE IF NOT EXISTS).
    Shutdown → nothing special needed (SQLite closes via GC).
    """
    log.info("━━━ AMO SecurePay API starting up ━━━")
    log.info("Project : %s v%s", settings.PROJECT_NAME, settings.API_VERSION)
    log.info("Database: %s", settings.DATABASE_URL)
    log.info(
        "Squad   : %s (%s)",
        settings.SQUAD_BASE_URL,
        "key configured" if settings.SQUAD_SECRET_KEY else "⚠ NO KEY — demo mode",
    )

    # Create all SQLAlchemy tables (no-op if they already exist)
    Base.metadata.create_all(bind=engine)
    log.info("Database tables verified / created")

    yield  # application runs here

    log.info("━━━ AMO SecurePay API shutting down ━━━")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title       = settings.PROJECT_NAME,
    version     = settings.API_VERSION,
    description = (
        "AI-native Nigerian banking API powering AMO SecurePay. "
        "Provides Squad-backed virtual accounts, real-time NIP payouts, "
        "and a 7-module AI Fraud Shield on every transaction."
    ),
    docs_url    = "/docs",
    redoc_url   = "/redoc",
    lifespan    = lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in dev; restrict to your frontend URL in prod
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],   # TODO: restrict to frontend domain in production
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(
    transfers_router,
    prefix = f"{settings.API_V1_STR}/transactions",
    tags   = ["Transactions"],
)


# ---------------------------------------------------------------------------
# Root endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"], summary="Root health check")
def root():
    return {"status": "online", "service": settings.PROJECT_NAME}


@app.get("/info", tags=["Health"], summary="API metadata")
def info():
    """Returns version, feature flags, and gateway connectivity status."""
    return {
        "project":  settings.PROJECT_NAME,
        "version":  settings.API_VERSION,
        "features": {
            "ai_fraud_shield":      True,
            "virtual_accounts":     True,
            "nip_payouts":          True,
            "squad_key_configured": bool(settings.SQUAD_SECRET_KEY),
        },
        "gateway": settings.SQUAD_BASE_URL,
    }

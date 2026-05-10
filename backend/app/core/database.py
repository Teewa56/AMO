"""
Database engine, session factory, and dependency injection.

SQLite is used with WAL (Write-Ahead Logging) mode enabled so concurrent
reads do not block writes — important for the Squad webhook + dashboard
polling that can arrive simultaneously.
"""

import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# check_same_thread=False is required for SQLite when FastAPI hands the
# same connection across async boundary (event loop thread differs).
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    # Pool settings: keep 5 connections ready, allow 10 overflow under spike
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Evict stale connections before checkout
)


# ---------------------------------------------------------------------------
# Enable WAL mode once per new SQLite connection
# ---------------------------------------------------------------------------
@event.listens_for(engine, "connect")
def _set_wal_mode(dbapi_conn, _connection_record):
    """Switch SQLite journal to WAL for better concurrent read/write."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")  # Safe + fast with WAL
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()
    log.debug("SQLite WAL mode activated on new connection")


# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ORM declarative base — all models inherit from this
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency — yields a DB session per request
# ---------------------------------------------------------------------------
def get_db():
    """Yield a transactional session; always close on exit."""
    db: Session = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

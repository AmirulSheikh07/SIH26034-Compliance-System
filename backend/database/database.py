from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ---------------------------------------------------------------------------
# Database URL
# TODO: Replace YOUR_PASSWORD with your actual PostgreSQL password before
#       running the server. Never commit real credentials to version control.
# ---------------------------------------------------------------------------
DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/sih26034"

engine = create_engine(
    DATABASE_URL,
    # pool_pre_ping keeps the connection alive across idle periods
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

# ---------------------------------------------------------------------------
# Auto-create all tables defined in models when the application starts.
# Import models before this line is executed so SQLAlchemy can discover them.
# In production, prefer Alembic migrations instead of create_all.
# ---------------------------------------------------------------------------
from database import models  # noqa: E402, F401  – registers all ORM models
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Dependency – use in FastAPI route handlers via Depends(get_db)
# ---------------------------------------------------------------------------
def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

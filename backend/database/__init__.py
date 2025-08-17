from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from typing import Generator
from sqlalchemy.orm import Session

load_dotenv()

def get_database_url() -> str:
    """
    Get the database URL from the environment variables.
    """
    user = os.getenv('POSTGRES_USER')
    pwd = os.getenv('POSTGRES_PASSWORD')
    host = os.getenv('POSTGRES_HOST') or '127.0.0.1'
    port = os.getenv('POSTGRES_PORT') or '5432'
    db = os.getenv('POSTGRES_DB')
    missing = [k for k, v in [
        ('POSTGRES_USER', user),
        ('POSTGRES_PASSWORD', pwd),
        ('POSTGRES_DB', db),
    ] if not v]
    if missing:
        raise RuntimeError(f"Missing required DB env vars: {', '.join(missing)}")
    return f"postgresql+psycopg://{user}:{pwd}@{host}:{port}/{db}"

engine = create_engine(get_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db    
    finally:
        db.close()

__all__ = ["Base", "get_db"]
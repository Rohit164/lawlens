"""
Simple local database configuration for development
Uses SQLite to avoid PostgreSQL connection issues
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use SQLite for local development to avoid connection issues
DATABASE_URL = "sqlite:///./lawlens_local.db"

print("[DB] Using SQLite for local development")
print(f"[DB] Database file: {os.path.abspath('lawlens_local.db')}")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False to reduce logs
    connect_args={"check_same_thread": False}  # SQLite specific
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
    
# Get current database info
def get_db_info():
    return {
        "type": "SQLite", 
        "file": "lawlens_local.db", 
        "status": "Local Development",
        "path": os.path.abspath("lawlens_local.db")
    }

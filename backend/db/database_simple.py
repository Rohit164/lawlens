from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# For development on Windows, use SQLite as fallback
DATABASE_URL = os.getenv("DATABASE_URL")

# Check if we can connect to PostgreSQL, otherwise use SQLite
if DATABASE_URL and "postgresql" in DATABASE_URL:
    try:
        # Try PostgreSQL connection
        engine = create_engine(DATABASE_URL, echo=True)
        # Test connection
        engine.connect()
        print("✅ Connected to PostgreSQL (NeonDB)")
    except Exception as e:
        print(f"⚠️ PostgreSQL connection failed: {e}")
        print("🔄 Falling back to SQLite for development...")
        DATABASE_URL = "sqlite:///./lawlens.db"
        engine = create_engine(DATABASE_URL, echo=True)
else:
    # Use SQLite for local development
    print("📝 Using SQLite for local development")
    DATABASE_URL = "sqlite:///./lawlens.db"
    engine = create_engine(DATABASE_URL, echo=True)

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
    if "sqlite" in str(engine.url):
        return {"type": "SQLite", "file": "lawlens.db", "status": "Local Development"}
    else:
        return {"type": "PostgreSQL", "host": "NeonDB", "status": "Production Ready"}

#!/usr/bin/env python3
"""
Database initialization script for LawLens
Creates all tables and sets up the database schema
"""

try:
    # Try local database first for development
    from db.database_local import engine, create_tables, get_db_info
    from db.models import Base
    print("✅ Using local SQLite database configuration")
except ImportError:
    try:
        from db.database import engine, create_tables
        from db.models import Base
        get_db_info = lambda: {"type": "PostgreSQL", "status": "Connected"}
    except ImportError:
        # Fallback to simple database setup
        from db.database_simple import engine, create_tables, get_db_info
        from db.models import Base
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database with all tables"""
    try:
        logger.info("🔄 Initializing LawLens database...")
        
        # Show database info if available
        try:
            db_info = get_db_info()
            logger.info(f"📊 Database: {db_info['type']} - {db_info['status']}")
        except:
            logger.info("📊 Database: PostgreSQL/SQLite")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Database initialized successfully!")
        logger.info("📊 Tables created:")
        logger.info("  - users")
        logger.info("  - documents") 
        logger.info("  - translations")
        logger.info("  - classifications")
        logger.info("  - payments")
        logger.info("  - api_usage")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n🚀 LawLens database is ready!")
        print("You can now start the FastAPI server with: uvicorn app:app --reload")
    else:
        print("\n💥 Database initialization failed. Please check the logs.")
        exit(1)

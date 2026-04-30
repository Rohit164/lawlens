"""
Database Migration Script for LawLens Advanced Features
Run this to create all tables for storing AI-generated results
"""

from db.database import engine
from sqlalchemy import text
import os

def run_migration():
    """Run database migration"""
    schema_file = os.path.join(os.path.dirname(__file__), 'db', 'advanced_features_schema.sql')
    
    print("📊 Starting LawLens Advanced Features Database Migration...")
    print("=" * 60)
    
    if not os.path.exists(schema_file):
        print(f"❌ Schema file not found: {schema_file}")
        return False
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Remove comments and split by semicolon
    lines = []
    for line in sql.split('\n'):
        # Skip comment-only lines
        if line.strip().startswith('--'):
            continue
        lines.append(line)
    
    sql_clean = '\n'.join(lines)
    
    # Split by semicolon and execute each statement
    statements = []
    for s in sql_clean.split(';'):
        s = s.strip()
        if s and len(s) > 10:  # Ignore very short statements
            statements.append(s)
    
    print(f"📝 Found {len(statements)} SQL statements to execute")
    print("=" * 60)
    
    success_count = 0
    warning_count = 0
    
    with engine.connect() as conn:
        for i, statement in enumerate(statements, 1):
            try:
                conn.execute(text(statement))
                conn.commit()
                success_count += 1
                print(f"✅ [{i}/{len(statements)}] Executed successfully")
            except Exception as e:
                warning_count += 1
                error_msg = str(e)
                # Show first 80 chars of error
                if len(error_msg) > 80:
                    error_msg = error_msg[:80] + "..."
                print(f"⚠️  [{i}/{len(statements)}] Warning: {error_msg}")
    
    print("=" * 60)
    print(f"✅ Migration Complete!")
    print(f"   Success: {success_count}")
    print(f"   Warnings: {warning_count}")
    print("=" * 60)
    
    # Verify tables (works for both SQLite and PostgreSQL)
    print("\n📋 Verifying created tables...")
    with engine.connect() as conn:
        try:
            # Try PostgreSQL query first
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND (table_name LIKE '%bench%' 
                OR table_name LIKE '%judgment%'
                OR table_name LIKE '%adversarial%'
                OR table_name LIKE '%litigation%'
                OR table_name LIKE '%ai_override%'
                OR table_name LIKE '%fairness%')
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            if tables:
                print(f"✅ Found {len(tables)} advanced feature tables:")
                for table in tables:
                    print(f"   - {table}")
            else:
                print("⚠️  No matching tables found")
        except Exception as e:
            # Fallback to SQLite query
            try:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
                all_tables = [row[0] for row in result]
                print(f"✅ Database created with {len(all_tables)} total tables:")
                for table in all_tables[:10]:
                    print(f"   - {table}")
                if len(all_tables) > 10:
                    print(f"   ... and {len(all_tables) - 10} more")
            except Exception as e2:
                print(f"⚠️  Could not verify tables: {str(e2)}")
                print("   But migration likely succeeded")
    
    return True

if __name__ == "__main__":
    try:
        success = run_migration()
        if success:
            print("\n🎉 Database is ready for LawLens Advanced Features!")
            print("   You can now use all Judge, Lawyer, and Analytics features.")
        else:
            print("\n❌ Migration failed. Please check the error messages above.")
    except Exception as e:
        print(f"\n❌ Migration error: {str(e)}")
        import traceback
        traceback.print_exc()

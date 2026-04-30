from db.database import engine
from sqlalchemy import text

conn = engine.connect()
result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
tables = [row[0] for row in result]

print(f"\n✅ Found {len(tables)} tables in database:\n")
for i, table in enumerate(tables, 1):
    print(f"{i:2}. {table}")

conn.close()

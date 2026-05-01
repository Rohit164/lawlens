#!/bin/bash
set -e

echo "==> Python version:"
python --version

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing dependencies (no cache)..."
pip install --no-cache-dir -r requirements_render.txt

echo "==> Initializing database tables..."
python -c "
from db.database import create_tables
create_tables()
print('Tables ready.')
"

echo "==> Build complete."

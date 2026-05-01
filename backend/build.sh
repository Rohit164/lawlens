#!/bin/bash
set -e

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing dependencies..."
pip install --prefer-binary -r requirements_render.txt

echo "==> Initializing database tables..."
python -c "from db.database import create_tables; from db.models import Base; create_tables(); print('Tables ready.')"

echo "==> Build complete."

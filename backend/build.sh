#!/bin/bash
# Render build script
set -e

# Upgrade pip first to get proper wheel support
pip install --upgrade pip

# Install with binary preference
pip install --prefer-binary -r requirements_render.txt

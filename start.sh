#!/bin/bash
# Startup wrapper for Render - install Python dependencies before running Node
set -e

echo "======================================"
echo "ML Service Startup on Render"
echo "======================================"

# Determine the correct path for requirements.txt
if [ -f "ml-service/requirements.txt" ]; then
    REQ_PATH="ml-service/requirements.txt"
elif [ -f "requirements.txt" ]; then
    REQ_PATH="requirements.txt"
    cd ml-service
else
    echo "ERROR: requirements.txt not found!"
    exit 1
fi

echo "Installing Python dependencies from: $REQ_PATH"
python3 --version
pip3 --version

pip3 install --upgrade pip setuptools wheel 2>/dev/null || pip3 install --upgrade pip 2>/dev/null || true
pip3 install -r "$REQ_PATH"

echo "Dependencies installed successfully!"
echo "Starting ML Service on PORT ${PORT:-10000}..."

if [ -d "ml-service" ] && [ $PWD != *"ml-service"* ]; then
    cd ml-service
fi

node server.js

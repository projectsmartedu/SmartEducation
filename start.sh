#!/bin/bash
# Startup wrapper for Render - install Python dependencies before running Node
set -e

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r ml-service/requirements.txt

echo "Starting ML Service..."
cd ml-service
node server.js

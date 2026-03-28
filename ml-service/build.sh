#!/bin/bash
# Build script for Render deployment - install both Node and Python dependencies

set -e

echo "📦 Installing Node.js dependencies..."
npm install
echo "✅ Node.js dependencies installed"

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies installed successfully"

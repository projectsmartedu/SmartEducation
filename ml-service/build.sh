#!/bin/bash
# Build script for Render deployment
# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "Python dependencies installed successfully"

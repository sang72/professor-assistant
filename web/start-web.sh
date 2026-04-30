#!/bin/bash

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "==================================="
echo "  Professor Assistant Web Server"
echo "==================================="
echo ""

# Check if node_modules exists for server
if [ ! -d "$SCRIPT_DIR/web/server/node_modules" ]; then
  echo "[1/4] Installing backend dependencies..."
  cd "$SCRIPT_DIR/web/server"
  npm install
  cd "$SCRIPT_DIR"
fi

# Check if node_modules exists for client
if [ ! -d "$SCRIPT_DIR/web/client/node_modules" ]; then
  echo "[2/4] Installing frontend dependencies..."
  cd "$SCRIPT_DIR/web/client"
  npm install
  cd "$SCRIPT_DIR"
fi

# Build client if dist doesn't exist
if [ ! -d "$SCRIPT_DIR/web/client/dist" ]; then
  echo "[3/4] Building frontend..."
  cd "$SCRIPT_DIR/web/client"
  npm run build
  cd "$SCRIPT_DIR"
fi

echo ""
echo "[4/4] Starting server..."
echo ""
echo "==================================="
echo "  Server is ready!"
echo "  URL: http://localhost:3000"
echo "==================================="
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd "$SCRIPT_DIR/web/server"
node server.js

#!/usr/bin/env bash
# ========================================================
# CrystalSpace Multi-Service Bash Runner
# ========================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
BACKEND_DIR="$DIR/Backend"
FRONTEND_DIR="$DIR/Frontend/web"

echo "========================================================"
echo "             CrystalSpace Ecosystem Runner              "
echo "========================================================"
echo ""

cleanup() {
    echo ""
    echo "Stopping CrystalSpace services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "Services stopped cleanly."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[1/2] Starting Go Backend on http://localhost:8080..."
(cd "$BACKEND_DIR" && go run ./cmd/api) &
BACKEND_PID=$!

echo "[2/2] Starting React Vite Frontend on http://localhost:5173..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " Both services are running in parallel!"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:5173"
echo " Press Ctrl+C to terminate both services."
echo "========================================================"
echo ""

wait

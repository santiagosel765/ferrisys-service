#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BACKEND_DIR="$ROOT_DIR/back-costa"
FRONTEND_DIR="$ROOT_DIR/front-costa"

cleanup_done=0

start_backend() {
  pushd "$BACKEND_DIR" >/dev/null
  ./mvnw spring-boot:run &
  BACKEND_PID=$!
  popd >/dev/null
}

start_frontend() {
  pushd "$FRONTEND_DIR" >/dev/null
  npm ci
  npx ng serve &
  FRONTEND_PID=$!
  popd >/dev/null
}

shutdown() {
  if [[ $cleanup_done -eq 1 ]]; then
    return
  fi
  cleanup_done=1
  echo "\nStopping services..."
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap shutdown EXIT INT TERM

start_backend
start_frontend

echo "Backend (PID: $BACKEND_PID) and frontend (PID: $FRONTEND_PID) are running. Press Ctrl+C to stop."

wait "$BACKEND_PID" "$FRONTEND_PID"

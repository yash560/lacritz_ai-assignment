#!/usr/bin/env bash
# Parakeet AI - Quick Launcher for macOS
set -e

echo "🦜 Starting Parakeet AI Desktop Prototype for macOS..."

# Check Python or Node
if command -v python3 &> /dev/null; then
  echo "✔ Found Python 3. Checking dependencies..."
  if [ -f "desktop_parakeet.py" ]; then
    echo "🚀 Launching Python Native Desktop Copilot..."
    python3 desktop_parakeet.py &
  fi
fi

# Also start web app if npm available
if command -v npm &> /dev/null; then
  echo "✔ Starting Next.js Web Desktop Interface at http://localhost:3000..."
  npm run dev
fi

#!/bin/bash
# Double-click this file to launch the Medical Portal.
# It starts all clinical tools and opens the portal in your browser.

cd "$(dirname "$0")"

# Kill any stale processes from a previous run
for port in 3000 5050; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "  Cleaning up stale process on port $port (PID $pid)..."
    kill -9 $pid 2>/dev/null
    sleep 0.3
  fi
done

# Install portal dependencies (fast if already installed)
pip3 install -r portal/requirements.txt -q

# Install Handoff Tool dependencies
if [ -f "Dr_claude/handoff-tool/requirements.txt" ]; then
  pip3 install -r Dr_claude/handoff-tool/requirements.txt -q
fi

# Build Admissions SPA (Vite → dist/index.html)
if [ -f "Admissions/package.json" ]; then
  echo "  Building Admissions..."
  (cd Admissions && npm run build --silent 2>&1) || echo "  [admissions] Build failed — using last good dist/"
fi

echo ""
echo "  ================================================"
echo "    Medical Portal — Starting all services..."
echo "  ================================================"
echo ""
echo "  Portal:     http://localhost:3000"
echo "  Handoff:    managed (internal)"
echo "  Admissions: static (built-in)"
echo ""
echo "  Press Ctrl+C in this window to stop everything."
echo ""

# Open browser after a short delay
(sleep 2.5 && open http://127.0.0.1:3000) &

# Run the portal (it manages sub-services)
python3 portal/app.py

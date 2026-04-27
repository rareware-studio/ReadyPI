#!/bin/bash

echo "🚀 Starting ReadyPI Local Development Servers..."
echo ""

# Kill any existing processes on ports 8080 and 3001
lsof -n -P -ti:8787,3001 | xargs kill -9 2>/dev/null

echo "✅ Ports cleared"
echo ""

# Start API server in background
echo "🔧 Starting API Server on http://localhost:8787..."
cd /Users/ahmedxriyaz/Desktop/ReadyPI/api
node server.js > logs/readypi-api.log 2>&1 &
API_PID=$!
echo "   PID: $API_PID"

# Wait for API to start
sleep 3

# Check if API is running
if curl -s http://localhost:8787/health > /dev/null; then
  echo "✅ API Server running"
else
  echo "❌ API Server failed to start"
  echo "   Check logs: tail -f logs/readypi-api.log"
fi

echo ""

# Start Dashboard in background
echo "🎨 Starting Dashboard on http://localhost:3001..."
cd /Users/ahmedxriyaz/Desktop/ReadyPI/dashboard
npm run dev > logs/readypi-dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "   PID: $DASHBOARD_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ReadyPI is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Dashboard:  http://localhost:3001"
echo "🔧 API:        http://localhost:8787"
echo "📊 Health:     http://localhost:8787/health"
echo ""
echo "📝 Logs:"
echo "   API:        tail -f logs/readypi-api.log"
echo "   Dashboard:  tail -f logs/readypi-dashboard.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $API_PID $DASHBOARD_PID"
echo ""
echo "⏳ Waiting for dashboard to start (15 seconds)..."

sleep 15

echo ""
echo "✅ Opening browser..."
open http://localhost:3001

echo ""
echo "Press Ctrl+C to view logs, or just visit http://localhost:3001"
echo ""

# Keep script running and show logs
tail -f logs/readypi-dashboard.log

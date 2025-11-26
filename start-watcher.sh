#!/bin/bash

# Start Scraper Job Watcher
# This script starts the job watcher that monitors the dashboard for scraping jobs

clear

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          🤖  SCRAPER JOB WATCHER LAUNCHER  🤖                    ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from the solar-data-extractor directory"
  exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found"
  echo ""
  echo "Running setup script to configure environment..."
  ./setup.sh
  echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

echo "🚀 Starting job watcher..."
echo ""
echo "✅ Watcher is now running!"
echo "💡 Go to the dashboard and click 'Start Scraping'"
echo "🌐 Dashboard: https://eko-lead-dashboard.vercel.app/scraping"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the job watcher
npm run watch

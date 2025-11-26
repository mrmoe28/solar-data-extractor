#!/bin/bash

# Install Auto-Starting Job Watcher
# This script installs the job watcher as a background service that starts on login

clear

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          🔧  AUTO-WATCHER INSTALLER  🔧                          ║"
echo "║          Set up background job watcher service                   ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from the solar-data-extractor directory"
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Running setup first..."
  ./setup.sh
  echo ""
fi

PLIST_FILE="com.eko.scraper-watcher.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
TARGET_PLIST="$LAUNCH_AGENTS_DIR/$PLIST_FILE"

echo "📦 Installing job watcher as background service..."
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$LAUNCH_AGENTS_DIR"

# Stop existing service if running
if launchctl list | grep -q "com.eko.scraper-watcher"; then
  echo "🛑 Stopping existing watcher service..."
  launchctl unload "$TARGET_PLIST" 2>/dev/null
fi

# Copy plist to LaunchAgents
echo "📋 Installing service configuration..."
cp "$PLIST_FILE" "$TARGET_PLIST"

# Load the service
echo "▶️  Starting watcher service..."
launchctl load "$TARGET_PLIST"

# Wait a moment for it to start
sleep 2

# Check if it's running
if launchctl list | grep -q "com.eko.scraper-watcher"; then
  echo ""
  echo "✅ SUCCESS! Job watcher is now running in the background"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📱 What This Means:"
  echo "   • Job watcher starts automatically when you log in"
  echo "   • Runs in the background (no terminal needed)"
  echo "   • Automatically restarts if it crashes"
  echo "   • Monitors dashboard for scraping jobs 24/7"
  echo ""
  echo "🎯 How to Use:"
  echo "   1. Go to: https://eko-lead-dashboard.vercel.app/scraping"
  echo "   2. Enter a location (e.g., Georgia)"
  echo "   3. Click 'Start Scraping'"
  echo "   4. Watch real-time progress!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📋 Useful Commands:"
  echo "   • Check status: launchctl list | grep scraper-watcher"
  echo "   • View logs: tail -f watcher.log"
  echo "   • Stop service: launchctl unload ~/Library/LaunchAgents/$PLIST_FILE"
  echo "   • Start service: launchctl load ~/Library/LaunchAgents/$PLIST_FILE"
  echo ""
else
  echo ""
  echo "❌ Service failed to start. Check the error log:"
  echo "   cat watcher-error.log"
  echo ""
  exit 1
fi

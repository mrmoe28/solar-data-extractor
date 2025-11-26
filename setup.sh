#!/bin/bash

# Eko Lead Scraper - Automated Setup Script
# This script automatically configures your scraper with the dashboard

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          🔆  EKO LEAD SCRAPER - AUTO SETUP  🔆                  ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create .env file with correct configuration
echo "⚙️  Configuring environment variables..."

cat > .env << 'EOF'
# Eko Lead Dashboard Integration
# Auto-configured by setup.sh

# Production Dashboard URL
DASHBOARD_API_URL=https://eko-lead-dashboard.vercel.app

# Local development URL (uncomment to test locally)
# DASHBOARD_API_URL=http://localhost:3000

# API Key for authentication
SCRAPER_API_KEY=eko-scraper-secret-2024
EOF

echo "✅ Configuration file created: .env"
echo ""

# Verify configuration
echo "📋 Configuration Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dashboard URL: https://eko-lead-dashboard.vercel.app"
echo "API Key:       eko-scraper-secret-2024"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Playwright browsers are installed
echo "🌐 Checking Playwright browsers..."
if [ ! -d "$HOME/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "📥 Installing Playwright browsers (this may take a few minutes)..."
    npx playwright install chromium
    echo ""
fi

echo "✅ Playwright browsers ready"
echo ""

# Run a test to verify connection
echo "🔍 Testing connection to dashboard..."
node -e "
const fetch = require('node:fetch');
const apiUrl = 'https://eko-lead-dashboard.vercel.app/api/scraping/sessions';

fetch(apiUrl)
  .then(res => {
    if (res.ok) {
      console.log('✅ Dashboard connection successful!');
    } else {
      console.log('⚠️  Dashboard responded but may have issues');
    }
  })
  .catch(err => {
    console.log('⚠️  Could not connect to dashboard (check internet connection)');
  });
" 2>/dev/null || echo "⚠️  Connection test skipped (fetch not available)"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅  SETUP COMPLETE!                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Ready to scrape! Run one of these commands:"
echo ""
echo "   node scrape-leads.js Georgia"
echo "   node scrape-leads.js Florida"
echo "   node scrape-leads.js \"New York\""
echo ""
echo "📊 Watch live updates at:"
echo "   https://eko-lead-dashboard.vercel.app/scraping"
echo ""
echo "⚙️  Settings and API key:"
echo "   https://eko-lead-dashboard.vercel.app/settings"
echo ""

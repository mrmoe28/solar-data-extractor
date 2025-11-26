#!/bin/bash

# Simple Daily Lead Scraper
# Run this every morning to get fresh leads

clear

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          🔆  SOLAR LEAD SCRAPER  🔆                              ║"
echo "║          Get Real Leads from Reddit & Facebook                   ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Get location
echo "📍 Enter location (default: Georgia):"
read -p "> " LOCATION
LOCATION=${LOCATION:-Georgia}

echo ""
echo "Do you want to scrape Facebook? (requires manual login)"
echo "  y = Yes (will open browser for you to login)"
echo "  n = No (Reddit only, faster, no login needed)"
read -p "> " FB_CHOICE

echo ""
echo "Starting lead scraper for $LOCATION..."
echo ""

# Build command
CMD="node scrape-leads.js \"$LOCATION\""

if [[ "$FB_CHOICE" == "y" || "$FB_CHOICE" == "Y" ]]; then
  CMD="$CMD --facebook"
fi

# Run scraper
eval $CMD

echo ""
echo "✅ Done! Check the output/ folder for your leads."
echo ""

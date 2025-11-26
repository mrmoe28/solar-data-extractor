#!/bin/bash

# Quick Scrape - Just scrape and show results
# Use this for testing the scraper without Google Sheets/SMS setup

PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🔆 Quick Solar Lead Scraper 🔆                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

# Run scraper
echo "🔍 Scraping solar leads in Georgia..."
echo ""
node scrape-leads.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest CSV
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/georgia-solar-leads-*.csv 2>/dev/null | head -1)

if [ -f "$LATEST_CSV" ]; then
    LEAD_COUNT=$(tail -n +2 "$LATEST_CSV" | wc -l | tr -d ' ')
    HOT_COUNT=$(awk -F',' '$1 ~ /Hot/ || ($2 ~ /^[0-9]+$/ && $2 >= 70)' "$LATEST_CSV" | tail -n +2 | wc -l | tr -d ' ')

    echo "📊 Results:"
    echo "   • Total leads: $LEAD_COUNT"
    echo "   • Hot leads: $HOT_COUNT"
    echo "   • File: $(basename "$LATEST_CSV")"
    echo ""
    echo "📁 Open file:"
    echo "   open \"$LATEST_CSV\""
    echo ""

    # Option to enrich leads
    echo "🤖 Next: Enrich these leads with AI?"
    echo "   • Free (local): node test-local-enrichment.js"
    echo "   • Fast (cloud): node test-enrichment.js"
    echo ""
else
    echo "⚠️  No CSV file found"
fi

echo "════════════════════════════════════════════════════════════"
echo ""

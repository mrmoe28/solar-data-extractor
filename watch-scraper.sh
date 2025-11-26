#!/bin/bash

# Live Scraper Progress Monitor
# Shows real-time scraping progress

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       📊 Live Scraper Monitor 📊                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if scraper is running
SCRAPER_PID=$(ps aux | grep "scrape-leads.js" | grep -v grep | head -1 | awk '{print $2}')

if [ -z "$SCRAPER_PID" ]; then
    echo "❌ No scraper currently running"
    echo ""
    echo "Start one with:"
    echo "   ./automated-lead-workflow.sh"
    echo "   OR"
    echo "   node scrape-leads.js \"Atlanta\""
    exit 1
fi

echo "✅ Scraper is running (PID: $SCRAPER_PID)"
echo ""
echo "📊 Latest output (refreshes every 2 seconds)"
echo "   Press Ctrl+C to exit"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Monitor the latest CSV and report files
OUTPUT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor/output"
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/*.csv 2>/dev/null | head -1)
LATEST_REPORT=$(ls -t "$OUTPUT_DIR"/DAILY-LEAD-REPORT-*.md 2>/dev/null | head -1)

# Show progress every 2 seconds
while kill -0 $SCRAPER_PID 2>/dev/null; do
    clear
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║       📊 Live Scraper Monitor 📊                         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Scraper running (PID: $SCRAPER_PID)"
    echo "⏱️  Running time: $(ps -p $SCRAPER_PID -o etime= | tr -d ' ')"
    echo ""

    if [ -f "$LATEST_CSV" ]; then
        LEAD_COUNT=$(tail -n +2 "$LATEST_CSV" 2>/dev/null | wc -l | tr -d ' ')
        echo "📊 Leads found so far: $LEAD_COUNT"
        echo "📁 CSV: $(basename "$LATEST_CSV")"
    else
        echo "📊 Leads found so far: (generating...)"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 Press Ctrl+C to stop monitoring (scraper continues)"
    echo ""

    sleep 2
done

echo ""
echo "✅ Scraper completed!"
echo ""

if [ -f "$LATEST_CSV" ]; then
    FINAL_COUNT=$(tail -n +2 "$LATEST_CSV" 2>/dev/null | wc -l | tr -d ' ')
    echo "📊 Final Results:"
    echo "   • Total leads: $FINAL_COUNT"
    echo "   • CSV: $LATEST_CSV"

    if [ -f "$LATEST_REPORT" ]; then
        echo "   • Report: $LATEST_REPORT"
    fi
fi

echo ""

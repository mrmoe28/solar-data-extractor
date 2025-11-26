#!/bin/bash

# Automated Lead Workflow
# Complete automation: Scrape → Google Sheets → Text Notifications
# Phone: 404-551-6532

PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"
PHONE_NUMBER="404-551-6532"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Automated Solar Lead Workflow                          ║"
echo "║        Scrape → Sheets → Text Notifications                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Text notifications: $PHONE_NUMBER"
echo ""

cd "$PROJECT_DIR"

# Step 1: Generate Leads
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 1: Generating Solar Leads"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if scraper exists
if [ ! -f "$PROJECT_DIR/scrape-leads.js" ]; then
    echo "❌ Scraper not found: scrape-leads.js"
    echo "   Please ensure the scraper is in: $PROJECT_DIR"
    exit 1
fi

# Run the scraper
echo "🔍 Searching for solar leads in Georgia..."
echo ""

node scrape-leads.js

SCRAPER_EXIT=$?

if [ $SCRAPER_EXIT -ne 0 ]; then
    echo ""
    echo "❌ Scraper failed with exit code: $SCRAPER_EXIT"
    exit 1
fi

echo ""
echo "✅ Lead generation complete!"
echo ""

# Step 2: Get latest CSV file
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/georgia-solar-leads-*.csv 2>/dev/null | head -1)

if [ -z "$LATEST_CSV" ] || [ ! -f "$LATEST_CSV" ]; then
    echo "❌ No CSV file generated. Cannot proceed."
    exit 1
fi

LEAD_COUNT=$(tail -n +2 "$LATEST_CSV" | wc -l | tr -d ' ')

echo "📄 Generated file: $(basename "$LATEST_CSV")"
echo "📊 Total leads: $LEAD_COUNT"
echo ""

if [ "$LEAD_COUNT" -eq 0 ]; then
    echo "ℹ️  No leads found. Nothing to sync."
    exit 0
fi

# Step 3: Push to Google Sheets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 2: Syncing to Google Sheets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Google Sheets is set up
if [ ! -f "$PROJECT_DIR/config/google-sheets-token.json" ]; then
    echo "⚠️  Google Sheets not configured yet!"
    echo ""
    echo "Run setup first:"
    echo "   ./setup-google-sheets-api.sh"
    echo ""
    echo "Skipping Google Sheets sync..."
    SHEETS_SYNCED=false
else
    # Sync to Google Sheets and capture output
    SHEETS_OUTPUT=$(node google-sheets-integration.js "$LATEST_CSV" 2>&1)
    SHEETS_EXIT=$?

    echo "$SHEETS_OUTPUT"

    if [ $SHEETS_EXIT -eq 0 ]; then
        echo ""
        echo "✅ Google Sheets sync complete!"
        SHEETS_SYNCED=true

        # Extract spreadsheet URL from output
        SHEET_URL=$(echo "$SHEETS_OUTPUT" | grep -o 'https://docs.google.com/spreadsheets/d/[^/]*/edit' | head -1)
    else
        echo ""
        echo "⚠️  Google Sheets sync failed (continuing anyway...)"
        SHEETS_SYNCED=false
        SHEET_URL=""
    fi
fi

echo ""

# Step 4: Send Text Notifications
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 STEP 3: Sending Text Notifications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count Hot leads
HOT_COUNT=$(awk -F',' '$1 ~ /Hot/ || ($2 ~ /^[0-9]+$/ && $2 >= 70)' "$LATEST_CSV" | tail -n +2 | wc -l | tr -d ' ')

echo "🔥 Hot leads detected: $HOT_COUNT"
echo ""

if [ "$HOT_COUNT" -gt 0 ]; then
    echo "📤 Sending text notifications to: $PHONE_NUMBER"
    echo ""

    # Run text notification script
    if [ -f "$PROJECT_DIR/send-text-notification.sh" ]; then
        bash "$PROJECT_DIR/send-text-notification.sh"

        echo ""
        echo "✅ Text notifications sent!"
    else
        echo "⚠️  Text notification script not found"
        echo "   Expected: $PROJECT_DIR/send-text-notification.sh"
    fi
else
    echo "ℹ️  No Hot leads to notify about"
fi

echo ""

# Step 5: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ WORKFLOW COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   • Total leads generated: $LEAD_COUNT"
echo "   • Hot leads: $HOT_COUNT"
echo "   • Google Sheets synced: $([ "$SHEETS_SYNCED" = true ] && echo "✅ Yes" || echo "⚠️  Not configured")"
echo "   • Text notifications sent: $([ "$HOT_COUNT" -gt 0 ] && echo "✅ Yes ($HOT_COUNT)" || echo "None needed")"
echo ""

if [ "$SHEETS_SYNCED" = true ]; then
    echo "🔗 View your leads:"
    if [ -n "$SHEET_URL" ]; then
        echo "   • Google Sheets: $SHEET_URL"
    else
        echo "   • Google Sheets: https://docs.google.com/spreadsheets/"
    fi
    echo "   • Local CSV: $LATEST_CSV"
else
    echo "📁 Local CSV: $LATEST_CSV"
    echo ""
    echo "💡 Set up Google Sheets for automatic cloud sync:"
    echo "   ./setup-google-sheets-api.sh"
fi

echo ""
echo "📱 Check your phone ($PHONE_NUMBER) for Hot lead alerts!"
echo ""

# Auto-open Google Sheets in browser
if [ "$SHEETS_SYNCED" = true ]; then
    echo "🌐 Opening Google Sheets in browser..."
    sleep 1

    if [ -n "$SHEET_URL" ]; then
        open "$SHEET_URL"
        echo "✅ Google Sheets opened!"
    else
        open "https://docs.google.com/spreadsheets/"
        echo "✅ Google Sheets opened (find 'Eko Solar Leads')"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

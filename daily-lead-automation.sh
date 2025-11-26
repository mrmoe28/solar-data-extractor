#!/bin/bash

# Daily Solar Lead Automation for EkoSolarPros
# Runs automatically every day at 8 AM
# Finds Georgia solar leads and auto-submits Hot ones to your form

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
LOG_FILE="$HOME/Desktop/ekoleadgenerator/solar-data-extractor/output/daily-log-$TIMESTAMP.txt"
OUTPUT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor/output"

mkdir -p "$OUTPUT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗" | tee -a "$LOG_FILE"
echo "║  Daily Solar Lead Automation - $(date)                    ║" | tee -a "$LOG_FILE"
echo "╚════════════════════════════════════════════════════════════════╝" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "🔍 Starting lead search for Georgia..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# This script will be called by Claude Code daily
# It triggers Claude to perform the following automation:

cat << 'AUTOMATION_PROMPT' > /tmp/daily-automation-prompt.txt
Daily Solar Lead Automation Request:

TASK: Find solar installation and troubleshooting leads in Georgia

SEARCH THESE PLATFORMS:
1. Reddit (r/Georgia, r/Atlanta, r/solar, r/homeimprovement)
   - Search: "solar installation Georgia"
   - Search: "solar quote Atlanta"
   - Search: "solar panels not working Georgia"

2. Facebook (if accessible)
   - Georgia Solar Groups
   - Atlanta Homeowners
   - Local neighborhood groups

3. Google search for recent posts
   - "solar installation quote Georgia" site:reddit.com
   - "need solar installer Atlanta"
   - "solar repair Georgia"

LEAD CRITERIA:
- Posted within last 24 hours
- Located in Georgia (Atlanta, Marietta, Roswell, etc.)
- Mentions: installation, quote, repair, troubleshooting, broken, not working

AUTO-SUBMIT CRITERIA:
- Score 40+ (Hot or Warm leads)
- Clear intent (needs quote, repair, etc.)
- Georgia location confirmed

FORM TO SUBMIT:
Website: https://www.ekosolarpros.com
Form fields:
- Name (from post/profile)
- Email (placeholder if not available)
- Phone (if mentioned)
- Address (city/area mentioned)
- Message (include original request + metadata)

OUTPUT:
- Save all leads to: $OUTPUT_DIR/leads-$TIMESTAMP.csv
- Save submitted leads to: $OUTPUT_DIR/submitted-$TIMESTAMP.csv
- Generate summary report
- Send text notifications for Hot leads to: 404-551-6532

NOTIFICATIONS:
After lead generation completes:
1. Run: ./send-text-notification.sh (opens Messages with Hot lead alerts)
2. Run: ./send-email-notification.sh (optional backup notification)

Please execute this automation now.
AUTOMATION_PROMPT

echo "✅ Automation prompt generated" | tee -a "$LOG_FILE"
echo "📍 Output will be saved to: $OUTPUT_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "🤖 Waiting for Claude Code to process..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "NOTE: This script coordinates with Claude Code to:" | tee -a "$LOG_FILE"
echo "  1. Search all platforms for Georgia solar leads" | tee -a "$LOG_FILE"
echo "  2. Extract and score each lead" | tee -a "$LOG_FILE"
echo "  3. Auto-submit qualified leads to your form" | tee -a "$LOG_FILE"
echo "  4. Send text alerts for Hot leads to 404-551-6532" | tee -a "$LOG_FILE"
echo "  5. Email you a daily summary (optional)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Display the prompt for Claude
echo "AUTOMATION PROMPT FOR CLAUDE:" | tee -a "$LOG_FILE"
cat /tmp/daily-automation-prompt.txt | tee -a "$LOG_FILE"

exit 0

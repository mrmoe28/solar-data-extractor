#!/bin/bash

# Setup Daily Automation for Solar Lead Generation
# Runs every morning at 8 AM

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Daily Automation Setup                                 ║"
echo "║        Solar Lead Generation System                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create cron job entry
CRON_JOB="0 8 * * * cd $HOME/solar-data-extractor && ./daily-lead-automation.sh"

echo "This will add a cron job to run lead generation daily at 8 AM."
echo ""
echo "The automation will:"
echo "  ✅ Search all platforms for Georgia solar leads"
echo "  ✅ Extract and score leads automatically"
echo "  ✅ Auto-submit Hot & Warm leads to your form"
echo "  ✅ Generate daily report"
echo "  ✅ Save all data to CSV files"
echo ""
echo "Cron job to be added:"
echo "  $CRON_JOB"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "daily-lead-automation.sh"; then
    echo "⚠️  Daily automation is already set up!"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "daily-lead-automation"
    echo ""
    echo "To modify, run: crontab -e"
    exit 0
fi

# Ask for confirmation
read -p "Do you want to set up daily automation? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo ""
    echo "Setup cancelled."
    echo ""
    echo "To set up later, run:"
    echo "  ./setup-daily-automation.sh"
    echo ""
    echo "Or manually add to crontab:"
    echo "  crontab -e"
    echo "  Add: $CRON_JOB"
    exit 0
fi

# Add cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo "✅ Daily automation setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📅 Schedule: Every day at 8:00 AM"
echo "📁 Output:   ~/solar-data-extractor/output/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view your cron jobs:"
echo "  crontab -l"
echo ""
echo "To edit your cron jobs:"
echo "  crontab -e"
echo ""
echo "To remove this automation:"
echo "  crontab -e"
echo "  (delete the line with 'daily-lead-automation.sh')"
echo ""
echo "🎯 Tomorrow at 8 AM, your first automated lead search will run!"
echo ""

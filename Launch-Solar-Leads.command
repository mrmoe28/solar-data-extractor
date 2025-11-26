#!/bin/bash

# Solar Lead Generator Launcher
# Double-click this file to open Claude Code in the solar-data-extractor directory

# Clear screen
clear

# Print banner
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        ☀️  Solar Lead Generation System                       ║"
echo "║        EkoSolarPros Lead Automation                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Starting Claude Code in solar-data-extractor directory..."
echo ""

# Change to project directory
cd ~/solar-data-extractor

# Check if directory exists
if [ ! -d "$(pwd)" ]; then
    echo "Error: solar-data-extractor directory not found!"
    echo "Expected location: ~/solar-data-extractor"
    exit 1
fi

echo "✅ Directory: $(pwd)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Quick Commands:"
echo ""
echo "  \"Find solar leads in Georgia and submit to my form\""
echo "  \"Show me today's lead report\""
echo "  \"Run daily automation\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Launch Claude Code
exec claude

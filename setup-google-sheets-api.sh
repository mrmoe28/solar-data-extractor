#!/bin/bash

# Google Sheets API Setup Script
# One-time setup to enable automatic Google Sheets sync

PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
CONFIG_DIR="$PROJECT_DIR/config"
CREDENTIALS_FILE="$CONFIG_DIR/google-sheets-credentials.json"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Google Sheets API Setup - Eko Solar Leads                  ║"
echo "║   One-time setup (takes ~3 minutes)                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create config directory if needed
mkdir -p "$CONFIG_DIR"

echo "📋 Step 1: Enable Google Sheets API"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/dashboard"
echo ""
echo "2. Click: 'Create Project' (top bar)"
echo "   - Name: Eko Solar Leads"
echo "   - Click: 'Create'"
echo ""
echo "3. Click: '+ ENABLE APIS AND SERVICES' (blue button)"
echo ""
echo "4. Search: 'Google Sheets API'"
echo "   - Click on it"
echo "   - Click: 'Enable'"
echo ""
echo "5. Also enable: 'Google Drive API'"
echo "   - Go back and search for it"
echo "   - Click: 'Enable'"
echo ""
read -p "Press Enter when you've enabled both APIs..."
echo ""

echo "🔑 Step 2: Create OAuth Credentials"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "1. In Google Cloud Console, click: 'Credentials' (left sidebar)"
echo ""
echo "2. Click: 'Configure Consent Screen'"
echo "   - User Type: External"
echo "   - Click: 'Create'"
echo ""
echo "3. Fill in OAuth consent screen:"
echo "   - App name: Eko Solar Leads"
echo "   - User support email: YOUR EMAIL"
echo "   - Developer contact: YOUR EMAIL"
echo "   - Click: 'Save and Continue'"
echo "   - Scopes: Click 'Save and Continue' (skip)"
echo "   - Test users: Click 'Save and Continue' (skip)"
echo "   - Click: 'Back to Dashboard'"
echo ""
echo "4. Go back to 'Credentials' tab"
echo ""
echo "5. Click: '+ CREATE CREDENTIALS' → 'OAuth client ID'"
echo "   - Application type: Desktop app"
echo "   - Name: Eko Solar Leads Desktop"
echo "   - Click: 'Create'"
echo ""
echo "6. Click: 'Download JSON' (download icon)"
echo "   - Save as: google-sheets-credentials.json"
echo ""
read -p "Press Enter when you've downloaded the JSON file..."
echo ""

echo "📁 Step 3: Install Credentials"
echo "────────────────────────────────────────────────────────────────"
echo ""

# Check if file was downloaded
DOWNLOADS_DIR="$HOME/Downloads"
POSSIBLE_CREDS=$(ls -t "$DOWNLOADS_DIR"/client_secret*.json 2>/dev/null | head -1)

if [ -f "$POSSIBLE_CREDS" ]; then
    echo "✅ Found credentials file in Downloads!"
    echo ""
    read -p "Move $POSSIBLE_CREDS to config? (yes/no): " move_confirm

    if [ "$move_confirm" = "yes" ]; then
        cp "$POSSIBLE_CREDS" "$CREDENTIALS_FILE"
        echo "✅ Credentials installed!"
    else
        echo ""
        echo "Please manually copy your credentials file:"
        echo "  cp ~/Downloads/client_secret*.json $CREDENTIALS_FILE"
        echo ""
        read -p "Press Enter when done..."
    fi
else
    echo "Please copy your downloaded credentials file:"
    echo ""
    echo "  cp ~/Downloads/client_secret*.json $CREDENTIALS_FILE"
    echo ""
    read -p "Press Enter when done..."
fi
echo ""

# Verify credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "❌ Credentials file not found!"
    echo "   Expected location: $CREDENTIALS_FILE"
    echo ""
    echo "Please copy your downloaded JSON file to this location and run setup again."
    exit 1
fi

echo "✅ Credentials file installed!"
echo ""

echo "📦 Step 4: Install Dependencies"
echo "────────────────────────────────────────────────────────────────"
echo ""

cd "$PROJECT_DIR"

# Check if package.json has googleapis
if ! grep -q "googleapis" package.json 2>/dev/null; then
    echo "Installing Google APIs library..."
    npm install googleapis
    echo ""
fi

echo "✅ Dependencies installed!"
echo ""

echo "🔐 Step 5: Authorize Application"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Now we'll authorize the app to access your Google Sheets."
echo "This opens a browser window for you to log in."
echo ""
read -p "Press Enter to continue..."
echo ""

# Run the setup
node google-sheets-integration.js setup

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 ✅ SETUP COMPLETE!                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Your Google Sheets integration is ready!"
echo ""
echo "📊 Test it now:"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "   ./automated-lead-workflow.sh"
echo ""
echo "This will:"
echo "   ✅ Scrape solar leads"
echo "   ✅ Auto-push to Google Sheets"
echo "   ✅ Send text notifications to 404-551-6532"
echo ""
echo "Your Google Sheet will be created automatically!"
echo ""

#!/bin/bash

# Sync Solar Leads to Google Sheets
# Automatically uploads CSV leads to Google Sheets

SHEET_NAME="Eko Solar Leads"
PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Google Sheets Sync - Eko Solar Leads                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to get latest CSV file
get_latest_csv() {
    local csv_type="$1"
    local latest_file=$(ls -t "$OUTPUT_DIR"/${csv_type}-*.csv 2>/dev/null | head -1)
    echo "$latest_file"
}

# Get latest files
LATEST_ALL_LEADS=$(get_latest_csv "demo-georgia-leads")
LATEST_QUALIFIED=$(get_latest_csv "qualified-leads-for-submission")

echo "📊 Latest Lead Files:"
echo "   All Leads: $(basename "$LATEST_ALL_LEADS")"
echo "   Qualified: $(basename "$LATEST_QUALIFIED")"
echo ""

# Check if files exist
if [ ! -f "$LATEST_ALL_LEADS" ]; then
    echo "❌ No lead files found in output directory"
    echo "   Run lead generation first!"
    exit 1
fi

echo "🔄 Sync Options:"
echo ""
echo "1. Manual Import to Google Sheets"
echo "   - Open Google Sheets"
echo "   - File → Import → Upload"
echo "   - Select: $LATEST_QUALIFIED"
echo ""
echo "2. Use Google Drive File Stream (Recommended)"
echo "   - Install Google Drive for Desktop"
echo "   - Move CSV to: ~/Google Drive/Eko Solar Leads/"
echo "   - Auto-syncs to Google Sheets"
echo ""
echo "3. Use clasp (Google Apps Script CLI)"
echo "   - Install: npm install -g @google/clasp"
echo "   - Automate uploads via Apps Script"
echo ""

# Option to copy to Google Drive if it exists
if [ -d "$HOME/Google Drive/My Drive" ]; then
    GDRIVE_DIR="$HOME/Google Drive/My Drive/Eko Solar Leads"
    mkdir -p "$GDRIVE_DIR"

    echo "📁 Google Drive detected!"
    echo ""
    read -p "Copy latest leads to Google Drive? (yes/no): " copy_confirm

    if [ "$copy_confirm" = "yes" ]; then
        cp "$LATEST_ALL_LEADS" "$GDRIVE_DIR/"
        cp "$LATEST_QUALIFIED" "$GDRIVE_DIR/"

        echo ""
        echo "✅ Files copied to: $GDRIVE_DIR"
        echo ""
        echo "Next steps:"
        echo "1. Open Google Sheets"
        echo "2. File → Import"
        echo "3. Select 'Google Drive' tab"
        echo "4. Navigate to 'Eko Solar Leads' folder"
        echo "5. Select your CSV and import!"
        echo ""
    fi
else
    echo "💡 Tip: Install Google Drive for Desktop for automatic sync"
    echo "   Download: https://www.google.com/drive/download/"
    echo ""
fi

# Create a quick import guide
cat > "$OUTPUT_DIR/GOOGLE-SHEETS-IMPORT-GUIDE.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
  Quick Guide: Import Leads to Google Sheets
═══════════════════════════════════════════════════════════════

METHOD 1: Manual Upload (2 minutes)
──────────────────────────────────────
1. Go to: https://sheets.google.com
2. Click: "+ Blank" to create new sheet
3. Rename to: "Eko Solar Leads"
4. File → Import → Upload
5. Click "Browse" and select your CSV file
6. Import location: "Replace spreadsheet"
7. Click "Import data"

Done! Your leads are now in Google Sheets.

METHOD 2: Google Drive Auto-Sync (One-time setup)
──────────────────────────────────────────────────
1. Install Google Drive for Desktop:
   https://www.google.com/drive/download/

2. Move this folder to Google Drive:
   ~/Desktop/ekoleadgenerator/

3. All output CSVs will auto-sync to Google Drive!

4. In Google Sheets:
   File → Import → Google Drive
   Select your CSV → Import

METHOD 3: Direct Link (Automated)
───────────────────────────────────
Coming soon: Automated Google Sheets API integration

═══════════════════════════════════════════════════════════════

Your latest CSV files are in:
~/Desktop/ekoleadgenerator/solar-data-extractor/output/

Files to import:
- qualified-leads-for-submission-YYYY-MM-DD.csv (RECOMMENDED)
- demo-georgia-leads-YYYY-MM-DD.csv (All leads)

═══════════════════════════════════════════════════════════════
EOF

echo "📄 Import guide created: $OUTPUT_DIR/GOOGLE-SHEETS-IMPORT-GUIDE.txt"
echo ""
echo "✅ Ready to import to Google Sheets!"
echo ""

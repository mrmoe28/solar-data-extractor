#!/bin/bash

# Solar Business Lead Extractor CLI
# Usage: ./extract-leads.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Solar Business Lead Generator - CLI                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This tool works WITH Claude Code to extract solar business leads."
echo ""
echo "QUICK START:"
echo "------------"
echo "Tell Claude:"
echo "  'Extract solar installers from Google Maps in [your city]'"
echo ""
echo "Claude will automatically:"
echo "  1. Open Google Maps in browser"
echo "  2. Search for solar businesses"
echo "  3. Extract: Name, Address, Phone, Website"
echo "  4. Visit websites to find emails"
echo "  5. Save everything to CSV"
echo ""
echo "EXAMPLE COMMANDS FOR CLAUDE:"
echo "----------------------------"
echo "• 'Find 50 solar installers in California'"
echo "• 'Extract solar companies from Yellow Pages in Texas'"
echo "• 'Get solar equipment distributors from LinkedIn'"
echo "• 'Find residential solar installers in Miami and extract emails'"
echo ""
echo "OUTPUT LOCATION:"
echo "---------------"
echo "📁 ~/solar-data-extractor/output/solar-leads-YYYY-MM-DD.csv"
echo ""
echo "READY! Just tell Claude what you want to extract."
echo ""

# Show available scraper scripts
echo "Available Extractor Scripts:"
echo "  📍 Google Maps: business_leads.js"
echo "  📍 Yellow Pages: business_leads.js"
echo "  📍 LinkedIn: business_leads.js"
echo "  📧 Email Finder: business_leads.js"
echo ""

# Run the node script to show full usage
node "$(dirname "$0")/scrapers/business_leads.js"

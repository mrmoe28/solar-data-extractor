#!/bin/bash

# Solar Data Extractor - Master Control Script
# Complete automation for solar business growth

clear
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          🔆  SOLAR DATA EXTRACTOR  🔆                            ║"
echo "║          Automated Lead Generation System                        ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "What would you like to extract today?"
echo ""
echo "1️⃣  CUSTOMER LEADS (People looking for solar services) ⭐ RECOMMENDED"
echo "   → Find homeowners requesting quotes"
echo "   → Troubleshooting service calls"
echo "   → Installation inquiries"
echo ""
echo "2️⃣  BUSINESS LEADS (Solar companies & installers)"
echo "   → Competitors in your area"
echo "   → Potential partners"
echo "   → Equipment suppliers"
echo ""
echo "3️⃣  PRODUCT DATA (Solar panels, inverters, batteries)"
echo "   → Price comparisons"
echo "   → Product specs"
echo "   → Find best deals"
echo ""
echo "4️⃣  CUSTOM WORKFLOW"
echo "   → Tell Claude what you need"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 YOUR LOCATION: (e.g., Miami FL, Los Angeles CA, Texas)"
read -p "Enter location: " LOCATION
echo ""

read -p "Select option (1-4): " OPTION
echo ""

case $OPTION in
  1)
    echo "🔥 CUSTOMER LEAD GENERATION ACTIVATED"
    echo ""
    echo "What type of leads do you want?"
    echo "  a) Installation leads (new customers)"
    echo "  b) Troubleshooting leads (service calls)"
    echo "  c) Maintenance leads"
    echo "  d) ALL types"
    echo ""
    read -p "Select (a-d): " LEAD_TYPE

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🤖 READY TO SEARCH!"
    echo ""
    echo "Tell Claude:"
    echo "  \"Find solar $LEAD_TYPE leads in $LOCATION\""
    echo ""
    echo "Claude will search:"
    echo "  ✅ Facebook Groups (local homeowners)"
    echo "  ✅ Nextdoor (neighborhood requests)"
    echo "  ✅ Reddit (solar discussions)"
    echo "  ✅ HomeAdvisor (active quote requests)"
    echo "  ✅ Thumbtack (service requests)"
    echo "  ✅ Yelp (people asking questions)"
    echo "  ✅ Twitter/X (real-time inquiries)"
    echo ""
    echo "Results will be:"
    echo "  📊 Scored (Hot/Warm/Cold)"
    echo "  📍 Location-filtered"
    echo "  💾 Saved to CSV"
    echo "  🔗 Include contact info"
    echo ""
    node "$(dirname "$0")/scrapers/customer_leads.js"
    ;;

  2)
    echo "🏢 BUSINESS LEAD GENERATION ACTIVATED"
    echo ""
    echo "Tell Claude:"
    echo "  \"Extract solar businesses in $LOCATION\""
    echo ""
    node "$(dirname "$0")/scrapers/business_leads.js"
    ;;

  3)
    echo "📦 PRODUCT DATA EXTRACTION ACTIVATED"
    echo ""
    echo "Tell Claude:"
    echo "  \"Extract solar panels from Amazon\""
    echo "  \"Compare prices for 400W panels\""
    echo ""
    node "$(dirname "$0")/scrapers/product_scraper.js"
    ;;

  4)
    echo "🎯 CUSTOM WORKFLOW"
    echo ""
    echo "Examples:"
    echo "  • \"Find solar installers AND customers in Miami\""
    echo "  • \"Extract products AND compare with local business prices\""
    echo "  • \"Monitor competitor prices daily\""
    echo ""
    echo "Just tell Claude what you need!"
    ;;

  *)
    echo "Invalid option. Please run again and select 1-4."
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Output will be saved to: ~/solar-data-extractor/output/"
echo ""
echo "Need help? Just ask Claude!"
echo ""

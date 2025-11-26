#!/bin/bash

# Send Text Message Notifications for Hot Solar Leads
# Sends instant SMS/iMessage alerts via Messages app
# Phone: 404-551-6532

PHONE_NUMBER="404-551-6532"
PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"

# Function to open Messages app with pre-filled message
send_text_message() {
    local recipient="$1"
    local message="$2"

    # Remove dashes and spaces from phone number for URL
    local phone_clean=$(echo "$recipient" | tr -d ' -()' )

    # URL encode the message
    local encoded_message=$(echo "$message" | sed 's/ /%20/g' | sed 's/!/%21/g' | sed 's/\n/%0A/g')

    # Open Messages app with pre-filled text (user clicks Send)
    open "sms:${phone_clean}&body=${encoded_message}"

    # Wait a moment for Messages to open
    sleep 2
}

# Function to create short text alert for Hot lead
create_lead_text() {
    local lead_name="$1"
    local lead_location="$2"
    local lead_phone="$3"
    local lead_score="$4"
    local lead_source="$5"

    # Keep it short for text message
    cat << EOF
🔥 HOT SOLAR LEAD!

$lead_name - $lead_location
Score: $lead_score
Source: $lead_source

📞 $lead_phone

⚡ CALL NOW for best conversion!
Auto-submitted to EkoSolarPros.com
EOF
}

# Function to process CSV and send texts for Hot leads
notify_hot_leads_via_text() {
    local csv_file="$1"

    if [ ! -f "$csv_file" ]; then
        echo "❌ CSV file not found: $csv_file"
        return 1
    fi

    echo "📱 Checking for Hot leads to text..."
    echo ""

    local hot_count=0
    local sent_count=0

    # Read CSV and find Hot leads (skip header)
    while IFS=',' read -r source name location message phone email profile post timestamp priority score intent; do
        # Remove quotes from fields
        priority=$(echo "$priority" | tr -d '"')
        score=$(echo "$score" | tr -d '"')
        name=$(echo "$name" | tr -d '"')
        location=$(echo "$location" | tr -d '"')
        phone=$(echo "$phone" | tr -d '"')
        source=$(echo "$source" | tr -d '"')

        # Check if this is a Hot lead
        if [[ "$priority" == "Hot" ]] || ( [[ "$score" =~ ^[0-9]+$ ]] && [[ "$score" -ge 70 ]] ); then
            ((hot_count++))

            echo "🔥 Hot Lead #$hot_count: $name ($location)"

            # Create text message
            TEXT_MESSAGE=$(create_lead_text "$name" "$location" "$phone" "$score" "$source")

            # Send text
            echo "   📤 Opening text to $PHONE_NUMBER..."

            send_text_message "$PHONE_NUMBER" "$TEXT_MESSAGE"
            echo "   ✅ Message ready - click Send in Messages app!"
            ((sent_count++))

            echo ""

            # Small delay between texts
            sleep 3
        fi
    done < <(tail -n +2 "$csv_file")

    if [ $hot_count -eq 0 ]; then
        echo "ℹ️  No Hot leads found in this batch"
    else
        echo ""
        echo "✅ Opened $sent_count/$hot_count text notifications to $PHONE_NUMBER"
        echo "   Click 'Send' in Messages app to deliver!"
    fi
}

# Main execution
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Hot Lead Text Notification System                     ║"
echo "║        Phone: 404-551-6532                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get latest qualified leads file
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/qualified-leads-for-submission-*.csv 2>/dev/null | head -1)

if [ -z "$LATEST_CSV" ]; then
    echo "No lead files found. Sending TEST message..."
    echo ""

    # Create test message
    TEST_MESSAGE=$(cat << 'EOF'
🔥 HOT SOLAR LEAD TEST

Lisa Davis - Roswell GA
Score: 85
Source: Nextdoor

📞 (770) 555-0456

⚡ This is a test alert!
Your text notifications are working!

System: EkoSolarPros Lead Gen
EOF
)

    echo "📱 Opening test text to $PHONE_NUMBER..."

    send_text_message "$PHONE_NUMBER" "$TEST_MESSAGE"
    echo "✅ Test message ready in Messages app!"
    echo ""
    echo "📱 Click 'Send' to complete the test"
    echo ""
    echo "If you receive it, text notifications are working!"

    exit 0
fi

# Process real leads
echo "📄 Processing: $(basename "$LATEST_CSV")"
echo ""

# Send notifications
notify_hot_leads_via_text "$LATEST_CSV"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📱 Text notifications ready for: $PHONE_NUMBER"
echo ""
echo "💡 Click 'Send' in Messages app to deliver alerts"
echo ""

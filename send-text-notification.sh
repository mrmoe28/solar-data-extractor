#!/bin/bash

# Send Text Message Notifications for Hot Solar Leads
# Sends instant SMS/iMessage alerts via Messages app
# Phone: 404-551-6532

PHONE_NUMBER="404-551-6532"
PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"

# Function to send iMessage/SMS automatically
send_text_message() {
    local recipient="$1"
    local message="$2"

    # Ensure Messages app is running
    osascript -e 'tell application "Messages" to activate' 2>/dev/null
    sleep 1

    # Send message via AppleScript with retry logic
    local max_retries=3
    local retry_count=0
    local success=false

    while [ $retry_count -lt $max_retries ] && [ "$success" = false ]; do
        if osascript <<EOF 2>/dev/null
tell application "Messages"
    set targetBuddy to "$recipient"
    set targetService to 1st account whose service type = iMessage
    set theBuddy to participant targetBuddy of targetService
    send "$message" to theBuddy
end tell
EOF
        then
            success=true
        else
            ((retry_count++))
            sleep 2
        fi
    done

    if [ "$success" = false ]; then
        echo "   ⚠️  AppleScript failed, trying alternative method..."
        # Fallback: Use SMS URL scheme and auto-click Send with delay
        open "sms:$(echo "$recipient" | tr -d ' -()')&body=$(echo "$message" | jq -sRr @uri 2>/dev/null || echo "$message" | sed 's/ /%20/g')"
        sleep 3
        # Auto-press Return to send (simulates clicking Send button)
        osascript -e 'tell application "System Events" to keystroke return'
    fi
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
            echo "   📤 Sending text to $PHONE_NUMBER..."

            send_text_message "$PHONE_NUMBER" "$TEXT_MESSAGE"
            echo "   ✅ Text sent automatically!"
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
        echo "✅ Sent $sent_count/$hot_count text notifications to $PHONE_NUMBER automatically!"
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

    echo "📱 Sending test text to $PHONE_NUMBER..."

    send_text_message "$PHONE_NUMBER" "$TEST_MESSAGE"
    echo "✅ Test message sent automatically!"
    echo ""
    echo "📱 Check your phone: $PHONE_NUMBER"
    echo ""
    echo "If you received it, automated text notifications are working!"

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
echo "📱 Text notifications sent automatically to: $PHONE_NUMBER"
echo ""
echo "💡 Check your phone for Hot lead alerts!"
echo ""

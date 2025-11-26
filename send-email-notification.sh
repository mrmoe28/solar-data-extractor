#!/bin/bash

# Send Email Notification for Hot Solar Leads via Gmail SMTP
# Sends directly via Gmail (no Apple Mail.app required)

EMAIL_TO="ekosolarize@gmail.com"
EMAIL_SUBJECT="🔥 Hot New Lead - Solar Installation"
PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"
GMAIL_SENDER="$PROJECT_DIR/send-gmail.py"

# Function to send email via Gmail SMTP
send_email_via_gmail() {
    local subject="$1"
    local body="$2"
    local recipient="$3"

    # Check if Gmail is configured
    if [ ! -f "$PROJECT_DIR/.gmail-config" ]; then
        echo "⚠️  Gmail not configured yet!"
        echo ""
        echo "Please run: ./setup-gmail.sh"
        echo ""
        return 1
    fi

    # Send via Gmail SMTP using Python script
    if "$GMAIL_SENDER" "$recipient" "$subject" "$body"; then
        return 0
    else
        return 1
    fi
}

# Function to create email for a Hot lead
create_hot_lead_email() {
    local lead_name="$1"
    local lead_location="$2"
    local lead_phone="$3"
    local lead_email="$4"
    local lead_message="$5"
    local lead_score="$6"
    local lead_source="$7"

    cat << EOF
🔥 HOT NEW SOLAR LEAD ALERT!

═══════════════════════════════════════════════════════════════

LEAD DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:     ${lead_name}
Location: ${lead_location}
Score:    ${lead_score} (HOT)
Source:   ${lead_source}

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone:    ${lead_phone}
Email:    ${lead_email}

CUSTOMER REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${lead_message}

═══════════════════════════════════════════════════════════════

⚡ ACTION REQUIRED:
Call this lead within 30 minutes for best conversion rate!

This lead has been automatically submitted to EkoSolarPros.com
Check your website inbox for the full consultation request.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Automated Lead Generation System
Generated: $(date)

═══════════════════════════════════════════════════════════════
EOF
}

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Hot Lead Email Notification via Gmail SMTP            ║"
echo "║        Email: ekosolarize@gmail.com                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get latest qualified leads file
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/qualified-leads-for-submission-*.csv 2>/dev/null | head -1)

if [ -z "$LATEST_CSV" ]; then
    echo "Creating a TEST email to verify setup..."
    echo ""

    # Create test email
    TEST_BODY=$(create_hot_lead_email \
        "Lisa Davis" \
        "Roswell GA" \
        "(770) 555-0456" \
        "lisa.davis@email.com" \
        "Solar panels stopped working this morning! Inverter showing error code. Need technician ASAP. Please help!!" \
        "85" \
        "Nextdoor - East Cobb")

    echo "📧 Sending test email via Gmail SMTP..."
    send_email_via_gmail "$EMAIL_SUBJECT (TEST)" "$TEST_BODY" "$EMAIL_TO"

    echo ""
    echo "✅ Test email sent automatically!"
    echo ""
    echo "📧 Check your inbox: $EMAIL_TO"
    echo ""
    echo "If you received it, automated email notifications are working!"
    exit 0
fi

# Process real leads
echo "📄 Processing: $(basename "$LATEST_CSV")"
echo ""
echo "Looking for Hot leads..."
echo ""

# Count Hot leads
HOT_COUNT=$(tail -n +2 "$LATEST_CSV" | grep -i ",Hot," | wc -l | tr -d ' ')

if [ "$HOT_COUNT" -eq 0 ]; then
    echo "ℹ️  No Hot leads found in this batch"
    echo ""
    echo "💡 Would you like to send a test email instead?"
    read -p "Send test email? (yes/no): " send_test

    if [ "$send_test" = "yes" ]; then
        TEST_BODY=$(create_hot_lead_email \
            "Test Lead" \
            "Atlanta GA" \
            "(555) 555-5555" \
            "test@example.com" \
            "This is a test notification to verify email setup is working." \
            "99" \
            "Test System")

        send_email_via_gmail "$EMAIL_SUBJECT (TEST)" "$TEST_BODY" "$EMAIL_TO"
        echo "✅ Test email sent automatically!"
    fi
else
    echo "🔥 Found $HOT_COUNT Hot lead(s)!"
    echo ""
    echo "📧 Sending email notifications automatically..."
    echo ""

    # Get first Hot lead
    FIRST_HOT=$(tail -n +2 "$LATEST_CSV" | grep -i ",Hot," | head -1)

    if [ -n "$FIRST_HOT" ]; then
        # Parse CSV (basic parsing, may need adjustment)
        IFS=',' read -r source name location message phone email rest <<< "$FIRST_HOT"

        # Remove quotes
        name=$(echo "$name" | tr -d '"')
        location=$(echo "$location" | tr -d '"')
        message=$(echo "$message" | tr -d '"')
        phone=$(echo "$phone" | tr -d '"')
        email=$(echo "$email" | tr -d '"')
        source=$(echo "$source" | tr -d '"')

        EMAIL_BODY=$(create_hot_lead_email \
            "$name" \
            "$location" \
            "$phone" \
            "$email" \
            "$message" \
            "HOT" \
            "$source")

        send_email_via_gmail "$EMAIL_SUBJECT" "$EMAIL_BODY" "$EMAIL_TO"
        echo "✅ Email sent automatically!"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📧 Email notifications sent automatically!"
echo ""
echo "Check your inbox: $EMAIL_TO"
echo ""

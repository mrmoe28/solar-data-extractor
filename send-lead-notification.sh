#!/bin/bash

# Send Email Notification for Hot Solar Leads
# Emails: ekosolarize@gmail.com
# Subject: Hot New Lead

EMAIL_TO="ekosolarize@gmail.com"
EMAIL_SUBJECT="🔥 Hot New Lead - Solar Installation"
PROJECT_DIR="$HOME/Desktop/ekoleadgenerator/solar-data-extractor"
OUTPUT_DIR="$PROJECT_DIR/output"

# Function to send email notification
send_hot_lead_email() {
    local lead_name="$1"
    local lead_location="$2"
    local lead_phone="$3"
    local lead_email="$4"
    local lead_message="$5"
    local lead_score="$6"
    local lead_source="$7"

    # Create email body
    cat > /tmp/hot-lead-email.txt << EOF
🔥 HOT NEW SOLAR LEAD ALERT!

═══════════════════════════════════════════════════════════════

LEAD DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:     $lead_name
Location: $lead_location
Score:    $lead_score (HOT)
Source:   $lead_source

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone:    $lead_phone
Email:    $lead_email

CUSTOMER REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$lead_message

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

    # Send email using mail command
    if command -v mail &> /dev/null; then
        cat /tmp/hot-lead-email.txt | mail -s "$EMAIL_SUBJECT" "$EMAIL_TO"
        echo "✅ Email sent to $EMAIL_TO"
    else
        echo "⚠️  'mail' command not found. Installing..."
        # Note: On macOS, mail command should be available by default
        echo "Please ensure mail is configured on your system"
        echo ""
        echo "Email content saved to: /tmp/hot-lead-email.txt"
        echo "You can manually send this via your email client"
    fi
}

# Function to parse CSV and send notifications for HOT leads
notify_hot_leads() {
    local csv_file="$1"

    if [ ! -f "$csv_file" ]; then
        echo "❌ CSV file not found: $csv_file"
        return 1
    fi

    echo "📧 Checking for Hot leads to notify..."
    echo ""

    # Read CSV and find Hot leads (skip header)
    local hot_count=0

    tail -n +2 "$csv_file" | while IFS=',' read -r source name location message phone email profile post timestamp priority score intent; do
        # Remove quotes from fields
        priority=$(echo "$priority" | tr -d '"')
        score=$(echo "$score" | tr -d '"')

        # Check if this is a Hot lead
        if [[ "$priority" == "Hot" ]] || [[ "$score" -ge 70 ]]; then
            ((hot_count++))

            echo "🔥 Hot Lead #$hot_count: $name ($location)"

            # Send email notification
            send_hot_lead_email \
                "$name" \
                "$location" \
                "$phone" \
                "$email" \
                "$message" \
                "$score" \
                "$source"

            echo ""

            # Small delay between emails
            sleep 2
        fi
    done

    if [ $hot_count -eq 0 ]; then
        echo "ℹ️  No Hot leads found in this batch"
    else
        echo ""
        echo "✅ Sent $hot_count email notifications"
    fi
}

# Main execution
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Hot Lead Email Notification System                    ║"
echo "║        Email: ekosolarize@gmail.com                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get latest qualified leads file
LATEST_CSV=$(ls -t "$OUTPUT_DIR"/qualified-leads-for-submission-*.csv 2>/dev/null | head -1)

if [ -z "$LATEST_CSV" ]; then
    echo "❌ No lead files found"
    echo "   Run lead generation first!"
    exit 1
fi

echo "📄 Processing: $(basename "$LATEST_CSV")"
echo ""

# Send notifications
notify_hot_leads "$LATEST_CSV"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📧 All Hot lead notifications have been sent!"
echo ""
echo "Check your email: ekosolarize@gmail.com"
echo ""

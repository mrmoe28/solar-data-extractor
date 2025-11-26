#!/bin/bash

# Gmail SMTP Setup for Direct Email Sending
# Configures Gmail credentials for automated email notifications

CONFIG_FILE="$HOME/Desktop/ekoleadgenerator/solar-data-extractor/.gmail-config"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              Gmail SMTP Setup for Lead Notifications          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This will configure Gmail to send emails directly (no Apple Mail)"
echo ""

# Check if already configured
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Gmail already configured!"
    echo ""
    read -p "Do you want to reconfigure? (yes/no): " reconfigure
    if [ "$reconfigure" != "yes" ]; then
        echo "Setup cancelled."
        exit 0
    fi
    echo ""
fi

echo "📧 STEP 1: Gmail Account Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need a Gmail App Password (NOT your regular Gmail password)"
echo ""
echo "To create one:"
echo "  1. Go to: https://myaccount.google.com/apppasswords"
echo "  2. Sign in to your Gmail account (ekosolarize@gmail.com)"
echo "  3. Click 'Select app' → Choose 'Mail'"
echo "  4. Click 'Select device' → Choose 'Mac'"
echo "  5. Click 'Generate'"
echo "  6. Copy the 16-character password (without spaces)"
echo ""
echo "Note: You must have 2-Factor Authentication enabled on Gmail"
echo "      If not enabled, go to: https://myaccount.google.com/security"
echo ""
read -p "Press ENTER when you have your App Password ready..."
echo ""

# Get Gmail address
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Enter your Gmail address:"
read -p "Gmail: " gmail_address

if [ -z "$gmail_address" ]; then
    echo "❌ Gmail address cannot be empty!"
    exit 1
fi

# Validate email format
if [[ ! "$gmail_address" =~ ^[a-zA-Z0-9._%+-]+@gmail\.com$ ]]; then
    echo "⚠️  Warning: This doesn't look like a Gmail address"
    echo "   Make sure it ends with @gmail.com"
    echo ""
    read -p "Continue anyway? (yes/no): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Enter your Gmail App Password (16 characters, no spaces):"
read -s -p "App Password: " app_password
echo ""

if [ -z "$app_password" ]; then
    echo "❌ App Password cannot be empty!"
    exit 1
fi

# Remove spaces from app password
app_password=$(echo "$app_password" | tr -d ' ')

# Validate app password length (should be 16 chars)
if [ ${#app_password} -ne 16 ]; then
    echo "⚠️  Warning: Gmail App Passwords are usually 16 characters"
    echo "   You entered: ${#app_password} characters"
    echo ""
    read -p "Continue anyway? (yes/no): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Saving credentials..."

# Save to config file (secure permissions)
cat > "$CONFIG_FILE" << EOF
GMAIL_USER=$gmail_address
GMAIL_APP_PASSWORD=$app_password
EOF

# Set secure permissions (only you can read)
chmod 600 "$CONFIG_FILE"

echo "✅ Credentials saved to: $CONFIG_FILE"
echo "   (File permissions: 600 - only you can read)"
echo ""

# Test the connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Gmail connection..."
echo ""

# Make Python script executable
chmod +x send-gmail.py

# Send test email
if ./send-gmail.py "$gmail_address" "🔥 Test Email - EkoSolarPros Lead System" "This is a test email to verify your Gmail SMTP setup is working correctly.

If you receive this email, your automated lead notifications are ready!

System: EkoSolarPros Lead Generation
Date: $(date)"; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SETUP COMPLETE!                          ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📧 Test email sent to: $gmail_address"
    echo ""
    echo "Check your Gmail inbox (may take a few seconds)"
    echo ""
    echo "Your email notifications will now send via Gmail directly!"
    echo "No Apple Mail.app required."
    echo ""
else
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ⚠️  SETUP INCOMPLETE                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "The test email failed to send."
    echo ""
    echo "Common issues:"
    echo "  1. Gmail App Password may be incorrect"
    echo "  2. 2-Factor Authentication not enabled on Gmail"
    echo "  3. Check your internet connection"
    echo ""
    echo "To try again, run: ./setup-gmail.sh"
    echo ""

    # Ask if they want to delete the config
    read -p "Delete saved credentials and start over? (yes/no): " delete_config
    if [ "$delete_config" = "yes" ]; then
        rm -f "$CONFIG_FILE"
        echo "Credentials deleted."
    fi

    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

#!/usr/bin/env python3
"""
Send emails directly via Gmail SMTP
Requires Gmail App Password for authentication
"""

import smtplib
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

def load_credentials():
    """Load Gmail credentials from config file"""
    config_file = Path(__file__).parent / '.gmail-config'

    if not config_file.exists():
        print("ERROR: Gmail not configured yet!")
        print("")
        print("Please run: ./setup-gmail.sh")
        print("")
        sys.exit(1)

    credentials = {}
    with open(config_file, 'r') as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                credentials[key] = value

    return credentials

def send_email(to_email, subject, body):
    """Send email via Gmail SMTP"""

    # Load credentials
    creds = load_credentials()
    gmail_user = creds.get('GMAIL_USER')
    gmail_app_password = creds.get('GMAIL_APP_PASSWORD')

    if not gmail_user or not gmail_app_password:
        print("ERROR: Gmail credentials incomplete!")
        print("Please run: ./setup-gmail.sh")
        sys.exit(1)

    # Create message
    message = MIMEMultipart()
    message['From'] = gmail_user
    message['To'] = to_email
    message['Subject'] = subject

    # Add body
    message.attach(MIMEText(body, 'plain'))

    try:
        # Connect to Gmail SMTP
        print(f"Connecting to Gmail SMTP...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()

        # Login
        print(f"Logging in as {gmail_user}...")
        server.login(gmail_user, gmail_app_password)

        # Send email
        print(f"Sending email to {to_email}...")
        text = message.as_string()
        server.sendmail(gmail_user, to_email, text)

        # Close connection
        server.quit()

        print(f"✅ Email sent successfully!")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print("")
        print("Common issues:")
        print("  1. Gmail App Password may be incorrect")
        print("  2. 2-Factor Authentication must be enabled on Gmail")
        print("  3. Check your internet connection")
        print("")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: ./send-gmail.py <to_email> <subject> <body>")
        sys.exit(1)

    to_email = sys.argv[1]
    subject = sys.argv[2]
    body = sys.argv[3]

    success = send_email(to_email, subject, body)
    sys.exit(0 if success else 1)

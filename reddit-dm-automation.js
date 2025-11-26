#!/usr/bin/env node
/**
 * Reddit DM Automation
 * Automatically sends DMs to Reddit users with onboarding links
 * Requires Reddit API credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RedditDMAutomation {
  constructor() {
    this.userAgent = 'Solar Lead Generator v1.0';
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.username = process.env.REDDIT_USERNAME;
    this.password = process.env.REDDIT_PASSWORD;
    this.onboardingUrl = process.env.ONBOARDING_URL || 'https://your-website.com/get-started';
  }

  /**
   * Parse CSV and find leads that need Reddit DMs
   */
  async getRedditDMLeads(csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length <= 1) {
      return [];
    }

    const dmLeads = [];

    // Parse each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = this.parseCSVLine(line);

      // Check if this is a Reddit DM lead
      // Phone column will have "DM: u/username" format
      const phone = values[13]; // Phone is column 14 (index 13)

      if (phone && phone.startsWith('DM: u/')) {
        const username = phone.replace('DM: u/', '');
        const name = values[3];
        const message = values[8];
        const postUrl = values[10];

        dmLeads.push({
          username,
          name,
          message,
          postUrl,
          rawLine: line
        });
      }
    }

    return dmLeads;
  }

  /**
   * Parse CSV line (handles quoted values)
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  /**
   * Send DM to Reddit user
   */
  async sendDM(username, leadInfo) {
    if (!this.clientId || !this.clientSecret) {
      console.log('⚠️  Reddit API not configured. Skipping DM automation.');
      console.log('   Setup: https://www.reddit.com/prefs/apps');
      return false;
    }

    try {
      // Use Reddit API to send message
      // For now, we'll use fetch with Reddit OAuth

      // Get access token
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent
        },
        body: `grant_type=password&username=${this.username}&password=${this.password}`
      });

      if (!tokenResponse.ok) {
        console.error(`❌ Failed to get Reddit access token: ${tokenResponse.status}`);
        return false;
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Craft personalized message
      const dmMessage = this.craftMessage(username, leadInfo);

      // Send DM
      const dmResponse = await fetch('https://oauth.reddit.com/api/compose', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent
        },
        body: new URLSearchParams({
          api_type: 'json',
          subject: 'Solar Installation Help - Free Quote',
          text: dmMessage,
          to: username
        })
      });

      if (!dmResponse.ok) {
        console.error(`❌ Failed to send DM to u/${username}: ${dmResponse.status}`);
        return false;
      }

      console.log(`✅ Sent DM to u/${username}`);
      return true;

    } catch (error) {
      console.error(`❌ Error sending DM to u/${username}:`, error.message);
      return false;
    }
  }

  /**
   * Craft personalized DM message
   */
  craftMessage(username, leadInfo) {
    return `Hey ${username}!

I saw your post about ${leadInfo.message.substring(0, 100)}...

We specialize in solar installations and repairs in your area. I'd love to help you out!

**We can offer:**
- Free consultation & quote
- Same-week installation
- 25-year warranty
- Local, licensed installers

**Get started here:** ${this.onboardingUrl}

Or reply to this message with any questions!

Best regards,
Eko Solar Team`;
  }

  /**
   * Process all Reddit DM leads
   */
  async processLeads(csvPath) {
    console.log('🔍 Scanning for Reddit DM leads...\n');

    const dmLeads = await this.getRedditDMLeads(csvPath);

    if (dmLeads.length === 0) {
      console.log('ℹ️  No Reddit DM leads found.\n');
      return;
    }

    console.log(`📨 Found ${dmLeads.length} leads to contact via Reddit DM\n`);

    let successCount = 0;

    for (const lead of dmLeads) {
      console.log(`Sending DM to u/${lead.username}...`);

      const success = await this.sendDM(lead.username, lead);

      if (success) {
        successCount++;
      }

      // Rate limit: Wait 10 seconds between DMs to avoid spam detection
      if (dmLeads.indexOf(lead) < dmLeads.length - 1) {
        console.log('   Waiting 10s to avoid rate limit...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log(`\n✅ Sent ${successCount}/${dmLeads.length} DMs successfully\n`);
  }
}

// CLI usage
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.log('Usage: node reddit-dm-automation.js <csv-file>');
    console.log('Example: node reddit-dm-automation.js output/georgia-solar-leads-2025-11-26.csv');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const automation = new RedditDMAutomation();
  automation.processLeads(csvPath).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export default RedditDMAutomation;

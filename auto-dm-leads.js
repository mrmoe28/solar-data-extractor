#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automated DM Sender
 * Sends personalized DMs to leads from the CSV
 *
 * IMPORTANT:
 * - Respects rate limits (delays between messages)
 * - Requires manual login on first run
 * - Personalizes messages based on lead's post
 */

class AutoDMSender {
  constructor(csvPath, yourName, yourPhone, yourEmail) {
    this.csvPath = csvPath;
    this.yourName = yourName;
    this.yourPhone = yourPhone;
    this.yourEmail = yourEmail;
    this.leads = [];
    this.messagesSent = 0;
    this.messagesFailed = 0;
  }

  async run() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                  ║');
    console.log('║          🤖  AUTOMATED DM SENDER  🤖                             ║');
    console.log('║          Reach Out To Leads Automatically                        ║');
    console.log('║                                                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Load leads from CSV
    this.loadLeads();

    // Filter to only social media leads with profile URLs
    const socialLeads = this.leads.filter(lead =>
      lead.profileUrl &&
      lead.profileUrl.includes('reddit.com') && // Start with Reddit only (easiest)
      !lead.phone && !lead.email // Skip leads that already have contact info
    );

    console.log(`📊 Found ${socialLeads.length} social media leads to contact`);
    console.log(`   (Filtering to leads without direct phone/email)`);
    console.log('');

    if (socialLeads.length === 0) {
      console.log('⚠️  No social media leads found in CSV!');
      console.log('   Run the scraper first: node scrape-leads.js "Atlanta"');
      return;
    }

    // Ask for confirmation
    console.log('⚠️  IMPORTANT: This will send DMs to real people!');
    console.log('   - Rate limited to 1 message every 30-60 seconds');
    console.log('   - You will login manually on first run');
    console.log('   - Messages are personalized based on their post');
    console.log('');
    console.log(`📝 Your Info:`);
    console.log(`   Name: ${this.yourName}`);
    console.log(`   Phone: ${this.yourPhone}`);
    console.log(`   Email: ${this.yourEmail}`);
    console.log('');
    console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');

    await this.sleep(10000);

    console.log('\\n🚀 Starting automated outreach...\\n');

    // Send DMs
    await this.sendRedditDMs(socialLeads.filter(l => l.profileUrl.includes('reddit.com')));

    // Summary
    console.log('\\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                        ✅ COMPLETE                                ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Messages Sent: ${this.messagesSent}`);
    console.log(`❌ Messages Failed: ${this.messagesFailed}`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Check your Reddit inbox for responses');
    console.log('   2. Follow up with leads who reply');
    console.log('   3. Run daily to catch new leads!');
    console.log('');
  }

  loadLeads() {
    const csvContent = fs.readFileSync(this.csvPath, 'utf8');
    const lines = csvContent.split('\\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const lead = {};

      headers.forEach((header, index) => {
        lead[header.trim()] = values[index]?.trim() || '';
      });

      this.leads.push(lead);
    }

    console.log(`✅ Loaded ${this.leads.length} leads from CSV`);
  }

  async sendRedditDMs(redditLeads) {
    if (redditLeads.length === 0) return;

    console.log(`\\n📱 Sending ${redditLeads.length} Reddit DMs...`);

    const browser = await chromium.launch({
      headless: false, // Visible so you can login
      timeout: 60000
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    try {
      // Go to Reddit and check login
      await page.goto('https://www.reddit.com', { waitUntil: 'domcontentloaded' });
      await this.sleep(2000);

      const isLoggedIn = await page.evaluate(() => {
        return !!document.querySelector('[data-testid="user-menu-button"]');
      });

      if (!isLoggedIn) {
        console.log('\\n⚠️  NOT LOGGED IN TO REDDIT');
        console.log('  Please login manually in the browser window...');
        console.log('  (Waiting 60 seconds for you to login)');
        await this.sleep(60000);
      }

      // Send DMs one by one
      for (const lead of redditLeads) {
        try {
          console.log(`\\n  Messaging: ${lead.Name} (Score: ${lead.Score})`);
          console.log(`    Post: ${lead.Message.slice(0, 60)}...`);

          const message = this.generateMessage(lead);

          await this.sendRedditDM(page, lead.Name, message);

          this.messagesSent++;
          console.log(`    ✅ Sent! (${this.messagesSent}/${redditLeads.length})`);

          // Rate limiting: 30-60 seconds between messages
          const delay = 30000 + Math.random() * 30000;
          console.log(`    ⏱️  Waiting ${Math.round(delay/1000)}s before next message...`);
          await this.sleep(delay);

        } catch (error) {
          console.error(`    ❌ Failed: ${error.message}`);
          this.messagesFailed++;
        }
      }

    } catch (error) {
      console.error(`❌ Reddit DM error:`, error.message);
    }

    await browser.close();
  }

  async sendRedditDM(page, username, message) {
    // Navigate to user's profile
    const profileUrl = `https://www.reddit.com/user/${username}`;
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.sleep(2000);

    // Click "Send Message" button
    const sendMessageButton = await page.$('a[href*="/message/compose"]');
    if (!sendMessageButton) {
      throw new Error('Could not find Send Message button');
    }

    await sendMessageButton.click();
    await this.sleep(3000);

    // Fill in subject and message
    const subjectInput = await page.$('input[name="subject"]');
    const messageTextarea = await page.$('textarea[name="message"]');

    if (!subjectInput || !messageTextarea) {
      throw new Error('Could not find message form');
    }

    await subjectInput.fill('Re: Your Solar Post');
    await this.sleep(500);

    await messageTextarea.fill(message);
    await this.sleep(500);

    // Send
    const sendButton = await page.$('button[type="submit"]');
    if (!sendButton) {
      throw new Error('Could not find send button');
    }

    await sendButton.click();
    await this.sleep(2000);
  }

  generateMessage(lead) {
    const message = lead.Message.toLowerCase();
    const isRepair = /not working|broken|repair|fix|error|issue/.test(message);
    const isInstallation = /install|quote|cost|price|how much/.test(message);

    let greeting = `Hey there!`;
    let intro = `I saw your post about solar${lead.Location ? ` in ${lead.Location}` : ''}.`;

    let pitch = '';
    if (isRepair) {
      pitch = `I'm a local solar specialist who focuses on troubleshooting and repairs. I've helped a lot of homeowners with systems that aren't working properly - especially when the original installer isn't responding.\\n\\nI can usually diagnose issues remotely or come out same-day if you're in a bind.`;
    } else if (isInstallation) {
      pitch = `I'm a local solar specialist in your area. I'd be happy to offer you a free, no-pressure quote for your project.\\n\\nI work with a lot of homeowners and can usually beat big company prices while providing better service.`;
    } else {
      pitch = `I'm a local solar specialist and would be happy to answer any questions you have or help with your solar project.`;
    }

    let contact = `Feel free to reach out:\\n\\nPhone/Text: ${this.yourPhone}\\nEmail: ${this.yourEmail}`;

    let closing = `No pressure at all - just wanted to offer help if you need it!\\n\\nBest,\\n${this.yourName}`;

    return `${greeting}\\n\\n${intro} ${pitch}\\n\\n${contact}\\n\\n${closing}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Get CSV path from command line or use latest
const csvArg = process.argv[2];
let csvPath;

if (csvArg) {
  csvPath = csvArg;
} else {
  // Find latest CSV in output folder
  const outputDir = path.join(__dirname, 'output');
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('georgia-solar-leads') && f.endsWith('.csv'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.error('❌ No CSV files found in output folder!');
    console.error('   Run the scraper first: node scrape-leads.js "Atlanta"');
    process.exit(1);
  }

  csvPath = path.join(outputDir, files[0].name);
  console.log(`📁 Using latest CSV: ${files[0].name}\\n`);
}

// Get your contact info from command line or prompt
const yourName = process.argv[3] || 'John'; // TODO: Replace with your name
const yourPhone = process.argv[4] || '404-555-1234'; // TODO: Replace with your phone
const yourEmail = process.argv[5] || 'john@solarpros.com'; // TODO: Replace with your email

// Run the DM sender
const sender = new AutoDMSender(csvPath, yourName, yourPhone, yourEmail);
sender.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

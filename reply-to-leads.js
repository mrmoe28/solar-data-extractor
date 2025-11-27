#!/usr/bin/env node

/**
 * YouTube Lead Responder CLI
 * Reply to hot leads from your latest scraping session
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouTubeResponder } from './lib/youtube-responder.js';
import readline from 'readline';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your contact information (customize this)
const YOUR_CONTACT_INFO = {
  name: 'Your Name',
  company: 'Your Solar Company',
  phone: '(XXX) XXX-XXXX',
  email: 'your.email@example.com',
  website: 'https://yourcompany.com'
};

/**
 * Load latest YouTube leads from CSV
 */
function loadLatestLeads() {
  const outputDir = path.join(__dirname, 'output');
  const files = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.csv') && f.includes('solar-leads'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('❌ No lead files found in output directory');
    return [];
  }

  const latestFile = path.join(outputDir, files[0]);
  console.log(`📁 Loading leads from: ${files[0]}`);

  const csvContent = fs.readFileSync(latestFile, 'utf8');
  const lines = csvContent.split('\n').slice(1); // Skip header

  const leads = lines
    .filter(line => line.trim())
    .map(line => {
      const parts = line.split(',');
      return {
        priority: parts[0],
        score: parseInt(parts[1]),
        source: parts[2],
        name: parts[3],
        location: parts[4],
        message: parts[8],
        profileUrl: parts[9],
        postUrl: parts[10],
        timestamp: parts[11],
        intent: parts[12],
        phone: parts[13],
        email: parts[14]
      };
    })
    .filter(lead => lead.source === 'YouTube'); // Only YouTube leads

  return leads;
}

/**
 * Interactive mode - review and approve each reply
 */
async function interactiveMode(responder, leads) {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║           YOUTUBE LEAD RESPONDER - INTERACTIVE MODE           ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`Found ${leads.length} YouTube leads`);
  console.log('Filtering for Hot and Warm leads only...\n');

  const hotWarmLeads = leads.filter(l => l.priority !== 'Cold');
  console.log(`🔥 ${hotWarmLeads.length} Hot/Warm leads to process\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let approved = 0;
  let skipped = 0;

  for (let i = 0; i < hotWarmLeads.length; i++) {
    const lead = hotWarmLeads[i];

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`LEAD ${i + 1} of ${hotWarmLeads.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log(`👤 Name:     ${lead.name}`);
    console.log(`🔥 Priority: ${lead.priority} (Score: ${lead.score})`);
    console.log(`🎯 Intent:   ${lead.intent}`);
    console.log(`📍 Location: ${lead.location}`);
    console.log(`\n💬 Their comment:`);
    console.log(`   "${lead.message.substring(0, 200)}..."`);
    console.log(`\n🔗 ${lead.postUrl}\n`);

    // Generate AI reply
    console.log('🤖 Generating AI reply...\n');
    const reply = await responder.generateReply(lead, YOUR_CONTACT_INFO);

    console.log('📝 Proposed Reply:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log(reply.split('\n').map(line => `│ ${line}`.padEnd(64) + '│').join('\n'));
    console.log('└─────────────────────────────────────────────────────────────┘\n');

    const answer = await new Promise(resolve => {
      rl.question('Send this reply? [y/n/q]: ', resolve);
    });

    if (answer.toLowerCase() === 'q') {
      console.log('\n❌ Quitting...');
      break;
    }

    if (answer.toLowerCase() === 'y') {
      try {
        const commentId = responder.extractCommentId(lead.postUrl);
        await responder.replyToComment(commentId, reply);
        responder.saveContactedLead(commentId, {
          name: lead.name,
          priority: lead.priority,
          intent: lead.intent,
          replyText: reply
        });
        console.log('✅ Reply posted!\n');
        approved++;

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error posting reply: ${error.message}\n`);
      }
    } else {
      console.log('⏭️  Skipped\n');
      skipped++;
    }
  }

  rl.close();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                          SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Replies posted: ${approved}`);
  console.log(`⏭️  Skipped:        ${skipped}`);
  console.log('');
}

/**
 * Auto mode - automatically reply to all hot/warm leads
 */
async function autoMode(responder, leads) {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║           YOUTUBE LEAD RESPONDER - AUTO MODE                  ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('⚠️  WARNING: This will automatically reply to all Hot/Warm leads!');
  console.log('Make sure your contact info is correct in reply-to-leads.js\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirm = await new Promise(resolve => {
    rl.question('Continue? [yes/no]: ', resolve);
  });
  rl.close();

  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled\n');
    return;
  }

  const hotWarmLeads = leads.filter(l => l.priority !== 'Cold');
  const results = await responder.processBatch(hotWarmLeads, YOUR_CONTACT_INFO, true);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                          RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Replies posted:     ${results.posted}`);
  console.log(`⏭️  Skipped:            ${results.skipped}`);
  console.log(`❌ Errors:             ${results.errors}`);
  console.log('');
}

/**
 * Preview mode - just show what would be sent
 */
async function previewMode(responder, leads) {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║           YOUTUBE LEAD RESPONDER - PREVIEW MODE               ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const hotWarmLeads = leads.filter(l => l.priority !== 'Cold').slice(0, 5);

  console.log(`Showing preview for first ${hotWarmLeads.length} Hot/Warm leads:\n`);

  for (let i = 0; i < hotWarmLeads.length; i++) {
    const lead = hotWarmLeads[i];

    console.log(`\n━━━━━━━━ LEAD ${i + 1} ━━━━━━━━`);
    console.log(`👤 ${lead.name} (${lead.priority})`);
    console.log(`💬 "${lead.message.substring(0, 100)}..."`);

    const reply = await responder.generateReply(lead, YOUR_CONTACT_INFO);

    console.log(`\n📝 AI Reply:`);
    console.log(reply);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Main
 */
async function main() {
  const mode = process.argv[2] || 'interactive';

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║           🎬 YOUTUBE LEAD RESPONDER 🎬                        ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('Available modes:');
  console.log('  • preview     - See what replies would be sent (no posting)');
  console.log('  • interactive - Review and approve each reply (RECOMMENDED)');
  console.log('  • auto        - Automatically reply to all hot/warm leads');
  console.log('');

  // Load leads
  const leads = loadLatestLeads();

  if (leads.length === 0) {
    console.log('❌ No YouTube leads found. Run scraper first!\n');
    return;
  }

  // Initialize responder
  const responder = new YouTubeResponder();

  try {
    await responder.authorize();
  } catch (error) {
    if (error.message.includes('OAuth authorization required')) {
      console.log('\n⚠️  You need to authorize the app first.');
      console.log('Run: node setup-youtube-auth.js\n');
      return;
    }
    throw error;
  }

  // Run selected mode
  switch (mode) {
    case 'preview':
      await previewMode(responder, leads);
      break;
    case 'auto':
      await autoMode(responder, leads);
      break;
    case 'interactive':
    default:
      await interactiveMode(responder, leads);
      break;
  }
}

main().catch(console.error);

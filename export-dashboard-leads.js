#!/usr/bin/env node

/**
 * Export Dashboard Leads to CSV/Google Sheets
 * Fetches leads from the Eko Lead Dashboard and exports them
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'https://eko-lead-dashboard.vercel.app';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║          📊  DASHBOARD LEADS EXPORTER  📊                        ║');
console.log('║          Export leads to CSV & Google Sheets                     ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

async function fetchLeads() {
  try {
    console.log('📡 Fetching leads from dashboard...');
    console.log(`   API: ${DASHBOARD_API_URL}/api/leads`);
    console.log('');

    const response = await fetch(`${DASHBOARD_API_URL}/api/leads`);
    const leads = await response.json();

    console.log(`✅ Found ${leads.length} leads in database`);
    console.log('');

    return leads;
  } catch (error) {
    console.error('❌ Error fetching leads:', error.message);
    process.exit(1);
  }
}

function convertToCSV(leads) {
  if (leads.length === 0) {
    return 'No leads found';
  }

  // CSV headers
  const headers = [
    'ID',
    'Name',
    'Location',
    'Priority',
    'Score',
    'Source',
    'Phone',
    'Email',
    'Request',
    'Why Hot',
    'Action Required',
    'Posted Time',
    'Profile URL',
    'Original Post URL',
    'Revenue Min',
    'Revenue Max',
    'Address',
    'System Size',
    'Permit Number',
    'Message',
    'Intent',
    'Scraped At',
    'Created At',
  ];

  // Escape CSV field
  const escapeField = (field) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.location,
    lead.priority,
    lead.score,
    lead.source,
    lead.phone || '',
    lead.email || '',
    lead.request,
    lead.whyHot || '',
    lead.actionRequired || '',
    lead.postedTime || '',
    lead.profileUrl || '',
    lead.originalPostUrl || '',
    lead.revenueMin || '',
    lead.revenueMax || '',
    lead.address || '',
    lead.systemSize || '',
    lead.permitNumber || '',
    lead.message || '',
    lead.intent || '',
    lead.scrapedAt || '',
    lead.createdAt,
  ].map(escapeField).join(','));

  return [headers.join(','), ...rows].join('\n');
}

function saveCSV(csv, filename) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, csv, 'utf-8');

  return filepath;
}

async function main() {
  // Fetch leads from dashboard
  const leads = await fetchLeads();

  if (leads.length === 0) {
    console.log('⚠️  No leads found in database');
    console.log('   Run the scraper first to collect leads');
    return;
  }

  // Convert to CSV
  console.log('📝 Converting to CSV format...');
  const csv = convertToCSV(leads);

  // Save CSV file
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `eko-solar-leads-${timestamp}.csv`;
  const filepath = saveCSV(csv, filename);

  console.log('✅ CSV file created!');
  console.log('');
  console.log(`📁 File: ${filepath}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 NEXT STEPS: Import to Google Sheets');
  console.log('');
  console.log('Option 1: Manual Upload (Easiest)');
  console.log('─────────────────────────────────');
  console.log('1. Go to: https://sheets.google.com');
  console.log('2. Click "Blank" to create new sheet');
  console.log('3. File → Import → Upload');
  console.log('4. Select the CSV file above');
  console.log('5. Click "Import data"');
  console.log('');
  console.log('Option 2: Copy to Google Drive');
  console.log('─────────────────────────────────');
  console.log('1. Copy CSV to: ~/Google Drive/My Drive/');
  console.log('2. In Google Sheets: File → Import → Google Drive');
  console.log('3. Select your CSV → Import');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Export complete!');
  console.log('');

  // Stats
  console.log('📈 Lead Statistics:');
  console.log(`   Total Leads: ${leads.length}`);

  const sourceStats = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  console.log('');
  console.log('   By Source:');
  Object.entries(sourceStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`   - ${source}: ${count} leads`);
    });
  console.log('');
}

main().catch(console.error);

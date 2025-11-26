#!/usr/bin/env node
/**
 * Complete Workflow Test
 * Tests all components of the lead generation system
 */

import 'dotenv/config';
import { DashboardAPIClient } from './dashboard-api-client.js';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║          🧪 WORKFLOW TEST - Complete System Analysis             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

// Test 1: Environment Variables
console.log('1️⃣  Testing Environment Variables...');
console.log(`   DASHBOARD_API_URL: ${process.env.DASHBOARD_API_URL || '❌ NOT SET'}`);
console.log(`   SCRAPER_API_KEY: ${process.env.SCRAPER_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   GOOGLE_SEARCH_ENGINE_ID: ${process.env.GOOGLE_SEARCH_ENGINE_ID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   PERPLEXITY_API_KEY: ${process.env.PERPLEXITY_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log();

// Test 2: Dashboard API Connection
console.log('2️⃣  Testing Dashboard API Connection...');
const api = new DashboardAPIClient();

try {
  console.log(`   Attempting to connect to: ${process.env.DASHBOARD_API_URL}`);
  const sessionResponse = await api.createSession('Test Location');
  console.log('   ✅ API Connection: SUCCESS');
  console.log(`   Session ID: ${sessionResponse?.sessionId || 'N/A'}`);
} catch (error) {
  console.log('   ❌ API Connection: FAILED');
  console.log(`   Error: ${error.message}`);
}
console.log();

// Test 3: Check Scraper Imports
console.log('3️⃣  Testing Scraper Imports...');
try {
  const { scrapeRedditLeads } = await import('./scrapers/reddit-scraper.js');
  console.log('   ✅ reddit-scraper.js');
} catch (e) {
  console.log('   ❌ reddit-scraper.js:', e.message);
}

try {
  const { scrapeCityDataLeads } = await import('./scrapers/city-data-scraper.js');
  console.log('   ✅ city-data-scraper.js');
} catch (e) {
  console.log('   ❌ city-data-scraper.js:', e.message);
}

try {
  const { scrapeWebSearchLeads } = await import('./scrapers/web-search-scraper.js');
  console.log('   ✅ web-search-scraper.js');
} catch (e) {
  console.log('   ❌ web-search-scraper.js:', e.message);
}

try {
  const { scrapePerplexityLeads } = await import('./scrapers/perplexity-scraper.js');
  console.log('   ✅ perplexity-scraper.js');
} catch (e) {
  console.log('   ❌ perplexity-scraper.js:', e.message);
}

try {
  const { scrapeCraigslistLeads } = await import('./scrapers/craigslist-scraper.js');
  console.log('   ✅ craigslist-scraper.js');
} catch (e) {
  console.log('   ❌ craigslist-scraper.js:', e.message);
}
console.log();

// Test 4: File Structure
console.log('4️⃣  Testing File Structure...');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  'scrape-leads.js',
  'dashboard-api-client.js',
  '.env',
  'scrapers/reddit-scraper.js',
  'scrapers/city-data-scraper.js',
  'scrapers/web-search-scraper.js',
  'scrapers/perplexity-scraper.js',
  'scrapers/craigslist-scraper.js',
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});
console.log();

// Test 5: Quick Scraper Test (Reddit only)
console.log('5️⃣  Testing Reddit Scraper (quick test)...');
try {
  const { scrapeRedditLeads } = await import('./scrapers/reddit-scraper.js');
  console.log('   Running quick Reddit search...');
  const leads = await scrapeRedditLeads('Atlanta');
  console.log(`   ✅ Found ${leads.length} leads`);
  if (leads.length > 0) {
    console.log(`   Sample lead: ${leads[0].name} - ${leads[0].message.substring(0, 50)}...`);
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}
console.log();

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ TEST COMPLETE                               ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

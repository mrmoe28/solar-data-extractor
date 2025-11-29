#!/usr/bin/env node

import { scrapeRedditLeads } from './scrapers/reddit-scraper.js';
import { scrapeFacebookLeads } from './scrapers/facebook-scraper.js';
import { scrapeCraigslistLeads } from './scrapers/craigslist-scraper.js';
import { scrapeTwitterLeads } from './scrapers/twitter-scraper.js';
import { scrapeYelpLeads } from './scrapers/yelp-scraper.js';
import { scrapeQuoraLeads } from './scrapers/quora-scraper.js';
import { scrapeNextdoorLeads } from './scrapers/nextdoor-scraper.js';
import { scrapePermitLeads } from './scrapers/permit-scraper.js';
import { scrapeIncentiveLeads } from './scrapers/incentive-scraper.js';
import { scrapeWebSearchLeads } from './scrapers/web-search-scraper.js';
import { scrapePerplexityLeads } from './scrapers/perplexity-scraper.js';
import { scrapeCityDataLeads } from './scrapers/city-data-scraper.js';
import { scrapeYouTubeLeads } from './scrapers/youtube-scraper.js';
import { DashboardAPIClient } from './dashboard-api-client.js';
import GoogleSheetsIntegration from './google-sheets-integration.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import 'dotenv/config';

// Auto-start workers if not running
function ensureWorkersRunning() {
  const { execSync } = child_process;
  
  try {
    // Check if workers are running
    execSync('pgrep -f "tsx.*start-workers"', { stdio: 'ignore' });
    console.log('✅ AI Workers already running');
  } catch (error) {
    console.log('🚀 Auto-starting AI Workers...');
    
    const workersScript = path.join(__dirname, '../workers-service.sh');
    if (fs.existsSync(workersScript)) {
      execSync(`${workersScript} start`, { stdio: 'inherit' });
      console.log('⏳ Waiting for workers to initialize...');
      setTimeout(() => {}, 1000); // Wait 1 second
    } else {
      console.log('⚠️  Workers service script not found. Please start workers manually.');
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lock file to prevent concurrent scrapes
const LOCK_FILE = path.join(__dirname, '.scraping.lock');
const SCRAPER_TIMEOUT = 45000; // 45 seconds per scraper (faster)

/**
 * Timeout wrapper for scrapers
 * Prevents scrapers from hanging indefinitely
 */
function withTimeout(promise, timeoutMs, scraperName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${scraperName} exceeded ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Main Lead Generation Script
 * Orchestrates all scrapers and generates reports
 */
class LeadGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, 'output');
    this.timestamp = new Date().toISOString().split('T')[0];
    this.allLeads = [];
    this.api = new DashboardAPIClient();

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async run() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                  ║');
    console.log('║          🔆  SOLAR LEAD GENERATOR  🔆                            ║');
    console.log('║          Real-Time Lead Scraping System                          ║');
    console.log('║                                                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Auto-start workers for AI analysis
    ensureWorkersRunning();
    console.log('');

    // Check for concurrent scrapes (lock file)
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      const lockAge = Date.now() - lockData.timestamp;

      // If lock is older than 10 minutes, assume stale and remove
      if (lockAge > 600000) {
        console.log('⚠️  Found stale lock file (>10 min old). Removing...');
        fs.unlinkSync(LOCK_FILE);
      } else {
        console.error('❌ ERROR: Another scrape is already running!');
        console.error(`   Started: ${new Date(lockData.timestamp).toLocaleTimeString()}`);
        console.error(`   Location: ${lockData.location}`);
        console.error('   Please wait for it to complete or remove .scraping.lock file');
        process.exit(1);
      }
    }

    // Get location from command line or default
    const location = process.argv[2] || 'Georgia';

    // Create lock file
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      timestamp: Date.now(),
      location,
      pid: process.pid
    }), 'utf8');
    console.log('🔒 Lock file created');

    console.log(`📍 Target Location: ${location}`);
    console.log(`📅 Date: ${this.timestamp}`);
    console.log('');

    // Ask which platforms to scrape
    const scrapePermits = true; // HIGH-ROI: People who got solar permits
    const scrapeIncentives = true; // HIGH-ROI: People applying for rebates
    const scrapePerplexity = true; // AI-POWERED: Searches entire web with AI filtering (needs API key)
    const scrapeWebSearch = true; // Web search aggregator (needs Google Search Engine ID)
    const scrapeYouTube = true; // FREE: Finds people asking for help in video comments
    const scrapeReddit = true; // ✅ WORKING: Uses JSON API (no anti-bot blocking)
    const scrapeCityData = false; // ❌ DISABLED: RSS feed returns 404 error
    const scrapeCraigslist = false; // ❌ DISABLED: Returns 403 Forbidden
    const scrapeTwitter = false; // ❌ DISABLED: Playwright blocked by anti-bot protection
    const scrapeYelp = false; // ❌ DISABLED: Playwright blocked by anti-bot protection
    const scrapeQuora = false; // ❌ DISABLED: Playwright blocked by anti-bot protection
    const scrapeFacebook = false; // Disabled
    const scrapeNextdoor = false; // Disabled

    console.log('🎯 Platforms:');
    console.log(`\n🔥 HIGH-ROI SOURCES (People Already Getting Solar):`);
    console.log(`  ${scrapePermits ? '✅' : '❌'} County Building Permits`);
    console.log(`  ${scrapeIncentives ? '✅' : '❌'} Solar Incentive/Rebate Programs`);
    console.log(`\n🤖 AI-POWERED WEB SEARCH:`);
    console.log(`  ${scrapePerplexity ? '✅' : '❌'} Perplexity AI (searches billions of pages with AI filtering)`);
    console.log(`  ${scrapeWebSearch ? '✅' : '❌'} Google Custom Search (100/day free)`);
    console.log(`  ${scrapeYouTube ? '✅' : '❌'} YouTube Comments (10,000 requests/day free)`);
    console.log(`\n📱 SOCIAL MEDIA & COMMUNITY SOURCES:`);
    console.log(`  ${scrapeReddit ? '✅' : '❌'} Reddit`);
    console.log(`  ${scrapeCityData ? '✅' : '❌'} City-Data Forums (local community discussions)`);
    console.log(`  ${scrapeCraigslist ? '✅' : '❌'} Craigslist`);
    console.log(`  ${scrapeTwitter ? '✅' : '❌'} Twitter/X`);
    console.log(`  ${scrapeYelp ? '✅' : '❌'} Yelp Q&A`);
    console.log(`  ${scrapeQuora ? '✅' : '❌'} Quora`);
    console.log(`  ${scrapeFacebook ? '✅' : '❌'} Facebook`);
    console.log(`  ${scrapeNextdoor ? '✅' : '❌'} Nextdoor`);
    console.log('');

    // Create dashboard session
    await this.api.createSession(location);

    const startTime = Date.now();

    // Run scrapers (HIGH-ROI sources first!)
    try {
      // HIGH-ROI: These are people already getting solar
      if (scrapePermits) {
        await this.api.sendLog('Permits', 'Starting permit scraper...', 0, 'processing');
        try {
          const permitLeads = await withTimeout(scrapePermitLeads(location), SCRAPER_TIMEOUT, 'Permits');
          this.allLeads.push(...permitLeads);
          await this.api.sendLog('Permits', `Found ${permitLeads.length} leads from permits`, permitLeads.length, 'success');
          await this.api.sendLeadsBatch(permitLeads);
        } catch (error) {
          console.error(`⚠️  Permits scraper error: ${error.message}`);
          await this.api.sendLog('Permits', `Error: ${error.message}`, 0, 'error');
        }
      }

      if (scrapeIncentives) {
        await this.api.sendLog('Incentives', 'Starting incentive scraper...', 0, 'processing');
        try {
          const incentiveLeads = await withTimeout(scrapeIncentiveLeads(location), SCRAPER_TIMEOUT, 'Incentives');
          this.allLeads.push(...incentiveLeads);
          await this.api.sendLog('Incentives', `Found ${incentiveLeads.length} leads from incentives`, incentiveLeads.length, 'success');
          await this.api.sendLeadsBatch(incentiveLeads);
        } catch (error) {
          console.error(`⚠️  Incentives scraper error: ${error.message}`);
          await this.api.sendLog('Incentives', `Error: ${error.message}`, 0, 'error');
        }
      }

      // AI-Powered web search (Perplexity - searches billions of pages!)
      if (scrapePerplexity) {
        await this.api.sendLog('Perplexity', 'Searching web with Perplexity AI...', 0, 'processing');
        try {
          const perplexityLeads = await withTimeout(scrapePerplexityLeads(location), SCRAPER_TIMEOUT, 'Perplexity');
          this.allLeads.push(...perplexityLeads);
          await this.api.sendLog('Perplexity', `Found ${perplexityLeads.length} leads from Perplexity`, perplexityLeads.length, 'success');
          await this.api.sendLeadsBatch(perplexityLeads);
        } catch (error) {
          console.error(`⚠️  Perplexity scraper error: ${error.message}`);
          await this.api.sendLog('Perplexity', `Error: ${error.message}`, 0, 'error');
        }
      }

      // Web search aggregator (Google Custom Search)
      if (scrapeWebSearch) {
        await this.api.sendLog('Web Search', 'Searching Google/Bing for solar leads...', 0, 'processing');
        try {
          const webLeads = await withTimeout(scrapeWebSearchLeads(location), SCRAPER_TIMEOUT, 'Web Search');
          this.allLeads.push(...webLeads);
          await this.api.sendLog('Web Search', `Found ${webLeads.length} leads from web search`, webLeads.length, 'success');
          await this.api.sendLeadsBatch(webLeads);
        } catch (error) {
          console.error(`⚠️  Web Search scraper error: ${error.message}`);
          await this.api.sendLog('Web Search', `Error: ${error.message}`, 0, 'error');
        }
      }

      // YouTube Comments (FREE tier: 10,000 requests/day)
      if (scrapeYouTube) {
        await this.api.sendLog('YouTube', 'Searching YouTube video comments...', 0, 'processing');
        try {
          const youtubeLeads = await withTimeout(scrapeYouTubeLeads(location), SCRAPER_TIMEOUT, 'YouTube');
          this.allLeads.push(...youtubeLeads);
          await this.api.sendLog('YouTube', `Found ${youtubeLeads.length} leads from YouTube`, youtubeLeads.length, 'success');
          await this.api.sendLeadsBatch(youtubeLeads);
        } catch (error) {
          console.error(`⚠️  YouTube scraper error: ${error.message}`);
          await this.api.sendLog('YouTube', `Error: ${error.message}`, 0, 'error');
        }
      }

      // Social media sources
      if (scrapeReddit) {
        await this.api.sendLog('Reddit', 'Scraping Reddit for solar leads...', 0, 'processing');
        try {
          const redditLeads = await withTimeout(scrapeRedditLeads(location), SCRAPER_TIMEOUT, 'Reddit');
          this.allLeads.push(...redditLeads);
          await this.api.sendLog('Reddit', `Found ${redditLeads.length} leads`, redditLeads.length, 'success');
          await this.api.sendLeadsBatch(redditLeads);
        } catch (error) {
          console.error(`⚠️  Reddit scraper error: ${error.message}`);
          await this.api.sendLog('Reddit', `Error: ${error.message}`, 0, 'error');
        }
      }

      if (scrapeCityData) {
        await this.api.sendLog('City-Data', 'Scraping City-Data forums...', 0, 'processing');
        const cityDataLeads = await scrapeCityDataLeads(location);
        this.allLeads.push(...cityDataLeads);
        await this.api.sendLog('City-Data', `Found ${cityDataLeads.length} leads`, cityDataLeads.length, 'success');
        await this.api.sendLeadsBatch(cityDataLeads);
      }

      if (scrapeCraigslist) {
        await this.api.sendLog('Craigslist', 'Scraping Craigslist...', 0, 'processing');
        const craigslistLeads = await scrapeCraigslistLeads(location);
        this.allLeads.push(...craigslistLeads);
        await this.api.sendLog('Craigslist', `Found ${craigslistLeads.length} leads`, craigslistLeads.length, 'success');
        await this.api.sendLeadsBatch(craigslistLeads);
      }

      if (scrapeTwitter) {
        await this.api.sendLog('Twitter', 'Scraping Twitter/X...', 0, 'processing');
        const twitterLeads = await scrapeTwitterLeads(location);
        this.allLeads.push(...twitterLeads);
        await this.api.sendLog('Twitter', `Found ${twitterLeads.length} leads`, twitterLeads.length, 'success');
        await this.api.sendLeadsBatch(twitterLeads);
      }

      if (scrapeYelp) {
        await this.api.sendLog('Yelp', 'Scraping Yelp Q&A...', 0, 'processing');
        const yelpLeads = await scrapeYelpLeads(location);
        this.allLeads.push(...yelpLeads);
        await this.api.sendLog('Yelp', `Found ${yelpLeads.length} leads`, yelpLeads.length, 'success');
        await this.api.sendLeadsBatch(yelpLeads);
      }

      if (scrapeQuora) {
        await this.api.sendLog('Quora', 'Scraping Quora...', 0, 'processing');
        const quoraLeads = await scrapeQuoraLeads(location);
        this.allLeads.push(...quoraLeads);
        await this.api.sendLog('Quora', `Found ${quoraLeads.length} leads`, quoraLeads.length, 'success');
        await this.api.sendLeadsBatch(quoraLeads);
      }

      if (scrapeFacebook) {
        await this.api.sendLog('Facebook', 'Scraping Facebook...', 0, 'processing');
        const facebookLeads = await scrapeFacebookLeads(location);
        this.allLeads.push(...facebookLeads);
        await this.api.sendLog('Facebook', `Found ${facebookLeads.length} leads`, facebookLeads.length, 'success');
        await this.api.sendLeadsBatch(facebookLeads);
      }

      if (scrapeNextdoor) {
        await this.api.sendLog('Nextdoor', 'Scraping Nextdoor...', 0, 'processing');
        const nextdoorLeads = await scrapeNextdoorLeads(location);
        this.allLeads.push(...nextdoorLeads);
        await this.api.sendLog('Nextdoor', `Found ${nextdoorLeads.length} leads`, nextdoorLeads.length, 'success');
        await this.api.sendLeadsBatch(nextdoorLeads);
      }

      // Mark session as completed
      await this.api.completeSession('completed');
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      await this.api.completeSession('failed', error.message);
    } finally {
      // Always remove lock file when done
      if (fs.existsSync(LOCK_FILE)) {
        fs.unlinkSync(LOCK_FILE);
        console.log('🔓 Lock file removed');
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Sort by score (highest first)
    this.allLeads.sort((a, b) => b.score - a.score);

    // Generate reports
    console.log('\n📊 GENERATING REPORTS...\n');

    const csvPath = this.saveToCSV();
    const reportPath = this.generateReport();

    // Sync to Google Sheets
    await this.syncToGoogleSheets(csvPath);

    // Summary
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                        ✅ COMPLETE                                ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`⏱️  Time: ${duration}s`);
    console.log(`📊 Total Leads: ${this.allLeads.length}`);
    console.log(`🔥 Hot Leads: ${this.allLeads.filter(l => l.priority === 'Hot').length}`);
    console.log(`🌡️  Warm Leads: ${this.allLeads.filter(l => l.priority === 'Warm').length}`);
    console.log(`❄️  Cold Leads: ${this.allLeads.filter(l => l.priority === 'Cold').length}`);
    console.log('');
    console.log('📁 Files Created:');
    console.log(`   ${csvPath}`);
    console.log(`   ${reportPath}`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Open the CSV file in Excel/Google Sheets');
    console.log('   2. Sort by Score (highest first)');
    console.log('   3. Start calling Hot leads!');
    console.log('');
  }

  saveToCSV() {
    const filename = `georgia-solar-leads-${this.timestamp}.csv`;
    const filepath = path.join(this.outputDir, filename);

    const headers = [
      'Priority',
      'Score',
      'Source',
      'Name',
      'Location',
      'Address',
      'System Size',
      'Permit Number',
      'Message',
      'Profile URL',
      'Post URL',
      'Timestamp',
      'Intent',
      'Phone',
      'Email'
    ];

    const rows = this.allLeads.map(lead => [
      lead.priority || '',
      lead.score || 0,
      this.escapeCsv(lead.source),
      this.escapeCsv(lead.name),
      this.escapeCsv(lead.location),
      this.escapeCsv(lead.address || ''),
      this.escapeCsv(lead.systemSize || ''),
      this.escapeCsv(lead.permitNumber || ''),
      this.escapeCsv(lead.message || ''),
      this.escapeCsv(lead.profileUrl || ''),
      this.escapeCsv(lead.postUrl || ''),
      lead.timestamp || '',
      lead.intent || '',
      lead.phone || '',
      lead.email || ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filepath, csv, 'utf8');

    console.log(`✅ CSV saved: ${filename}`);
    return filepath;
  }

  generateReport() {
    const filename = `DAILY-LEAD-REPORT-${this.timestamp}.md`;
    const filepath = path.join(this.outputDir, filename);

    const hotLeads = this.allLeads.filter(l => l.priority === 'Hot');
    const warmLeads = this.allLeads.filter(l => l.priority === 'Warm');
    const coldLeads = this.allLeads.filter(l => l.priority === 'Cold');

    let report = `# 🔥 Solar Lead Report - ${this.timestamp}\n\n`;
    report += `## Executive Summary\n\n`;
    report += `- **Total Leads:** ${this.allLeads.length}\n`;
    report += `- **Hot Leads:** ${hotLeads.length} (Score 50+)\n`;
    report += `- **Warm Leads:** ${warmLeads.length} (Score 30-49)\n`;
    report += `- **Cold Leads:** ${coldLeads.length} (Score <30)\n\n`;

    report += `## Revenue Potential\n\n`;
    const avgDealSize = 15000;
    const closeRate = 0.15;
    const potential = Math.round(hotLeads.length * avgDealSize * closeRate);
    report += `Assuming ${hotLeads.length} hot leads × $${avgDealSize.toLocaleString()} avg deal × ${closeRate * 100}% close rate:\n`;
    report += `**Estimated Revenue: $${potential.toLocaleString()}**\n\n`;

    // Top 5 Hottest Leads
    report += `## 🔥 Top 5 Hottest Leads\n\n`;
    const top5 = this.allLeads.slice(0, 5);
    top5.forEach((lead, i) => {
      report += `### ${i + 1}. ${lead.name} (Score: ${lead.score})\n`;
      report += `- **Source:** ${lead.source}\n`;
      report += `- **Location:** ${lead.location}\n`;
      report += `- **Message:** ${lead.message?.slice(0, 200)}...\n`;
      report += `- **Profile:** ${lead.profileUrl}\n`;
      if (lead.postUrl) report += `- **Post:** ${lead.postUrl}\n`;
      report += `- **Priority:** ${lead.priority}\n`;
      report += `\n`;
    });

    // Source breakdown
    report += `## 📊 Lead Sources\n\n`;
    const sources = {};
    this.allLeads.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1;
    });
    Object.entries(sources).forEach(([source, count]) => {
      report += `- **${source}:** ${count} leads\n`;
    });

    report += `\n---\n`;
    report += `Generated with [Claude Code](https://claude.com/claude-code)\n`;

    fs.writeFileSync(filepath, report, 'utf8');

    console.log(`✅ Report saved: ${filename}`);
    return filepath;
  }

  async syncToGoogleSheets(csvPath) {
    try {
      console.log('\n📊 Syncing to Google Sheets...');
      const integration = new GoogleSheetsIntegration();

      const authorized = await integration.authorize();
      if (!authorized) {
        console.log('⚠️  Google Sheets not configured. Skipping sync.');
        console.log('💡 To enable, run: ./setup-google-sheets-api.sh');
        return;
      }

      const spreadsheetId = await integration.getOrCreateSpreadsheet();
      const count = await integration.appendLeads(spreadsheetId, csvPath);

      console.log(`✅ Synced ${count} leads to Google Sheets!`);
      console.log(`🔗 View: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    } catch (error) {
      console.error('⚠️  Google Sheets sync failed:', error.message);
      console.log('   Leads saved to CSV. You can manually upload if needed.');
    }
  }

  escapeCsv(value) {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}

// Run the generator
const generator = new LeadGenerator();
generator.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

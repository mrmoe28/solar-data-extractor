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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main Lead Generation Script
 * Orchestrates all scrapers and generates reports
 */
class LeadGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, 'output');
    this.timestamp = new Date().toISOString().split('T')[0];
    this.allLeads = [];

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

    // Get location from command line or default
    const location = process.argv[2] || 'Georgia';
    console.log(`📍 Target Location: ${location}`);
    console.log(`📅 Date: ${this.timestamp}`);
    console.log('');

    // Ask which platforms to scrape
    const scrapePermits = true; // HIGH-ROI: People who got solar permits
    const scrapeIncentives = true; // HIGH-ROI: People applying for rebates
    const scrapeReddit = true; // Default: always scrape Reddit (no login required)
    const scrapeCraigslist = true; // Default: always scrape Craigslist (no login required)
    const scrapeTwitter = true; // Default: always scrape Twitter (no login required)
    const scrapeYelp = true; // Default: always scrape Yelp Q&A (no login required)
    const scrapeQuora = true; // Default: always scrape Quora (no login required)
    const scrapeFacebook = process.argv.includes('--facebook'); // Optional: add --facebook flag
    const scrapeNextdoor = process.argv.includes('--nextdoor'); // Optional: add --nextdoor flag

    console.log('🎯 Platforms:');
    console.log(`\n🔥 HIGH-ROI SOURCES (People Already Getting Solar):`);
    console.log(`  ${scrapePermits ? '✅' : '❌'} County Building Permits`);
    console.log(`  ${scrapeIncentives ? '✅' : '❌'} Solar Incentive/Rebate Programs`);
    console.log(`\n📱 SOCIAL MEDIA SOURCES:`);
    console.log(`  ${scrapeReddit ? '✅' : '❌'} Reddit`);
    console.log(`  ${scrapeCraigslist ? '✅' : '❌'} Craigslist`);
    console.log(`  ${scrapeTwitter ? '✅' : '❌'} Twitter/X`);
    console.log(`  ${scrapeYelp ? '✅' : '❌'} Yelp Q&A`);
    console.log(`  ${scrapeQuora ? '✅' : '❌'} Quora`);
    console.log(`  ${scrapeFacebook ? '✅' : '❌'} Facebook ${!scrapeFacebook ? '(add --facebook to enable)' : ''}`);
    console.log(`  ${scrapeNextdoor ? '✅' : '❌'} Nextdoor ${!scrapeNextdoor ? '(add --nextdoor to enable)' : ''}`);
    console.log('');

    const startTime = Date.now();

    // Run scrapers (HIGH-ROI sources first!)
    try {
      // HIGH-ROI: These are people already getting solar
      if (scrapePermits) {
        const permitLeads = await scrapePermitLeads(location);
        this.allLeads.push(...permitLeads);
      }

      if (scrapeIncentives) {
        const incentiveLeads = await scrapeIncentiveLeads(location);
        this.allLeads.push(...incentiveLeads);
      }

      // Social media sources
      if (scrapeReddit) {
        const redditLeads = await scrapeRedditLeads(location);
        this.allLeads.push(...redditLeads);
      }

      if (scrapeCraigslist) {
        const craigslistLeads = await scrapeCraigslistLeads(location);
        this.allLeads.push(...craigslistLeads);
      }

      if (scrapeTwitter) {
        const twitterLeads = await scrapeTwitterLeads(location);
        this.allLeads.push(...twitterLeads);
      }

      if (scrapeYelp) {
        const yelpLeads = await scrapeYelpLeads(location);
        this.allLeads.push(...yelpLeads);
      }

      if (scrapeQuora) {
        const quoraLeads = await scrapeQuoraLeads(location);
        this.allLeads.push(...quoraLeads);
      }

      if (scrapeFacebook) {
        const facebookLeads = await scrapeFacebookLeads(location);
        this.allLeads.push(...facebookLeads);
      }

      if (scrapeNextdoor) {
        const nextdoorLeads = await scrapeNextdoorLeads(location);
        this.allLeads.push(...nextdoorLeads);
      }
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Sort by score (highest first)
    this.allLeads.sort((a, b) => b.score - a.score);

    // Generate reports
    console.log('\n📊 GENERATING REPORTS...\n');

    const csvPath = this.saveToCSV();
    const reportPath = this.generateReport();

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

#!/usr/bin/env node

import { ClaudeEnricher } from './enrichment/claude-enricher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Script for Claude Enrichment
 *
 * Usage:
 * 1. Set ANTHROPIC_API_KEY environment variable
 * 2. Run: node test-enrichment.js
 */

async function testEnrichment() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                  ║');
  console.log('║          🤖  CLAUDE ENRICHMENT TEST  🤖                          ║');
  console.log('║                                                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable not set!');
    console.log('');
    console.log('To fix:');
    console.log('  1. Get your API key from: https://console.anthropic.com/');
    console.log('  2. Set it: export ANTHROPIC_API_KEY="your-key-here"');
    console.log('  3. Run this script again');
    console.log('');
    process.exit(1);
  }

  const enricher = new ClaudeEnricher();

  // Test leads (mix of easy and hard)
  const testLeads = [
    {
      name: 'John Smith',
      location: 'Atlanta, GA',
      source: 'Reddit',
      message: 'My solar panels stopped working last week. Need urgent repair. I live in Buckhead area.',
      score: 85
    },
    {
      name: 'Property Owner',
      location: 'Atlanta',
      source: 'Incentive Programs',
      address: '123 Peachtree St, Atlanta, GA 30303',
      message: 'Applied for solar rebate/incentive. System size: 8.5kW. This homeowner is ACTIVELY installing solar.',
      score: 90
    },
    {
      name: 'u/solarhelp2024',
      location: 'Fulton County, GA',
      source: 'Reddit',
      message: 'Anyone know a good solar repair tech? My inverter is showing error code E43.',
      score: 75
    }
  ];

  console.log(`📋 Testing enrichment on ${testLeads.length} leads...\n`);

  // Test individual enrichment
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('TEST 1: Single Lead Enrichment');
  console.log('──────────────────────────────────────────────────────────────────\n');

  const enriched = await enricher.enrichLead(testLeads[0]);

  console.log('\nOriginal Lead:');
  console.log(JSON.stringify(testLeads[0], null, 2));

  console.log('\nEnriched Lead:');
  console.log(JSON.stringify(enriched, null, 2));

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log('TEST 2: Batch Enrichment');
  console.log('──────────────────────────────────────────────────────────────────\n');

  const allEnriched = await enricher.enrichLeads(testLeads, {
    batchSize: 2,
    delayMs: 500,
    skipIfHasContact: false
  });

  console.log('Results Summary:');
  console.log('─────────────────────────────────────────────────────────────────');

  allEnriched.forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.name}`);
    console.log(`   Phone: ${lead.phone || '❌ Not found'}`);
    console.log(`   Email: ${lead.email || '❌ Not found'}`);
    console.log(`   LinkedIn: ${lead.linkedin || '❌ Not found'}`);
    console.log(`   Confidence: ${lead.enrichmentConfidence || 'N/A'}`);
    if (lead.enrichmentNotes) {
      console.log(`   Notes: ${lead.enrichmentNotes}`);
    }
  });

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log('TEST 3: Load Real Scraped Leads');
  console.log('──────────────────────────────────────────────────────────────────\n');

  // Try to load latest CSV
  const outputDir = path.join(__dirname, 'output');
  const csvFiles = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('georgia-solar-leads') && f.endsWith('.csv'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (csvFiles.length > 0) {
    const latestCsv = csvFiles[0].name;
    console.log(`📄 Found latest CSV: ${latestCsv}`);

    const csvPath = path.join(outputDir, latestCsv);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    // Parse first 3 leads from CSV
    const realLeads = [];
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const lead = {};
      headers.forEach((header, index) => {
        lead[header.trim()] = values[index]?.trim() || '';
      });

      realLeads.push({
        name: lead.Name || 'Unknown',
        location: lead.Location || 'Unknown',
        source: lead.Source || 'Unknown',
        message: lead.Message || '',
        phone: lead.Phone || null,
        email: lead.Email || null
      });
    }

    if (realLeads.length > 0) {
      console.log(`\n📊 Enriching ${realLeads.length} real leads from CSV...\n`);

      const enrichedReal = await enricher.enrichLeads(realLeads, {
        batchSize: 2,
        delayMs: 1000,
        skipIfHasContact: true // Skip leads that already have contact info
      });

      console.log('\nReal Leads Results:');
      console.log('─────────────────────────────────────────────────────────────────');

      enrichedReal.forEach((lead, i) => {
        console.log(`\n${i + 1}. ${lead.name} (${lead.source})`);
        console.log(`   Location: ${lead.location}`);
        console.log(`   Phone: ${lead.phone || '❌ Not found'}`);
        console.log(`   Email: ${lead.email || '❌ Not found'}`);
        console.log(`   Confidence: ${lead.enrichmentConfidence || 'N/A'}`);
      });

      // Save enriched CSV
      const enrichedCsvPath = csvPath.replace('.csv', '-ENRICHED.csv');
      const enrichedHeaders = [...headers, 'Enrichment Confidence', 'Enrichment Notes'];
      const enrichedRows = enrichedReal.map(lead => [
        lead.priority || '',
        lead.score || '',
        lead.source || '',
        lead.name || '',
        lead.location || '',
        lead.address || '',
        lead.systemSize || '',
        lead.permitNumber || '',
        lead.message || '',
        lead.profileUrl || '',
        lead.postUrl || '',
        lead.timestamp || '',
        lead.intent || '',
        lead.phone || '',
        lead.email || '',
        lead.enrichmentConfidence || '',
        lead.enrichmentNotes || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

      const enrichedCsv = [
        enrichedHeaders.join(','),
        ...enrichedRows
      ].join('\n');

      fs.writeFileSync(enrichedCsvPath, enrichedCsv, 'utf8');

      console.log(`\n✅ Saved enriched CSV: ${path.basename(enrichedCsvPath)}`);
    }
  } else {
    console.log('ℹ️  No CSV files found. Run scraper first: node scrape-leads.js "Atlanta"');
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                     ✅ TEST COMPLETE                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Review enrichment accuracy above');
  console.log('   2. Integrate into main scraper if satisfied');
  console.log('   3. Run: node scrape-leads.js "Atlanta" --enrich');
  console.log('');
}

// Run test
testEnrichment().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

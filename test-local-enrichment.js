#!/usr/bin/env node

import { LocalLLMEnricher } from './enrichment/local-llm-enricher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Script for Local LLM Enrichment
 *
 * Usage:
 * 1. Start Ollama: ollama serve
 * 2. Download model: ollama pull llama3.2
 * 3. Run: node test-local-enrichment.js
 */

async function testLocalEnrichment() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                  ║');
  console.log('║       🤖  LOCAL LLM ENRICHMENT TEST  🤖                          ║');
  console.log('║                  (FREE & PRIVATE!)                               ║');
  console.log('║                                                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  const enricher = new LocalLLMEnricher({
    model: 'llama3.2',  // or 'mistral', 'llama3.1'
    baseUrl: 'http://localhost:11434',
    temperature: 0.3
  });

  // Check if Ollama is ready
  console.log('🔍 Checking Ollama status...\n');
  const status = await enricher.checkStatus();

  if (!status.running) {
    console.error('❌ Error: Ollama is not running!');
    console.log('');
    console.log('To fix:');
    console.log('  1. Install Ollama: brew install ollama');
    console.log('  2. Start service: ollama serve');
    console.log('  3. Run this script again');
    console.log('');
    process.exit(1);
  }

  if (!status.modelAvailable) {
    console.error(`❌ Error: Model '${enricher.model}' not found!`);
    console.log('');
    console.log('Available models:', status.availableModels?.join(', ') || 'none');
    console.log('');
    console.log('To fix:');
    console.log(`  1. Download model: ollama pull ${enricher.model}`);
    console.log('  2. Run this script again');
    console.log('');
    console.log('Recommended models:');
    console.log('  - llama3.2 (fast, good accuracy)');
    console.log('  - mistral (medium speed, great accuracy)');
    console.log('  - llama3.1 (slow, best accuracy)');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Ollama is running');
  console.log(`✅ Model '${enricher.model}' is available`);
  console.log('');

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

  console.log(`📋 Testing enrichment on ${testLeads.length} leads...`);
  console.log(`   Model: ${enricher.model}`);
  console.log(`   Cost per lead: $0.00 (FREE!) 🎉`);
  console.log('');

  // Test individual enrichment
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('TEST 1: Single Lead Enrichment');
  console.log('──────────────────────────────────────────────────────────────────\n');

  console.log('⚠️  Note: Local LLM is slower than Claude API (5-10 sec per lead)');
  console.log('   This is normal. The benefit is FREE unlimited enrichments!\n');

  const startTime = Date.now();
  const enriched = await enricher.enrichLead(testLeads[0]);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\nOriginal Lead:');
  console.log(JSON.stringify(testLeads[0], null, 2));

  console.log('\nEnriched Lead:');
  console.log(JSON.stringify(enriched, null, 2));

  console.log(`\n⏱️  Time taken: ${duration} seconds`);

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log('TEST 2: Batch Enrichment');
  console.log('──────────────────────────────────────────────────────────────────\n');

  const batchStartTime = Date.now();
  const allEnriched = await enricher.enrichLeads(testLeads, {
    batchSize: 2,          // Smaller batches for local LLM
    delayMs: 500,          // Less delay needed (no rate limits)
    skipIfHasContact: false
  });
  const batchDuration = ((Date.now() - batchStartTime) / 1000).toFixed(1);

  console.log('Results Summary:');
  console.log('─────────────────────────────────────────────────────────────────');

  allEnriched.forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.name}`);
    console.log(`   Phone: ${lead.phone || '❌ Not found'}`);;
    console.log(`   Email: ${lead.email || '❌ Not found'}`);
    console.log(`   LinkedIn: ${lead.linkedin || '❌ Not found'}`);
    console.log(`   Confidence: ${lead.enrichmentConfidence || 'N/A'}`);
    if (lead.enrichmentNotes) {
      console.log(`   Notes: ${lead.enrichmentNotes}`);
    }
  });

  console.log(`\n⏱️  Total time: ${batchDuration} seconds`);
  console.log(`   Average: ${(batchDuration / testLeads.length).toFixed(1)} sec/lead`);

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log('TEST 3: Load Real Scraped Leads');
  console.log('──────────────────────────────────────────────────────────────────\n');

  // Try to load latest CSV
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    console.log('ℹ️  No output directory found. Run scraper first: node scrape-leads.js "Atlanta"');
  } else {
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
        console.log(`\n📊 Enriching ${realLeads.length} real leads from CSV...`);
        console.log('⚠️  This may take 30-60 seconds with local LLM...\n');

        const realStartTime = Date.now();
        const enrichedReal = await enricher.enrichLeads(realLeads, {
          batchSize: 2,
          delayMs: 1000,
          skipIfHasContact: true // Skip leads that already have contact info
        });
        const realDuration = ((Date.now() - realStartTime) / 1000).toFixed(1);

        console.log('\nReal Leads Results:');
        console.log('─────────────────────────────────────────────────────────────────');

        enrichedReal.forEach((lead, i) => {
          console.log(`\n${i + 1}. ${lead.name} (${lead.source})`);
          console.log(`   Location: ${lead.location}`);
          console.log(`   Phone: ${lead.phone || '❌ Not found'}`);
          console.log(`   Email: ${lead.email || '❌ Not found'}`);
          console.log(`   Confidence: ${lead.enrichmentConfidence || 'N/A'}`);
        });

        console.log(`\n⏱️  Total time: ${realDuration} seconds`);

        // Save enriched CSV
        const enrichedCsvPath = csvPath.replace('.csv', '-LOCAL-ENRICHED.csv');
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
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                     ✅ TEST COMPLETE                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('💡 Performance Notes:');
  console.log('   - Local LLM is slower than Claude API (5-20 sec/lead)');
  console.log('   - But it\'s 100% FREE with unlimited enrichments! 🎉');
  console.log('   - Perfect for overnight batch jobs (500+ leads)');
  console.log('   - Use Claude API if you need speed ($0.003/lead)');
  console.log('');
  console.log('📊 Model Recommendations:');
  console.log('   - llama3.2: Fast, good accuracy (RECOMMENDED for batches)');
  console.log('   - mistral: Medium speed, great accuracy');
  console.log('   - llama3.1: Slow, best accuracy (for premium leads)');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Review enrichment accuracy above');
  console.log('   2. Try different models: ollama pull mistral');
  console.log('   3. Integrate into main scraper');
  console.log('   4. Run overnight batches: 500+ leads for FREE!');
  console.log('');
}

// Run test
testLocalEnrichment().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

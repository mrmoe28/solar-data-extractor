#!/usr/bin/env node
/**
 * Fix Google Sheets Headers
 * Removes old "Extracted At" column and ensures correct header alignment
 */

import GoogleSheetsIntegration from './google-sheets-integration.js';

const SHEET_ID = '1BFE6IP6y-mgfGrwHGJaJsqrlkj_LTKbbTCTRQe1RHGw';

async function fixHeaders() {
  const integration = new GoogleSheetsIntegration();

  console.log('🔧 Fixing Google Sheets headers...');

  // Authorize
  const authorized = await integration.authorize();
  if (!authorized) {
    console.error('❌ Authorization failed');
    process.exit(1);
  }

  console.log('✅ Authorized');

  // Clear ALL existing data (we'll re-import from CSV)
  console.log('🗑️  Clearing existing data...');
  await integration.sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: 'Leads!A1:Z1000',
  });

  console.log('✅ Data cleared');

  // Add correct headers
  console.log('📝 Adding correct headers...');
  await integration.addHeaders(SHEET_ID);

  console.log('✅ Headers fixed!');
  console.log('');
  console.log('Now run: node google-sheets-integration.js output/georgia-solar-leads-2025-11-26.csv');
  console.log('');
}

fixHeaders().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

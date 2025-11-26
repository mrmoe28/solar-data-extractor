#!/usr/bin/env node
import GoogleSheetsIntegration from './google-sheets-integration.js';

const SHEET_ID = '1BFE6IP6y-mgfGrwHGJaJsqrlkj_LTKbbTCTRQe1RHGw';

async function fix() {
  const integration = new GoogleSheetsIntegration();
  await integration.authorize();

  const headers = [
    'Priority', 'Score', 'Source', 'Name', 'Location', 'Address',
    'System Size', 'Permit Number', 'Message/Request', 'Profile URL',
    'Post URL', 'Timestamp', 'Intent', 'Phone', 'Email'
  ];

  // Just update headers, no formatting
  await integration.sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Leads!A1:O1',
    valueInputOption: 'RAW',
    resource: { values: [headers] },
  });

  console.log('✅ Headers updated');

  // Now sync the CSV
  console.log('\n📊 Syncing CSV data...');
  await integration.appendLeads(SHEET_ID, 'output/georgia-solar-leads-2025-11-26.csv');

  console.log('\n✅ Done! Check your sheet');
}

fix().catch(console.error);

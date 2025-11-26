#!/usr/bin/env node

/**
 * Manual authorization for Google Sheets
 * Use this to regenerate the token with correct permissions
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];
const TOKEN_PATH = path.join(__dirname, 'config', 'google-sheets-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'config', 'google-sheets-credentials.json');

async function authorize() {
  // Load credentials
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('❌ Error retrieving access token:', err);
        return;
      }

      // Save token
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('✅ Token saved to:', TOKEN_PATH);
      console.log('');
      console.log('🎉 Authorization complete! You can now run:');
      console.log('   node google-sheets-integration.js output/georgia-solar-leads-2025-11-26.csv');
      console.log('');
    });
  });
}

authorize().catch(console.error);

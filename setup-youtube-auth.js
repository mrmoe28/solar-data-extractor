#!/usr/bin/env node

/**
 * YouTube OAuth Setup Script
 * Run this once to authorize the app to post comments on your behalf
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
const TOKEN_PATH = path.join(__dirname, 'youtube-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'youtube-oauth.json');

async function authorize() {
  // Load client secrets
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        YOUTUBE COMMENT RESPONDER - OAUTH SETUP                ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('This will authorize the app to post comment replies on your behalf.');
  console.log('You only need to do this once.\n');

  console.log('STEP 1: Open this URL in your browser:\n');
  console.log(`${authUrl}\n`);

  console.log('STEP 2: Sign in with your YouTube account');
  console.log('STEP 3: Click "Allow" to grant permission');
  console.log('STEP 4: Copy the authorization code\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the authorization code here: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save the token for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    console.log('\n✅ Authorization successful!');
    console.log(`📁 Token saved to: ${TOKEN_PATH}`);
    console.log('\n🚀 You can now use the YouTube comment responder.');
    console.log('   Run: node reply-to-leads.js\n');

  } catch (error) {
    console.error('\n❌ Error retrieving access token:', error.message);
    console.error('Please try again or check your OAuth credentials.\n');
    process.exit(1);
  }
}

authorize().catch(console.error);

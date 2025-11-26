#!/usr/bin/env node
/**
 * Google Sheets API Integration for Solar Leads
 * Automatically appends new leads to your Google Sheet
 * No manual CSV imports needed!
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsIntegration {
  constructor() {
    this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    this.TOKEN_PATH = path.join(__dirname, 'config', 'google-sheets-token.json');
    this.CREDENTIALS_PATH = path.join(__dirname, 'config', 'google-sheets-credentials.json');
    this.SHEET_NAME = 'Eko Solar Leads';
    this.auth = null;
    this.sheets = null;
  }

  /**
   * Load credentials and authorize
   */
  async authorize() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Check if we have a token already
      if (fs.existsSync(this.TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(this.TOKEN_PATH, 'utf8'));
        oAuth2Client.setCredentials(token);
        this.auth = oAuth2Client;
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        return true;
      }

      // Need to get new token
      console.log('⚠️  No token found. Run setup first: ./setup-google-sheets-api.sh');
      return false;
    } catch (error) {
      console.error('❌ Authorization error:', error.message);
      console.log('\n💡 Run setup first: ./setup-google-sheets-api.sh');
      return false;
    }
  }

  /**
   * Get or create the spreadsheet
   */
  async getOrCreateSpreadsheet() {
    try {
      // Try to find existing spreadsheet by name
      const response = await google.drive({ version: 'v3', auth: this.auth }).files.list({
        q: `name='${this.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log(`✅ Found existing sheet: ${this.SHEET_NAME}`);
        return response.data.files[0].id;
      }

      // Create new spreadsheet
      console.log(`📄 Creating new sheet: ${this.SHEET_NAME}`);
      const spreadsheet = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: this.SHEET_NAME,
          },
          sheets: [{
            properties: {
              title: 'Leads',
              gridProperties: {
                frozenRowCount: 1, // Freeze header row
              },
            },
          }],
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      console.log(`✅ Created new spreadsheet!`);
      console.log(`🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

      // Add headers
      await this.addHeaders(spreadsheetId);

      return spreadsheetId;
    } catch (error) {
      console.error('❌ Error getting/creating spreadsheet:', error.message);
      throw error;
    }
  }

  /**
   * Add header row to new spreadsheet
   */
  async addHeaders(spreadsheetId) {
    const headers = [
      'Priority',
      'Score',
      'Source',
      'Name',
      'Location',
      'Message/Request',
      'Phone',
      'Email',
      'Profile URL',
      'Post URL',
      'Timestamp',
      'Intent',
      'Extracted At',
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Leads!A1:M1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers],
      },
    });

    // Format header row (bold, background color)
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      },
    });

    console.log('✅ Added formatted headers');
  }

  /**
   * Parse CSV file and return rows
   */
  parseCSV(csvFilePath) {
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length <= 1) {
      return [];
    }

    // Skip header, parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = this.parseCSVLine(line);
      if (values && values.length > 0 && values[0]) {
        rows.push(values);
      }
    }

    return rows;
  }

  /**
   * Parse a single CSV line (handles quoted values with commas)
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  /**
   * Append leads to spreadsheet
   */
  async appendLeads(spreadsheetId, csvFilePath) {
    try {
      console.log(`📊 Reading leads from: ${path.basename(csvFilePath)}`);
      const rows = this.parseCSV(csvFilePath);

      if (rows.length === 0) {
        console.log('ℹ️  No leads to append');
        return 0;
      }

      console.log(`📤 Uploading ${rows.length} leads to Google Sheets...`);

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Leads!A2:M', // Start from row 2 (after headers)
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: rows,
        },
      });

      console.log(`✅ Successfully added ${rows.length} leads to Google Sheets!`);

      // Apply conditional formatting for Hot leads
      await this.applyConditionalFormatting(spreadsheetId);

      return rows.length;
    } catch (error) {
      console.error('❌ Error appending leads:', error.message);
      throw error;
    }
  }

  /**
   * Apply conditional formatting (color code by priority)
   */
  async applyConditionalFormatting(spreadsheetId) {
    try {
      // Get sheet ID
      const sheetMetadata = await this.sheets.spreadsheets.get({ spreadsheetId });
      const sheetId = sheetMetadata.data.sheets[0].properties.sheetId;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            // Hot leads - Red background
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [{ sheetId }],
                  booleanRule: {
                    condition: {
                      type: 'TEXT_CONTAINS',
                      values: [{ userEnteredValue: 'Hot' }],
                    },
                    format: {
                      backgroundColor: { red: 1, green: 0.8, blue: 0.8 },
                    },
                  },
                },
                index: 0,
              },
            },
            // Warm leads - Orange background
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [{ sheetId }],
                  booleanRule: {
                    condition: {
                      type: 'TEXT_CONTAINS',
                      values: [{ userEnteredValue: 'Warm' }],
                    },
                    format: {
                      backgroundColor: { red: 1, green: 0.95, blue: 0.8 },
                    },
                  },
                },
                index: 1,
              },
            },
          ],
        },
      });

      console.log('✅ Applied color coding (Hot = Red, Warm = Orange)');
    } catch (error) {
      // Conditional formatting may fail if already applied, ignore
      console.log('ℹ️  Skipped conditional formatting (may already exist)');
    }
  }

  /**
   * Main function to sync leads to Google Sheets
   */
  async syncLeads(csvFilePath, spreadsheetIdOverride = null) {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Google Sheets Auto-Sync - Eko Solar Leads                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Authorize
    const authorized = await this.authorize();
    if (!authorized) {
      process.exit(1);
    }

    // Get or create spreadsheet
    const spreadsheetId = spreadsheetIdOverride || await this.getOrCreateSpreadsheet();

    // Append leads
    const count = await this.appendLeads(spreadsheetId, csvFilePath);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ ${count} leads synced to Google Sheets!`);
    console.log(`🔗 View: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log('');

    return spreadsheetId;
  }

  /**
   * Get new access token (for initial setup)
   */
  async getNewToken() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES,
      });

      console.log('🔐 Authorize this app by visiting this URL:');
      console.log('');
      console.log(authUrl);
      console.log('');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) {
              console.error('❌ Error retrieving access token', err);
              reject(err);
              return;
            }

            // Save token
            const configDir = path.dirname(this.TOKEN_PATH);
            if (!fs.existsSync(configDir)) {
              fs.mkdirSync(configDir, { recursive: true });
            }

            fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(token));
            console.log('✅ Token stored to', this.TOKEN_PATH);
            resolve(token);
          });
        });
      });
    } catch (error) {
      console.error('❌ Error getting new token:', error.message);
      throw error;
    }
  }
}

// CLI usage
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args[0] === 'setup') {
    // Setup mode - get new token
    const integration = new GoogleSheetsIntegration();
    integration.getNewToken().then(() => {
      console.log('');
      console.log('✅ Setup complete! You can now sync leads to Google Sheets.');
      console.log('');
    }).catch(err => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
  } else if (args[0]) {
    // Sync mode - sync CSV file
    const csvFile = args[0];
    const spreadsheetId = args[1] || null;

    if (!fs.existsSync(csvFile)) {
      console.error(`❌ File not found: ${csvFile}`);
      process.exit(1);
    }

    const integration = new GoogleSheetsIntegration();
    integration.syncLeads(csvFile, spreadsheetId).catch(err => {
      console.error('Sync failed:', err);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  Setup:    node google-sheets-integration.js setup');
    console.log('  Sync:     node google-sheets-integration.js <csv-file> [spreadsheet-id]');
  }
}

export default GoogleSheetsIntegration;

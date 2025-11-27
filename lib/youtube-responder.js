/**
 * YouTube Comment Responder
 * Automatically replies to hot leads with helpful, personalized messages
 * Uses OAuth 2.0 to post comments on your behalf
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
const TOKEN_PATH = path.join(__dirname, '..', 'youtube-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'youtube-oauth.json');
const CONTACTED_LEADS_PATH = path.join(__dirname, '..', 'contacted-leads.json');

/**
 * YouTube Responder Class
 */
export class YouTubeResponder {
  constructor() {
    this.oauth2Client = null;
    this.youtube = null;
    this.contactedLeads = this.loadContactedLeads();
  }

  /**
   * Load list of leads we've already contacted
   */
  loadContactedLeads() {
    try {
      if (fs.existsSync(CONTACTED_LEADS_PATH)) {
        return JSON.parse(fs.readFileSync(CONTACTED_LEADS_PATH, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading contacted leads:', error.message);
    }
    return {};
  }

  /**
   * Save contacted lead to prevent duplicate replies
   */
  saveContactedLead(commentId, leadInfo) {
    this.contactedLeads[commentId] = {
      ...leadInfo,
      contactedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONTACTED_LEADS_PATH, JSON.stringify(this.contactedLeads, null, 2));
  }

  /**
   * Check if we've already contacted this lead
   */
  hasContacted(commentId) {
    return !!this.contactedLeads[commentId];
  }

  /**
   * Initialize OAuth client
   */
  async authorize() {
    // Load client secrets
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_id, client_secret, redirect_uris } = credentials.installed;

    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have a saved token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      this.oauth2Client.setCredentials(token);

      // Check if token is expired and refresh if needed
      if (token.expiry_date && token.expiry_date < Date.now()) {
        console.log('Token expired, refreshing...');
        const newToken = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(newToken.credentials);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken.credentials));
      }
    } else {
      // Need to get new token
      await this.getNewToken();
    }

    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get new OAuth token (requires user authorization)
   */
  async getNewToken() {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  YOUTUBE OAUTH AUTHORIZATION REQUIRED                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('To enable automatic comment replies, you need to authorize:');
    console.log('\n1. Open this URL in your browser:');
    console.log(`\n   ${authUrl}\n`);
    console.log('2. Sign in with your YouTube account');
    console.log('3. Click "Allow" to grant permission');
    console.log('4. Copy the authorization code from the browser');
    console.log('5. Paste it below\n');

    // For now, throw error - we'll handle this in dashboard
    throw new Error('OAuth authorization required. Please run: node lib/youtube-auth-setup.js');
  }

  /**
   * Generate helpful AI reply using Gemini
   */
  async generateReply(lead, yourContactInfo) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback to template if no AI
      return this.generateTemplateReply(lead, yourContactInfo);
    }

    const prompt = `You are a helpful solar energy expert. Someone left this comment on a YouTube video about solar panels:

COMMENT: "${lead.message}"

CONTEXT:
- They are in ${lead.location}
- Intent: ${lead.intent}
- Priority: ${lead.priority}

Generate a helpful, friendly reply that:
1. Answers their specific question or problem
2. Provides 1-2 actionable tips
3. Offers a free phone consultation (mention on-site visits have a truck roll fee, include contact info at end)
4. Keeps it under 150 words
5. Don't be salesy - provide genuine value first

CONTACT INFO TO INCLUDE:
${yourContactInfo.name ? `Name: ${yourContactInfo.name}` : ''}
${yourContactInfo.company ? `Company: ${yourContactInfo.company}` : ''}
${yourContactInfo.phone ? `Phone: ${yourContactInfo.phone}` : ''}
${yourContactInfo.email ? `Email: ${yourContactInfo.email}` : ''}
${yourContactInfo.website ? `Website: ${yourContactInfo.website}` : ''}

Reply:`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300
            }
          })
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return reply.trim();
    } catch (error) {
      console.error('AI reply generation failed:', error.message);
      return this.generateTemplateReply(lead, yourContactInfo);
    }
  }

  /**
   * Generate template reply (fallback if no AI)
   */
  generateTemplateReply(lead, contactInfo) {
    const templates = {
      'Repair/Service': `Hi! I saw your comment about solar panel issues. ${this.getQuickTip(lead.message)}

If you need help diagnosing or fixing your system, I offer free phone consultations in ${lead.location}. (On-site visits have a truck roll fee.) Feel free to reach out!

${contactInfo.phone ? `📞 ${contactInfo.phone}` : ''}
${contactInfo.email ? `📧 ${contactInfo.email}` : ''}
${contactInfo.company ? `${contactInfo.company}` : ''}`,

      'Installation': `Hi! I saw you're looking for solar installation info. ${this.getQuickTip(lead.message)}

I'd be happy to provide a free phone consultation about going solar in ${lead.location}. (On-site quotes have a truck roll fee.)

${contactInfo.phone ? `📞 ${contactInfo.phone}` : ''}
${contactInfo.email ? `📧 ${contactInfo.email}` : ''}
${contactInfo.company ? `${contactInfo.company}` : ''}`
    };

    return templates[lead.intent] || templates['Repair/Service'];
  }

  /**
   * Get quick tip based on their problem
   */
  getQuickTip(message) {
    const msg = message.toLowerCase();

    if (/inverter.*error|not working/.test(msg)) {
      return 'Quick tip: Try power cycling your inverter - turn off DC disconnect, wait 30s, turn back on. This fixes 50% of issues.';
    }
    if (/broken.*glass|crack/.test(msg)) {
      return 'Quick tip: Cracked glass doesn\'t always mean the panel is dead - test voltage first before replacing!';
    }
    if (/quote|cost|price/.test(msg)) {
      return 'Solar prices have dropped 50% in the last 5 years - great time to go solar!';
    }

    return 'Happy to help troubleshoot!';
  }

  /**
   * Post reply to YouTube comment
   */
  async replyToComment(commentId, replyText) {
    if (!this.youtube) {
      throw new Error('YouTube client not initialized. Call authorize() first.');
    }

    try {
      const response = await this.youtube.comments.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            parentId: commentId,
            textOriginal: replyText
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to post comment:', error.message);
      throw error;
    }
  }

  /**
   * Process a lead and reply if appropriate
   */
  async processLead(lead, contactInfo, autoReply = false) {
    // Extract comment ID from post URL
    const commentId = this.extractCommentId(lead.postUrl);

    if (!commentId) {
      console.log(`⚠️  Could not extract comment ID from: ${lead.postUrl}`);
      return { success: false, reason: 'No comment ID' };
    }

    // Check if already contacted
    if (this.hasContacted(commentId)) {
      console.log(`⏭️  Already contacted: ${lead.name}`);
      return { success: false, reason: 'Already contacted' };
    }

    // Only reply to Hot and Warm leads
    if (lead.priority === 'Cold') {
      console.log(`❄️  Skipping cold lead: ${lead.name}`);
      return { success: false, reason: 'Cold lead' };
    }

    try {
      // Generate AI-powered reply
      const replyText = await this.generateReply(lead, contactInfo);

      console.log(`\n💬 Generated reply for ${lead.name}:`);
      console.log(`   "${replyText.substring(0, 100)}..."`);

      if (autoReply) {
        // Post the reply
        await this.replyToComment(commentId, replyText);

        // Mark as contacted
        this.saveContactedLead(commentId, {
          name: lead.name,
          priority: lead.priority,
          intent: lead.intent,
          replyText: replyText
        });

        console.log(`✅ Posted reply to ${lead.name}`);
        return { success: true, reply: replyText };
      } else {
        // Return for manual approval
        return {
          success: false,
          reason: 'Awaiting approval',
          preview: replyText,
          commentId: commentId
        };
      }
    } catch (error) {
      console.error(`❌ Error processing ${lead.name}:`, error.message);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Extract comment ID from YouTube URL
   */
  extractCommentId(url) {
    const match = url.match(/[?&]lc=([^&]+)/);
    return match ? match[1] : null;
  }

  /**
   * Process batch of leads
   */
  async processBatch(leads, contactInfo, autoReply = false) {
    const results = {
      posted: 0,
      skipped: 0,
      awaitingApproval: 0,
      errors: 0
    };

    for (const lead of leads) {
      const result = await this.processLead(lead, contactInfo, autoReply);

      if (result.success) {
        results.posted++;
      } else if (result.reason === 'Awaiting approval') {
        results.awaitingApproval++;
      } else if (result.reason === 'Already contacted' || result.reason === 'Cold lead') {
        results.skipped++;
      } else {
        results.errors++;
      }

      // Rate limit: 1 comment per 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }
}

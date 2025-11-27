import fs from 'fs';
import { google } from 'googleapis';

const credentials = JSON.parse(fs.readFileSync('youtube-oauth.json', 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const code = '4/0Ab32j91GaVS7HDjfLIu9vsbuhhe8ep_EqGQk9bkNndLx8iM4H4KII-_FMKxtH3WTlN7spg';

try {
  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync('youtube-token.json', JSON.stringify(tokens, null, 2));
  console.log('✅ Authorization successful!');
  console.log('📁 Token saved to: youtube-token.json');
  console.log('\n🚀 You can now use the YouTube comment responder!');
  console.log('   Run: node reply-to-leads.js preview\n');
} catch (error) {
  console.error('❌ Error:', error.message);
}

# YouTube Lead Responder Guide

## What This Does

Automatically replies to hot solar leads found in YouTube comments with:
- AI-generated helpful advice (using Google Gemini)
- Your contact information for free consultation
- Personalized responses based on their specific problem
- Automatic duplicate prevention

---

## One-Time Setup

### Step 1: Update Your Contact Info

Edit `reply-to-leads.js` and update this section:

```javascript
const YOUR_CONTACT_INFO = {
  name: 'Your Name',
  company: 'Your Solar Company',
  phone: '(XXX) XXX-XXXX',
  email: 'your.email@example.com',
  website: 'https://yourcompany.com'
};
```

### Step 2: Authorize YouTube Access

Run the OAuth setup script:

```bash
node setup-youtube-auth.js
```

This will:
1. Open a browser with Google OAuth page
2. Ask you to sign in with your YouTube account
3. Request permission to post comments
4. Save authorization token for future use

---

## How to Use

### Preview Mode (Recommended First Time)

See what replies would be sent WITHOUT actually posting:

```bash
node reply-to-leads.js preview
```

This shows the first 5 AI-generated replies so you can verify they look good.

### Interactive Mode (RECOMMENDED)

Review and approve each reply before posting:

```bash
node reply-to-leads.js interactive
```

For each lead, you'll see:
- Their comment
- AI-generated reply
- Option to send (y), skip (n), or quit (q)

### Auto Mode (Advanced)

Automatically reply to ALL hot/warm leads:

```bash
node reply-to-leads.js auto
```

⚠️ **Use with caution!** This will post replies without your review.

---

## How It Works

### 1. Lead Qualification

Only replies to:
- **Hot leads**: Broken solar panels, urgent repairs (Priority: Hot)
- **Warm leads**: Looking for installers, quotes (Priority: Warm)
- **Skips Cold leads**: General questions, spam

### 2. AI Reply Generation

Uses Google Gemini to:
- Analyze their specific problem
- Provide 1-2 actionable tips
- Offer free consultation
- Include your contact info

### 3. Duplicate Prevention

Tracks all contacted leads in `contacted-leads.json`:
- Never replies to same person twice
- Prevents spam/harassment
- Maintains professional image

### 4. Rate Limiting

- 1 reply every 2 seconds
- Respects YouTube API limits
- Prevents account suspension

---

## Example Reply

**Their Comment:**
> "My inverter keeps showing error 028 and won't produce power. Anyone know how to fix this?"

**AI-Generated Reply:**
> Hi! I saw your comment about inverter error 028. Quick tip: Try power cycling your inverter - turn off DC disconnect, wait 30 seconds, then turn back on. This fixes about 50% of inverter errors.
>
> If that doesn't work, I offer free troubleshooting consultations in Georgia. Happy to help diagnose the issue!
>
> 📞 (555) 123-4567
> 📧 john@solarprosga.com
> Solar Pros Georgia

---

## Safety Features

✅ **No spam**: Never contacts same lead twice
✅ **Rate limited**: 1 reply per 2 seconds
✅ **Manual approval**: Interactive mode lets you review first
✅ **Professional**: AI generates helpful, non-salesy replies
✅ **Transparent**: All replies saved to contacted-leads.json

---

## Troubleshooting

### "OAuth authorization required"

Run: `node setup-youtube-auth.js`

### "No YouTube leads found"

Run the scraper first: `node scrape-leads.js Georgia`

### "Failed to post comment"

Check:
- Your YouTube account is authorized
- Token hasn't expired (re-run setup if needed)
- You're not rate-limited by YouTube

---

## Files Created

- `youtube-oauth.json` - OAuth credentials (DO NOT share)
- `youtube-token.json` - Access token (auto-refreshes)
- `contacted-leads.json` - Tracks all contacted leads
- `lib/youtube-responder.js` - Core responder logic

---

## Workflow Integration

### Manual Workflow

1. **Scrape leads**: `node scrape-leads.js Georgia`
2. **Preview replies**: `node reply-to-leads.js preview`
3. **Send replies**: `node reply-to-leads.js interactive`
4. **Track responses**: Check your YouTube notifications

### Automated Workflow (Advanced)

Add to your scraping job watcher to automatically reply after each session:

```javascript
// After scraping completes
if (totalLeads > 0) {
  console.log('\\n🤖 Auto-replying to hot leads...');
  execSync('node reply-to-leads.js auto', { stdio: 'inherit' });
}
```

---

## Best Practices

1. **Start with Interactive Mode**
   - Review first 10-20 replies manually
   - Verify AI responses are appropriate
   - Adjust contact info if needed

2. **Monitor Response Rate**
   - Track how many people respond
   - Adjust reply template if low response
   - A/B test different approaches

3. **Be Helpful First**
   - Provide actual value (quick tips)
   - Don't be pushy or salesy
   - Build trust before selling

4. **Respond Quickly to Replies**
   - Check YouTube notifications daily
   - Respond within 24 hours
   - Convert interested leads to phone calls

---

## Ethical Considerations

This tool is designed to:
- ✅ Help people who publicly asked for solar help
- ✅ Provide genuine value (actionable advice)
- ✅ Offer free consultations (not spam)
- ✅ Respect privacy (only reply to public comments)

DO NOT:
- ❌ Reply to irrelevant comments
- ❌ Spam the same person multiple times
- ❌ Use misleading or false claims
- ❌ Violate YouTube's Terms of Service

---

## Support

Questions? Issues?
- Check `contacted-leads.json` to see reply history
- Review AI-generated replies in preview mode first
- Test with preview mode before auto mode

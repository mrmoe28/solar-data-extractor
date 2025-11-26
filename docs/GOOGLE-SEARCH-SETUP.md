# Google Custom Search API Setup Guide

## Why This Matters
Google Custom Search API is our **most powerful non-Reddit source** because it:
- Searches the ENTIRE web (not just one platform)
- Doesn't require browser automation (no anti-bot blocking)
- Free tier: 100 searches/day (plenty for lead generation)
- Finds leads on Reddit, Quora, forums, Facebook, Nextdoor, etc.

## Current Status
✅ API Key configured: `AIzaSyBSOtI4vk1Q2uJtCxguKMSx7btwGqrFWIg`
❌ Search Engine ID: Not configured yet

## Setup Instructions (5 minutes)

### Step 1: Create Custom Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)

2. Fill in the form:
   - **Name**: "Solar Lead Finder"
   - **What to search**: Select "Search the entire web"
   - **Advanced settings** (optional):
     - **Language**: English
     - **Search features**: Turn on "Image search" and "Safe search"

3. Click **Create**

4. You'll see a success message with your Search Engine ID (looks like: `017576662512468239146:omuauf_lfve`)

### Step 2: Copy Search Engine ID

1. On the control panel, find your search engine
2. Click **Setup** → **Basic**
3. Copy the **Search engine ID** (under "Search engine ID")

### Step 3: Add to Environment Variables

**Local (.env file)**:
```bash
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id-here
```

**Vercel Dashboard**:
1. Go to: https://vercel.com/ekoapps/eko-lead-dashboard/settings/environment-variables
2. Add new variable:
   - **Key**: `GOOGLE_SEARCH_ENGINE_ID`
   - **Value**: Your search engine ID from step 2
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**
4. Redeploy: `vercel --prod`

### Step 4: Test the Search

Run the scraper with web search enabled:
```bash
node scrape-leads.js "Georgia"
```

You should see:
```
🔍 Searching Google/Bing for solar leads...
  Searching: "need solar installer" Georgia site:reddit.com...
  Found X potential leads
```

## Expected Results

With 100 free searches/day, you can run:
- **8 search queries** per scrape (configured in web-search-scraper.js)
- **12 scrapes per day** (8 queries × 12 = 96 searches)

Each search typically finds 2-5 leads, so:
- **20-40 leads per scrape** from Google Search
- **240-480 leads per day** if running hourly

## What It Searches

The scraper searches these patterns across the entire web:
```javascript
// Installation requests
"need solar installer" Georgia site:reddit.com OR site:facebook.com OR site:nextdoor.com
"looking for solar installer" Georgia inurl:forum OR inurl:community
"solar installation quote" Georgia site:homeadvisor.com OR site:angieslist.com

// Repair/troubleshooting (HOT leads!)
"solar panel not working" Georgia site:reddit.com OR site:quora.com
"solar repair" Georgia inurl:question OR inurl:ask
"solar panel broken" Georgia site:reddit.com

// Recommendations
"solar installer recommendation" Georgia site:quora.com OR site:reddit.com
"best solar company" Georgia site:yelp.com OR site:bbb.org
```

## Pricing

- **Free tier**: 100 queries/day (permanently)
- **Paid tier**: $5/1000 queries (if you need more than 100/day)

## Support

If you get errors:
1. Check that both API key AND engine ID are in `.env`
2. Verify the API key is active: https://console.cloud.google.com/apis/credentials
3. Make sure "Custom Search API" is enabled: https://console.cloud.google.com/apis/library/customsearch.googleapis.com

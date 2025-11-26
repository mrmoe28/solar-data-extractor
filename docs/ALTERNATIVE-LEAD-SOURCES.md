# Alternative Lead Sources Research Report

## Executive Summary

Current issue: System is 97% dependent on Reddit. Need diversification.

**Quick Wins Available:**
1. ✅ Google Custom Search - API key configured, just need engine ID (5 min setup)
2. ✅ Craigslist RSS - Already implemented, needs testing
3. ✅ BBB API - Official API available, can find Q&A on solar companies
4. ✅ City-Data Forums - RSS feeds available for local discussions

**Paid Options (Require Approval):**
- BuildZoom API - $$ for bulk permit data
- Lead aggregation services - $$$ per lead

## Detailed Analysis

### 1. Google Custom Search API ⭐ TOP PRIORITY

**Status**: API key configured, needs Search Engine ID
**Cost**: Free (100 searches/day)
**Lead Quality**: HIGH (finds leads across entire web)
**Contact Info**: Varies (depends on source)
**Setup Time**: 5 minutes

**How it works**:
- Searches Reddit, Facebook, Nextdoor, Quora, forums, etc.
- No browser automation (no anti-bot issues)
- Returns structured JSON data
- Already implemented in `web-search-scraper.js`

**Expected Results**:
- 20-40 leads per scrape
- Mix of installation + repair requests
- Some with contact info, others need DM/outreach

**Action Required**:
1. Create Search Engine ID at: https://programmablesearchengine.google.com/controlpanel/create
2. Add to `.env`: `GOOGLE_SEARCH_ENGINE_ID=your-id-here`
3. Test with: `node scrape-leads.js "Georgia"`

---

### 2. Craigslist RSS Feeds ⭐ IMPLEMENTED

**Status**: Already implemented in `craigslist-scraper.js`
**Cost**: Free
**Lead Quality**: VERY HIGH (Craigslist = immediate need)
**Contact Info**: Often includes phone/email
**Setup Time**: 0 minutes (already done)

**How it works**:
- Uses official RSS feeds (no scraping, no blocking)
- Searches "services wanted" category
- Finds people posting requests for solar work
- Extracts contact info from post text

**Expected Results**:
- 0-5 leads per scrape (depends on location activity)
- HIGH conversion rate (Craigslist = ready to hire)
- Usually includes contact info

**Current URLs**:
```
https://atlanta.craigslist.org/search/wan?query=solar&sort=date&format=rss
https://savannah.craigslist.org/search/wan?query=solar&sort=date&format=rss
https://augusta.craigslist.org/search/wan?query=solar&sort=date&format=rss
```

**Action Required**:
- Test current implementation
- Consider expanding to more cities

---

### 3. BBB (Better Business Bureau) API ⭐ NEW SOURCE

**Status**: Official API available
**Cost**: Free tier available (requires registration)
**Lead Quality**: MEDIUM-HIGH (Q&A from people researching)
**Contact Info**: No (anonymous Q&A)
**Setup Time**: 30 minutes

**How it works**:
- BBB API provides organization search
- Find solar companies in target area
- Scrape Q&A sections on business profiles
- People asking about cost, recommendations, repairs

**API Endpoints**:
```
Organization Search: https://api.bbb.org/api/orgs/search
Organization Details: https://api.bbb.org/api/orgs/{id}
```

**Expected Results**:
- 5-15 leads per scrape
- Questions about cost, recommendations, service quality
- Anonymous (no direct contact info)
- Need manual outreach or remarketing

**Action Required**:
1. Register at: https://developer.bbb.org/
2. Get API key
3. Implement scraper for Q&A sections
4. Add to workflow

---

### 4. BuildZoom Permit Data API 💰 PAID

**Status**: Requires paid subscription
**Cost**: Contact for pricing (likely $$$$)
**Lead Quality**: EXTREME (permit = buying NOW)
**Contact Info**: Yes (property owner info)
**Setup Time**: 1-2 weeks (account setup + integration)

**How it works**:
- Access to 350M+ building permits
- Filter by: solar installation, location, date range
- Get homeowner name, address, phone, system size
- These are CONFIRMED buyers (already got permit)

**Expected Results**:
- 50-200 permits per month (Georgia)
- 100% installation intent (permit filed)
- Complete contact info
- Can reach out before installation starts

**Concerns**:
- Expensive (likely $500-2000/month)
- Need approval for paid service
- May overlap with existing `permit-scraper.js`

**Action Required**:
- Get pricing quote from BuildZoom
- Compare with manual county permit scraping
- Decide if ROI justifies cost

---

### 5. City-Data Forums RSS ⭐ NEW SOURCE (FREE)

**Status**: Not implemented
**Cost**: Free
**Lead Quality**: MEDIUM (research phase)
**Contact Info**: Usernames only (need DM)
**Setup Time**: 1 hour

**How it works**:
- City-Data has forums for every city
- RSS feeds for new posts/threads
- Search for solar installation/repair discussions
- Similar to Reddit but more local

**Example URLs**:
```
https://www.city-data.com/forum/rss/atlanta-171.xml
https://www.city-data.com/forum/rss/savannah-184.xml
```

**Expected Results**:
- 2-8 leads per scrape
- Local homeowners asking for recommendations
- No direct contact (need to DM via forum)

**Action Required**:
- Implement RSS feed scraper
- Test with major Georgia cities
- Add to workflow

---

### 6. Local Newspaper Classifieds (RSS) 💡 IDEA

**Status**: Not implemented
**Cost**: Free
**Lead Quality**: HIGH (people posting ads = ready to hire)
**Contact Info**: Often included
**Setup Time**: 2 hours

**How it works**:
- Many newspapers have RSS feeds for classifieds
- "Services wanted" or "Home improvement" sections
- People post requests for contractors
- Similar to Craigslist but less volume

**Example Newspapers**:
```
Atlanta Journal-Constitution
Savannah Morning News
Augusta Chronicle
```

**Expected Results**:
- 0-3 leads per scrape (low volume)
- Very high intent (posting ad = serious)
- Often includes contact info

**Action Required**:
- Research which newspapers have RSS feeds
- Implement scraper
- Test across multiple papers

---

### 7. Nextdoor Neighborhoods (Paid API) 💰

**Status**: No public API
**Cost**: Contact Nextdoor Business
**Lead Quality**: VERY HIGH (local + verified residents)
**Contact Info**: Profiles only (need DM)
**Setup Time**: Unknown

**Current Status**:
- Nextdoor has no public API
- "Nextdoor Business" product for advertisers
- Likely requires paid sponsorship
- Browser automation gets blocked

**Action Required**:
- Contact Nextdoor Business for API access
- May not be available for lead scraping
- Consider manual monitoring instead

---

### 8. Perplexity AI Search API ⚠️ WAITING

**Status**: Implemented, waiting for API key
**Cost**: $0.20-$5 per 1M tokens (pay-as-you-go)
**Lead Quality**: VARIABLE (AI-filtered web results)
**Contact Info**: Varies
**Setup Time**: 5 minutes (once key obtained)

**How it works**:
- AI searches billions of web pages
- Filters and extracts relevant lead mentions
- Returns citations with sources
- Already implemented in `perplexity-scraper.js`

**Action Required**:
- User needs to get API key from: https://www.perplexity.ai/api-platform
- Add to `.env`: `PERPLEXITY_API_KEY=pplx-...`
- Test and monitor costs

---

## Recommended Action Plan

### Phase 1: Quick Wins (This Week)

1. ✅ **Set up Google Custom Search Engine** (5 min)
   - Create engine ID
   - Add to `.env` and Vercel
   - Test immediately

2. ✅ **Test Craigslist RSS** (10 min)
   - Already implemented, just verify it works
   - Expand to more cities if successful

3. 💡 **Implement City-Data RSS** (1 hour)
   - Create new scraper for City-Data forums
   - Test with Atlanta, Savannah, Augusta

### Phase 2: API Integration (Next Week)

4. 🔑 **Register for BBB API** (30 min)
   - Get API key from developer.bbb.org
   - Implement Q&A scraper
   - Test with Georgia solar companies

5. 📰 **Research Newspaper RSS** (2 hours)
   - Find which newspapers offer RSS
   - Implement classified section scraper
   - Test volume and quality

### Phase 3: Paid Options (Requires Approval)

6. 💰 **BuildZoom Quote** (1 week)
   - Contact BuildZoom for pricing
   - Compare with manual permit scraping
   - Calculate ROI

7. 💰 **Perplexity API** (when user ready)
   - User gets API key
   - Test and monitor costs
   - Evaluate quality vs. Google Search

---

## Diversification Summary

**Current State**:
- Reddit: 34 leads (97%)
- Incentives: 1 lead (3%)

**After Quick Wins**:
- Reddit: 30-40 leads (50%)
- Google Search: 20-40 leads (30%)
- Craigslist: 2-5 leads (5%)
- City-Data: 2-8 leads (5%)
- Incentives: 1-2 leads (2%)
- Permits: 2-5 leads (5%)
- BBB: 5-10 leads (3%)

**Total**: 60-110 leads per scrape (vs. 35 currently)

---

## Contact Info Breakdown

**Sources WITH Contact Info**:
- Craigslist (phone/email often included)
- Permits (property records)
- BuildZoom (property owner data)
- Some web search results

**Sources WITHOUT Contact Info** (need DM/outreach):
- Reddit (DM automation implemented)
- BBB Q&A (anonymous)
- City-Data forums (need forum DM)
- Most web search results

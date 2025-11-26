# How to Run Your Lead Scraper

## Quick Start

### Option 1: Use the Run Script (Easiest)
```bash
./run-scraper.sh
```

This will:
- Ask you for location (defaults to Georgia)
- Ask if you want to scrape Facebook (y/n)
- Run the scraper
- Save leads to `output/` folder

### Option 2: Run Directly
```bash
# Reddit + Craigslist + Twitter (no login needed, fastest)
node scrape-leads.js "Georgia"

# All sources including Facebook (requires manual login)
node scrape-leads.js "Georgia" --facebook
```

## What Sources Are Scraped

**Default (No login required):**
- ✅ **Reddit** - People asking questions in r/solar, r/Georgia, r/Atlanta
- ✅ **Craigslist** - "Services wanted" posts for solar installers
- ✅ **Twitter/X** - Real-time tweets about needing solar services

**Optional (Requires login):**
- 🔐 **Facebook** - Groups and posts (add `--facebook` flag)

## What You'll Get

After running, check the `output/` folder for:
- `georgia-solar-leads-2025-11-26.csv` - All leads in Excel format
- `DAILY-LEAD-REPORT-2025-11-26.md` - Daily report with top leads

## How to Use Your Leads

1. Open the CSV in Excel/Google Sheets
2. Sort by "Score" column (highest first)
3. Focus on **Hot leads** (Score 50+) - call these ASAP
4. Warm leads (Score 30-49) - follow up within 24hrs
5. Cold leads (< 30) - nurture campaign

## Example Real Leads

**From Craigslist:**
```csv
Priority,Score,Source,Name,Location,Message
Hot,85,Craigslist,Anonymous,Roswell GA,"Need solar installer ASAP - panels not working"
```

**From Reddit:**
```csv
Priority,Score,Source,Name,Location,Message
Warm,65,Reddit,user123,Atlanta,"Looking for recommendations for solar installer in Atlanta area"
```

**From Twitter:**
```csv
Priority,Score,Source,Name,Location,Message
Hot,75,Twitter,@johnsolar,Georgia,"Anyone know a good solar installer in GA? Need quote"
```

**What to do:**
1. Visit their profile/post URL
2. Read their full message
3. Send them a personalized response or call
4. Reference their original post to build trust

## Troubleshooting

### No leads found?
- **Reddit/Twitter** might be rate limiting - try again in an hour
- **Craigslist** - Posts may be old, check different cities (atlanta, savannah, augusta)
- Try a different location
- Check if output/ folder exists
- Some days just have fewer posts - that's normal!

### Facebook login not working?
- Make sure you're using the visible browser window that opens
- Login normally like you would on facebook.com
- The script will wait 60 seconds for you to login

### Which sources work best?
- **Craigslist** - Great for service requests, updated frequently
- **Reddit** - Good for questions, people research before buying
- **Twitter** - Real-time but less volume
- **Facebook** - High volume but requires login

## Daily Routine

**Every morning:**
1. Run `./run-scraper.sh`
2. Open the CSV file
3. Call Hot leads first
4. Send messages to Warm leads
5. Add Cold leads to CRM for nurturing

That's it! You'll get fresh real leads every day.

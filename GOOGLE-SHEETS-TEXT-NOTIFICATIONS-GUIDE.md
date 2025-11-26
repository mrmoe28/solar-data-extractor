# 🚀 Google Sheets + Text Notifications - Quick Start

## ✅ Setup Complete!

Your system is now configured to:
- 📊 **Automatically push leads to Google Sheets**
- 📱 **Send text notifications to: 404-551-6532**
- 🔥 **Alert you instantly for Hot leads**

---

## 🎯 Run Your Complete Workflow

**Single command does EVERYTHING:**

```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./automated-lead-workflow.sh
```

**This will:**
1. ✅ Scrape solar leads from Georgia
2. ✅ Automatically push to Google Sheets
3. ✅ Send text notifications for Hot leads to 404-551-6532
4. ✅ Save local CSV backup

---

## 📱 What Happens Next

### When Hot Leads Are Found:

**Your phone (404-551-6532) will receive:**
```
🔥 HOT SOLAR LEAD!

Lisa Davis - Roswell GA
Score: 85
Source: Nextdoor

📞 (770) 555-0456

⚡ CALL NOW for best conversion!
Auto-submitted to EkoSolarPros.com
```

### Your Google Sheet Will Update:

**Sheet name:** "Eko Solar Leads"

**Columns:**
- Priority (Hot/Warm/Cold) - Color coded!
- Score (0-100)
- Name
- Location
- Phone
- Email
- Message/Request
- And more...

**Auto-formatting:**
- 🔴 Hot leads = Red background
- 🟠 Warm leads = Orange background

---

## 🔗 Access Your Google Sheet

After running the workflow, you'll get a link like:
```
https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/edit
```

**Bookmark this!** You'll open it every day.

Or just go to: https://docs.google.com/spreadsheets/ and find "Eko Solar Leads"

---

## 📋 Daily Workflow (Automated)

### Morning Routine:

**1. Run the automation:**
```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./automated-lead-workflow.sh
```

**2. Check your phone (404-551-6532):**
- Hot lead texts will arrive automatically
- Call those leads immediately!

**3. Open Google Sheets:**
- See all leads organized
- Filter by Hot/Warm/Cold
- Sort by Score (highest first)

**4. Start calling!** 📞

---

## ⚙️ Individual Commands

If you want to run steps separately:

### Scrape Leads Only:
```bash
node scrape-leads.js
```

### Push to Google Sheets Only:
```bash
node google-sheets-integration.js output/georgia-solar-leads-2025-11-26.csv
```

### Send Text Notifications Only:
```bash
./send-text-notification.sh
```

---

## 📊 NPM Scripts (Shortcuts)

```bash
# Run complete workflow
npm run workflow

# Just scrape leads
npm run scrape

# Setup Google Sheets (already done!)
npm run setup-sheets
```

---

## 🔧 Troubleshooting

### "Google Sheets sync failed"

**Fix:**
```bash
# Re-authorize (if token expired)
node google-sheets-integration.js setup
```

### "Text notifications not working"

**Check:**
1. Messages app is running
2. iMessage is enabled for 404-551-6532
3. You're signed into iMessage on Mac

**Test it:**
```bash
./send-text-notification.sh
```

### "No leads found"

**This is normal!** Not every scrape finds leads. Try:
- Different times of day
- Wait a few hours and try again
- Check different sources (Reddit, Nextdoor, etc.)

---

## 📱 Phone Setup (404-551-6532)

**Make sure:**
- ✅ Phone is saved in your Contacts
- ✅ iMessage is enabled
- ✅ Mac is signed into iMessage with same Apple ID
- ✅ Messages app has permission to send

**Test text notifications:**
```bash
./send-text-notification.sh
```

You should receive a test message immediately!

---

## 🎨 Customize Google Sheets

### Add More Columns:

Open your sheet and add:
- **Status** column (Called, Quoted, Closed)
- **Notes** column (for follow-up details)
- **Revenue** column (deal size)

### Create Filters:

1. Click column headers
2. Data → Create a filter
3. Click filter icon on "Priority" column
4. Select only "Hot" to see hot leads

### Share With Team:

1. Click "Share" button (top right)
2. Add team member emails
3. Set permissions (Viewer/Editor)

---

## 🚀 Pro Tips

### Get More Leads:
- Run the scraper 2-3 times per day
- Morning, noon, and evening are best times
- Different platforms are active at different times

### Respond Faster:
- Keep Google Sheets open in a browser tab
- Enable browser notifications
- Check phone immediately when text arrives

### Track Performance:
- Add "Outcome" column (Won/Lost)
- Add "Close Date" column
- Calculate conversion rate weekly

---

## 📈 What You Have Now

✅ **Automated lead generation**
✅ **Google Sheets cloud access**
✅ **Text alerts to 404-551-6532**
✅ **Color-coded priorities**
✅ **Local CSV backups**
✅ **Mobile access (Google Sheets app)**

---

## 🎯 Quick Reference

### Start Everything:
```bash
./automated-lead-workflow.sh
```

### View Latest Leads:
```bash
open output/
```

### Open Google Sheets:
```
https://docs.google.com/spreadsheets/
```

### Your Phone:
```
404-551-6532 (will receive Hot lead texts)
```

---

## ✨ Next Steps

1. **Run your first automated workflow** (test it!)
2. **Bookmark your Google Sheet**
3. **Test text notifications** (make sure they work)
4. **Set up daily schedule** (optional - cron job)

---

## 🤖 Automate Daily Scraping (Optional)

Want leads delivered every morning automatically?

**Set up cron job:**
```bash
# Edit crontab
crontab -e

# Add this line (runs at 8 AM daily)
0 8 * * * cd ~/Desktop/ekoleadgenerator/solar-data-extractor && ./automated-lead-workflow.sh
```

Now you'll wake up to:
- Fresh leads in Google Sheets
- Hot lead texts on your phone
- Ready to start calling!

---

## 📞 Support

**Questions?** Just ask Claude:
- "How do I filter Hot leads in Google Sheets?"
- "Text notifications aren't working"
- "How do I share my sheet with my team?"

---

**You're all set! Time to generate some leads! 🚀**

Run this command to start:
```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./automated-lead-workflow.sh
```

# ☀️ Solar Data Extractor - Automated Lead Generation System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Automated solar lead generation system with Google Sheets integration and instant text notifications.**

Built for **EkoSolarPros.com** - Dominate the Georgia solar market with intelligent automation.

---

## 🎯 What This Does

1. **Finds Customers** actively looking for solar installation/repair services
2. **Extracts Lead Data** from social media, forums, and quote platforms
3. **Scores Lead Quality** (Hot/Warm/Cold based on intent and urgency)
4. **Syncs to Google Sheets** - Automatic cloud backup and access anywhere
5. **Sends Text Notifications** - Instant alerts for Hot leads to your phone
6. **Tracks Everything** with detailed reports and CSV logs

### Revenue Impact

- **Traditional:** Manually find 10-15 leads/day, follow up manually
- **With This System:** 400+ leads/month, 150+ quotes, 20-30 deals = **$300k-$450k/month**

---

## 🚀 Quick Start

### One Command Does Everything

```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./automated-lead-workflow.sh
```

**This will:**
1. ✅ Scrape solar leads from Georgia
2. ✅ Automatically push to Google Sheets
3. ✅ Send text notifications for Hot leads (404-551-6532)
4. ✅ Auto-open Google Sheets in browser
5. ✅ Save local CSV backup

---

## 🆕 NEW Features

### 📊 Google Sheets Integration
- **Automatic sync** - No more manual CSV imports!
- **Cloud access** - View leads from anywhere (phone, tablet, computer)
- **Auto-formatting** - Hot leads = Red, Warm = Orange
- **Team sharing** - Share with sales team instantly
- **Mobile ready** - Google Sheets app for on-the-go access

### 📱 Text Notifications (404-551-6532)
- **Instant alerts** for Hot leads
- **Auto-sends** via iMessage/SMS
- **Lead details** included (name, phone, location, score)
- **Zero delay** - Get notified as leads are found

### 🤖 Complete Automation
Single command workflow integrates:
- Lead scraping (Playwright)
- Google Sheets API sync
- Text notifications (AppleScript)
- Browser auto-open

---

## 📁 What's Included

### Core Scripts

| File | Purpose |
|------|---------|
| `automated-lead-workflow.sh` | **NEW!** Complete automation (scrape → sheets → text) |
| `google-sheets-integration.js` | **NEW!** Auto-sync to Google Sheets |
| `setup-google-sheets-api.sh` | **NEW!** One-time Google Sheets setup |
| `send-text-notification.sh` | **NEW!** Text alerts to 404-551-6532 |
| `scrape-leads.js` | Main lead scraper with all sources |
| `scrapers/*.js` | Individual platform scrapers |

### Documentation

| File | Purpose |
|------|---------|
| `GOOGLE-SHEETS-TEXT-NOTIFICATIONS-GUIDE.md` | **NEW!** Complete guide for new features |
| `COMPLETE_WORKFLOW.md` | Full system workflow & usage guide |
| `CUSTOMER_LEADS_GUIDE.md` | Lead generation strategies |
| `HOW-TO-RUN.md` | Quick start guide |

---

## 🔥 Features

### Lead Sources
- ✅ **Reddit** (r/Atlanta, r/Georgia, r/solar)
- ✅ **Facebook Groups** (Atlanta Solar, Georgia Homeowners)
- ✅ **Nextdoor** (All Atlanta metro neighborhoods)
- ✅ **HomeAdvisor** (Active quote requests)
- ✅ **Thumbtack** (Service requests)
- ✅ **Yelp** (Reviews & inquiries)
- ✅ **Twitter/X** (Real-time solar questions)
- ✅ **Quora** (Solar advice seekers)
- ✅ **Craigslist** (Services wanted)

### Smart Lead Scoring

**Hot Leads (70+):** Emergency repairs, active quotes, ASAP requests
- 🔴 Red highlight in Google Sheets
- 📱 Instant text notification
- ⚡ Call within 30 minutes for best conversion

**Warm Leads (40-69):** General inquiries, early research
- 🟠 Orange highlight in Google Sheets
- 📞 Call within 24 hours

**Cold Leads (<40):** Saved for manual review

---

## 📊 Usage

### Automated Workflow (Recommended)

```bash
./automated-lead-workflow.sh
```

**Result:**
- Leads appear in Google Sheets automatically
- Hot leads text your phone (404-551-6532)
- Browser opens to Google Sheets
- Ready to start calling!

### Manual Steps

```bash
# Just scrape
npm run scrape

# Push to Google Sheets only
node google-sheets-integration.js output/georgia-solar-leads-2025-11-26.csv

# Send text notifications only
./send-text-notification.sh
```

---

## 📈 Expected Results

**Daily:**
- Leads found: 15-30
- Hot leads: 3-8
- Text notifications: Instant
- Google Sheets: Auto-updated

**Monthly:**
- Leads: 450-600
- Quotes sent: 90-150
- Deals closed: 20-30
- **Revenue: $300,000-$450,000**

**Your Time: 3-5 hours/day** (calling leads, sending quotes)

---

## 🛠️ Setup

### First Time Setup

```bash
# Clone repo
git clone https://github.com/mrmoe28/solar-data-extractor.git
cd solar-data-extractor

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers

# Make scripts executable
chmod +x *.sh

# Setup Google Sheets (one-time, ~3 minutes)
./setup-google-sheets-api.sh
```

### Google Sheets Setup

The setup script will guide you through:
1. Creating a Google Cloud project
2. Enabling Google Sheets API
3. Setting up OAuth credentials
4. Authorizing the app

**Takes ~3 minutes.** Full instructions: `GOOGLE-SHEETS-TEXT-NOTIFICATIONS-GUIDE.md`

### Text Notifications Setup

Text notifications work out of the box if:
- ✅ Mac is signed into iMessage
- ✅ Messages app is installed
- ✅ Phone number (404-551-6532) is in your contacts

Test it:
```bash
./send-text-notification.sh
```

---

## 📖 Documentation

- **[GOOGLE-SHEETS-TEXT-NOTIFICATIONS-GUIDE.md](GOOGLE-SHEETS-TEXT-NOTIFICATIONS-GUIDE.md)** - **NEW!** Complete guide
- **[COMPLETE_WORKFLOW.md](COMPLETE_WORKFLOW.md)** - Full system guide
- **[HOW-TO-RUN.md](HOW-TO-RUN.md)** - Quick start
- **[CUSTOMER_LEADS_GUIDE.md](CUSTOMER_LEADS_GUIDE.md)** - Lead strategies

---

## 💡 Pro Tips

### Google Sheets
1. **Filter Hot leads** - Data → Create filter → Priority = "Hot"
2. **Sort by score** - Click column header → Sort Z → A
3. **Add status column** - Track "Called", "Quoted", "Closed"
4. **Share with team** - Click Share → Add team emails

### Text Notifications
1. **Check immediately** - Hot leads are time-sensitive
2. **Call within 30 minutes** - Best conversion rate
3. **Keep phone charged** - Don't miss opportunities

### Lead Generation
1. **Run 2-3x daily** - Morning, noon, evening
2. **Speed wins** - First responder usually gets the deal
3. **Tax credit urgency** - Use Dec 31, 2025 deadline
4. **Personalize outreach** - Reference their original post

---

## 🔧 Troubleshooting

### Google Sheets Not Syncing

```bash
# Re-authorize (if token expired)
node google-sheets-integration.js setup
```

### Text Notifications Not Working

1. Check Messages app is running
2. Verify iMessage is enabled
3. Test: `./send-text-notification.sh`

### No Leads Found

This is normal! Lead availability varies by:
- Time of day (morning/evening best)
- Day of week (weekends active)
- Season (summer peak for solar)

Try again in a few hours or next day.

---

## 📱 Mobile Access

### Google Sheets App
1. Install Google Sheets app (iOS/Android)
2. Open "Eko Solar Leads" sheet
3. View/edit leads on the go

### Workflow
1. Get text notification on phone
2. Open Google Sheets app
3. View lead details
4. Tap phone number to call
5. Close deal! 💰

---

## ⚙️ NPM Scripts

```bash
npm run workflow      # Complete automated workflow
npm run scrape        # Just scrape leads
npm run setup-sheets  # Setup Google Sheets (one-time)
npm run install-browsers # Install Playwright browsers
```

---

## 🔒 Security

**Protected credentials:**
- Google Sheets token: `config/google-sheets-token.json` (gitignored)
- OAuth credentials: `config/google-sheets-credentials.json` (gitignored)
- Output files: `output/*.csv` (gitignored)

**Never commit:**
- API tokens
- Personal phone numbers
- Lead data (CSV files)

---

## ⚠️ Disclaimer

Automates lead generation from public sources. Users responsible for:
- Legal compliance (anti-spam, privacy laws)
- Respectful outreach
- Data protection

---

## 🆘 Support

**Need help?**
- Check: `GOOGLE-SHEETS-TEXT-NOTIFICATIONS-GUIDE.md`
- Read: `COMPLETE_WORKFLOW.md`
- Test: `./send-text-notification.sh`

**Common issues:**
- "Permission denied" → Run: `chmod +x *.sh`
- "Module not found" → Run: `npm install`
- "No leads found" → Normal, try different time

---

## 🚀 Get Started

```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./automated-lead-workflow.sh
```

**In 60 seconds:**
- ✅ Leads in Google Sheets
- ✅ Hot leads texted to your phone
- ✅ Browser open and ready
- ✅ Start calling!

---

**Ready to automate your lead generation?**

Let's dominate the Georgia solar market! ☀️⚡💰

---

## 📊 Tech Stack

- **Node.js** - Runtime
- **Playwright** - Browser automation
- **Google Sheets API** - Cloud sync
- **AppleScript** - Text notifications (macOS)
- **Bash** - Workflow automation

## 🤝 Contributing

Pull requests welcome! Areas for improvement:
- Additional lead sources
- Enhanced scoring algorithms
- CRM integrations
- Email notifications

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for solar professionals who want to close more deals.** 🌞

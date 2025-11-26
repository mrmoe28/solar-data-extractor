# 📁 Where Are My Leads Stored?

## 🎯 Quick Answer

**All leads are saved in:**
```
~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

**Full path:**
```
/Users/ekodevapps/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

---

## 📊 What Gets Saved

### 1. ALL LEADS (CSV) - Import to Excel/CRM

**Filename Format:**
```
demo-georgia-leads-YYYY-MM-DD.csv
```

**Example:**
```
demo-georgia-leads-2025-11-25.csv
```

**What's In It:**
- ALL leads found (Hot, Warm, Cold)
- Complete contact information
- Lead scores and priorities
- Source platform
- Original post links
- Timestamps

**Open With:**
- Excel
- Google Sheets
- Your CRM (import CSV)
- Any spreadsheet software

**Columns:**
```
Source, Name, Location, Message, Phone, Email, ProfileUrl,
PostUrl, Timestamp, Priority, Score, Intent
```

---

### 2. QUALIFIED LEADS (CSV) - What Was Submitted

**Filename Format:**
```
qualified-leads-for-submission-YYYY-MM-DD.csv
```

**Example:**
```
qualified-leads-for-submission-2025-11-25.csv
```

**What's In It:**
- ONLY leads that were auto-submitted to your form
- Score 40+ (Hot & Warm leads)
- Reason why each qualified
- Full submission details

**Use This For:**
- Track what went to your website
- Follow-up list
- ROI tracking

---

### 3. DAILY REPORT (Markdown) - Human-Readable Summary

**Filename Format:**
```
DAILY-LEAD-REPORT-YYYY-MM-DD.md
```

**Example:**
```
DAILY-LEAD-REPORT-2025-11-25.md
```

**What's In It:**
- Executive summary
- Top 5 hottest leads (with full details)
- Revenue potential estimates
- Action items prioritized
- Performance metrics
- Lead source breakdown

**Open With:**
- Any text editor
- VSCode
- GitHub (looks beautiful)
- Preview app on Mac

---

### 4. SUBMISSION LOG (CSV) - Tracking History

**Filename:**
```
form-submissions.csv
```

**What's In It:**
- Cumulative log of ALL submissions
- Success/failure status
- Timestamps
- Lead source attribution
- Error messages (if any)

**Columns:**
```
Timestamp, Source, Name, Location, Priority, Score,
Success, Error, Profile URL
```

**Use This For:**
- Track submission success rate
- Debug form issues
- Historical performance

---

### 5. MARKET INTELLIGENCE (Markdown) - Research Reports

**Filename Format:**
```
LIVE-MARKET-INTELLIGENCE-YYYY-MM-DD.md
```

**What's In It:**
- Current market analysis
- Competitor data
- Pricing intelligence
- Platform activity levels
- Strategy recommendations

---

## 🗂️ Complete File Structure

```
~/Desktop/ekoleadgenerator/solar-data-extractor/output/
│
├── demo-georgia-leads-2025-11-25.csv
│   └── ALL leads found (15 total)
│
├── qualified-leads-for-submission-2025-11-25.csv
│   └── SUBMITTED leads only (13 total)
│
├── DAILY-LEAD-REPORT-2025-11-25.md
│   └── Daily performance report
│
├── LIVE-MARKET-INTELLIGENCE-2025-11-25.md
│   └── Market research & analysis
│
├── playwright-submission-script.js
│   └── Auto-generated submission automation
│
└── form-submissions.csv
    └── Cumulative submission log
```

---

## 🖥️ How to Access Your Leads

### Method 1: Finder (Easy)

1. Open **Finder**
2. Press **Cmd + Shift + G**
3. Type: `~/Desktop/ekoleadgenerator/solar-data-extractor/output`
4. Press **Enter**

You'll see all your lead files!

---

### Method 2: Terminal (Quick)

```bash
# Open the folder
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output

# List all files
ls -lh ~/Desktop/ekoleadgenerator/solar-data-extractor/output

# View today's leads
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/demo-georgia-leads-*.csv
```

---

### Method 3: Excel (Import)

1. Open **Excel**
2. File → Import
3. Navigate to: `~/Desktop/ekoleadgenerator/solar-data-extractor/output`
4. Select: `demo-georgia-leads-2025-11-25.csv`
5. Import!

**Your leads are now in Excel** - ready for sorting, filtering, calling!

---

### Method 4: Google Sheets (Cloud)

1. Open **Google Sheets**
2. File → Import
3. Upload tab
4. Select: `demo-georgia-leads-2025-11-25.csv`
5. Import!

**Your leads are now in the cloud** - access from anywhere!

---

## 📊 Example: What a Lead Looks Like

### In the CSV File:

```csv
Source,Name,Location,Message,Phone,Email,Priority,Score,Intent
Nextdoor,Lisa Davis,Roswell GA,"Solar panels stopped working this morning!",(770) 555-0456,lisa.davis@email.com,Hot,85,Urgent
```

### When You Open in Excel:

| Source | Name | Location | Message | Phone | Email | Priority | Score | Intent |
|--------|------|----------|---------|-------|-------|----------|-------|--------|
| Nextdoor | Lisa Davis | Roswell GA | Solar panels stopped working... | (770) 555-0456 | lisa.davis@email.com | Hot | 85 | Urgent |

**Now you can:**
- Sort by Score (highest first)
- Filter by Priority (Hot only)
- Export to your CRM
- Print a call list
- Track who you've called

---

## 🔄 Daily File Naming

Each day creates NEW files with the date:

**Monday:**
```
demo-georgia-leads-2025-11-25.csv
qualified-leads-for-submission-2025-11-25.csv
DAILY-LEAD-REPORT-2025-11-25.md
```

**Tuesday:**
```
demo-georgia-leads-2025-11-26.csv
qualified-leads-for-submission-2025-11-26.csv
DAILY-LEAD-REPORT-2025-11-26.md
```

**Wednesday:**
```
demo-georgia-leads-2025-11-27.csv
...
```

**Why?**
- Track daily performance
- Compare day-to-day
- Historical data
- Never lose old leads

---

## 💾 Backup Strategy

### Your Leads Are Saved In 3 Places:

1. **Local Computer**
   ```
   ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
   ```

2. **GitHub Repository**
   ```
   https://github.com/mrmoe28/solar-data-extractor
   ```
   (You can push output files too!)

3. **Your Email Inbox**
   (Every auto-submitted lead creates an email)

---

## 📧 How to Also Get Leads in Email

Want a copy emailed to you each morning?

Tell Claude:
```
"Email me today's lead report"
```

Or set up automatic email forwarding:
```bash
# Add to daily automation script
cat output/DAILY-LEAD-REPORT-*.md | mail -s "Daily Solar Leads" your@email.com
```

---

## 🔍 Search Your Leads

### Find Specific Leads

**By Name:**
```bash
grep "Lisa Davis" ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv
```

**By Location:**
```bash
grep "Roswell" ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv
```

**By Score (Hot leads only):**
```bash
grep ",Hot," ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv
```

**By Phone (has phone number):**
```bash
grep "([0-9]" ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv
```

---

## 📱 Import to Your Phone

Want leads on your mobile device?

### Method 1: Email CSV to Yourself
```bash
# From terminal
echo "Today's leads attached" | mail -s "Solar Leads" -a ~/Desktop/ekoleadgenerator/solar-data-extractor/output/qualified-leads-*.csv your@email.com
```

### Method 2: iCloud Drive
```bash
# Copy to iCloud
cp ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv ~/Library/Mobile\ Documents/com~apple~CloudDocs/Solar-Leads/
```

Now access from iPhone/iPad!

---

## 🎯 Pro Tips

### Tip 1: Create a Daily Folder
```bash
# Organize by week
mkdir -p ~/Desktop/ekoleadgenerator/solar-data-extractor/output/week-of-2025-11-25
mv ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*2025-11-2[5-9]* ~/Desktop/ekoleadgenerator/solar-data-extractor/output/week-of-2025-11-25/
```

### Tip 2: Backup to Dropbox
```bash
# Auto-backup to Dropbox
cp ~/Desktop/ekoleadgenerator/solar-data-extractor/output/*.csv ~/Dropbox/Solar-Leads/
```

### Tip 3: Quick View Today's Leads
```bash
# Add to ~/.zshrc or ~/.bash_profile
alias leads="open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/qualified-leads-$(date +%Y-%m-%d).csv"
```

Then just type: `leads`

### Tip 4: Print Call List
```bash
# Open qualified leads in Excel and print
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/qualified-leads-*.csv
# File → Print → Done!
```

---

## 🚨 Important Notes

### File Permissions
All files are **readable by you only** (privacy protection)

### File Size
Each CSV is typically:
- 10-50 KB (small, opens fast)
- ~15-20 leads = ~5 KB
- Won't slow down your computer

### Storage Space
Even with daily leads for a year:
- ~365 CSV files
- ~365 reports
- Total: ~20-50 MB
- **Basically nothing!**

---

## 📊 Sample Workflow

### Morning Routine:

**8:00 AM** - Automation runs, creates:
```
qualified-leads-for-submission-2025-11-26.csv
DAILY-LEAD-REPORT-2025-11-26.md
```

**8:05 AM** - You open:
```bash
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/DAILY-LEAD-REPORT-2025-11-26.md
```

Read top 5 hottest leads.

**8:10 AM** - You open:
```bash
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/qualified-leads-2025-11-26.csv
```

Sort by Score (highest first).

**8:15 AM** - Start calling!

---

## ✅ Summary

**Leads are stored at:**
```
~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

**File types:**
- `.csv` = Import to Excel/CRM
- `.md` = Read in any text editor
- `.js` = Automation scripts

**Access methods:**
- Finder: Cmd+Shift+G → `~/Desktop/ekoleadgenerator/solar-data-extractor/output`
- Terminal: `open ~/Desktop/ekoleadgenerator/solar-data-extractor/output`
- Excel: File → Import
- Google Sheets: File → Import → Upload

**Backed up:**
- Local computer ✅
- GitHub repository ✅
- Email inbox (submitted leads) ✅

---

## 🆘 Can't Find Your Leads?

**Check if they exist:**
```bash
ls -lh ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

**Create output directory if missing:**
```bash
mkdir -p ~/Desktop/ekoleadgenerator/solar-data-extractor/output
```

**View most recent leads:**
```bash
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

**Ask Claude:**
```
"Show me where my leads are stored"
"Open today's lead file"
"List all my lead files"
```

---

**Your leads are safe, organized, and ready to close! 📊✅💰**

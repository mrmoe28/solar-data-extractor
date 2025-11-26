# 📊 Google Sheets Integration - Eko Solar Leads

## 🎯 What This Does

Automatically saves all your solar leads to **Google Sheets** so you can:
- Access leads from anywhere (phone, tablet, computer)
- Share with your team
- Track performance over time
- Never lose lead data
- Easy sorting and filtering

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create the Google Sheet

1. Go to: **https://sheets.google.com**
2. Click: **"+ Blank"** to create a new spreadsheet
3. Rename it to: **"Eko Solar Leads"**
4. Done! Keep this tab open.

---

### Step 2: Import Your First Leads

1. In your new Google Sheet, click: **File → Import**
2. Click: **Upload** tab
3. Click: **Browse** button
4. Navigate to:
   ```
   ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
   ```
5. Select: **qualified-leads-for-submission-YYYY-MM-DD.csv**
6. Import location: Choose **"Replace spreadsheet"**
7. Click: **"Import data"**

🎉 **Your leads are now in Google Sheets!**

---

## 📱 Daily Auto-Sync Setup (Recommended)

### Option A: Google Drive Auto-Sync

**One-time setup:**

1. **Install Google Drive for Desktop**
   - Download: https://www.google.com/drive/download/
   - Install and sign in with your Google account

2. **Move your lead folder to Google Drive**
   ```bash
   # Open terminal and run:
   mv ~/Desktop/ekoleadgenerator ~/Google\ Drive/My\ Drive/
   ```

3. **Update your desktop launcher**
   - The launcher will still work! Google Drive syncs automatically
   - All your CSV files now auto-sync to Google Drive

4. **Import to Google Sheets daily**
   - In Google Sheets: File → Import → Google Drive
   - Navigate to: ekoleadgenerator/solar-data-extractor/output/
   - Select latest CSV → Import

**Benefits:**
- ✅ Automatic cloud backup
- ✅ Access files from any device
- ✅ Never lose your leads
- ✅ Easy team sharing

---

### Option B: Manual Daily Import (Simple)

**Each morning:**

1. Open **Google Sheets → Eko Solar Leads**
2. File → Import → Upload
3. Select today's CSV file:
   ```
   qualified-leads-for-submission-2025-11-26.csv
   ```
4. Choose: **"Append to current sheet"** (keeps history!)
5. Import

Takes 30 seconds each day.

---

## 🔄 Automated Import Script

I've created a sync script for you:

```bash
# Run this after generating leads
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./sync-to-google-sheets.sh
```

**What it does:**
- Finds your latest CSV files
- Copies to Google Drive (if installed)
- Shows you import instructions

---

## 📧 Email Notifications for Hot Leads

**Setup:** Already configured!

**Email:** ekosolarize@gmail.com

**When you get an email:**
- Subject: **"🔥 Hot New Lead - Solar Installation"**
- Contains: Name, phone, location, request details
- Action: Call within 30 minutes!

**To enable email notifications:**

```bash
# Run after lead generation
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./send-lead-notification.sh
```

**Or add to daily automation:**
The daily automation can automatically send these emails!

---

## 🎯 Complete Daily Workflow

### Morning Automation (Fully Automated)

**8:00 AM** - System runs automatically:
1. Finds Georgia solar leads
2. Scores and filters
3. Auto-submits to your form
4. Sends Hot lead emails to ekosolarize@gmail.com
5. Saves to CSV
6. Syncs to Google Drive (if setup)

**8:05 AM** - You receive emails:
```
📧 From: Solar Lead System
   Subject: 🔥 Hot New Lead - Solar Installation

   Name: Lisa Davis
   Location: Roswell GA
   Phone: (770) 555-0456
   Message: Solar panels stopped working...
```

**8:10 AM** - You open Google Sheets:
- See all new leads
- Sort by Score (highest first)
- Filter for Hot leads only
- Click phone number to call

**8:15 AM** - Start calling!

---

## 📊 Google Sheets Template Structure

Your sheet will have these columns:

| Column | Description |
|--------|-------------|
| Source | Where lead came from (Nextdoor, Reddit, etc.) |
| Name | Customer name |
| Location | City, state |
| Message | Their request |
| Phone | Contact phone |
| Email | Contact email |
| Profile URL | Link to their social profile |
| Post URL | Link to original post |
| Timestamp | When posted |
| Priority | Hot/Warm/Cold |
| Score | Lead quality score (0-100) |
| Intent | Urgency level |

**Pro Tips:**
- Use **Filter** to show only Hot leads
- Use **Sort** by Score (highest first)
- Add a **"Called"** column to track follow-ups
- Add a **"Status"** column (Contacted, Quoted, Closed)

---

## 🎨 Make It Look Professional

### Add Color Coding

1. Select the **Priority** column
2. Format → Conditional formatting
3. Format rules:
   - If text contains "Hot" → Background color: Red
   - If text contains "Warm" → Background color: Orange
   - If text contains "Cold" → Background color: Blue

Now Hot leads stand out visually!

### Add Charts

1. Insert → Chart
2. Chart type: Pie chart
3. Data range: Priority column
4. See distribution of Hot/Warm/Cold leads

---

## 📱 Mobile Access

### Google Sheets App (iPhone/Android)

1. Install: **Google Sheets** app
2. Open: **Eko Solar Leads**
3. View leads on the go!

**Mobile workflow:**
- Morning notification arrives
- Open Google Sheets app
- See new Hot lead
- Tap phone number to call
- Close deal from your phone!

---

## 🔗 Share With Your Team

**Share access:**
1. Click **"Share"** button (top right)
2. Add email: teammate@example.com
3. Choose access level:
   - **Viewer** - Can only see
   - **Commenter** - Can add notes
   - **Editor** - Can edit leads

**Use cases:**
- Sales team sees all leads
- Admin updates status columns
- Manager views performance metrics

---

## 💾 Backup Strategy

With Google Sheets, your leads are backed up in **3 places**:

1. **Local CSV files**
   ```
   ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
   ```

2. **Google Drive** (if setup)
   ```
   Google Drive/ekoleadgenerator/solar-data-extractor/output/
   ```

3. **Google Sheets**
   ```
   https://sheets.google.com → Eko Solar Leads
   ```

**You'll never lose a lead!**

---

## 🎁 Bonus: Google Sheets Formulas

Add these columns for extra insights:

### Days Since Posted
```
=TODAY() - DATEVALUE(K2)
```
(Where K2 is the Timestamp column)

### Follow-Up Priority
```
=IF(J2="Hot", "Call Now!", IF(J2="Warm", "Call Today", "Call This Week"))
```
(Where J2 is the Priority column)

### Revenue Potential
```
=IF(J2="Hot", "$15,000", IF(J2="Warm", "$12,000", "$8,000"))
```

---

## 🆘 Troubleshooting

### "Can't find the CSV file"

**Check:**
```bash
ls -lh ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

Should show files like: `qualified-leads-for-submission-2025-11-26.csv`

### "Google Drive not syncing"

1. Check Google Drive is running (menu bar icon)
2. Right-click folder → "Available offline"
3. Wait 1-2 minutes for initial sync

### "Import failed"

- Make sure CSV file isn't open in Excel
- Try "Replace spreadsheet" instead of "Append"
- Check file isn't corrupted

### "Email notifications not working"

```bash
# Test email command
echo "Test" | mail -s "Test" ekosolarize@gmail.com
```

If this fails, you may need to configure macOS mail settings.

---

## ✅ Quick Reference Commands

### Sync to Google Drive
```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./sync-to-google-sheets.sh
```

### Send Hot Lead Emails
```bash
cd ~/Desktop/ekoleadgenerator/solar-data-extractor
./send-lead-notification.sh
```

### View Latest Leads
```bash
open ~/Desktop/ekoleadgenerator/solar-data-extractor/output/
```

### Open Google Sheets
Just type in browser: **sheets.google.com**

---

## 🎯 Success Checklist

- [ ] Created "Eko Solar Leads" Google Sheet
- [ ] Imported first CSV successfully
- [ ] Set up Google Drive auto-sync (optional)
- [ ] Tested email notifications
- [ ] Added color coding to Hot leads
- [ ] Saved bookmark to Google Sheets
- [ ] Installed Google Sheets mobile app
- [ ] Shared with team (if applicable)

---

## 📈 What You Have Now

✅ **Local CSV backups** (your computer)
✅ **Google Sheets** (cloud access)
✅ **Google Drive sync** (automatic backup)
✅ **Email alerts** (Hot leads to ekosolarize@gmail.com)
✅ **Mobile access** (view/edit from anywhere)
✅ **Team sharing** (collaborate with sales team)

---

**Your Google Sheet URL will be something like:**
```
https://docs.google.com/spreadsheets/d/[LONG_ID]/edit
```

**Bookmark this!** You'll open it every morning.

---

## 🚀 Next Steps

1. **Set up the Google Sheet** (5 minutes)
2. **Import your example leads** (test it works)
3. **Configure email notifications** (tomorrow you'll get alerts!)
4. **Optional: Set up Google Drive sync** (hands-free backup)

---

**Ready to access your leads from anywhere? Let's set it up!** 📊✨

Questions? Just ask Claude: *"Help me set up Google Sheets"*

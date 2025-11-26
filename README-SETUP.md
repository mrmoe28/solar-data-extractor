# 🚀 Automatic Setup - One Command!

## Quick Start (Easiest)

### Option 1: Double-Click Setup (Mac)
1. **Double-click** `setup.command`
2. Wait for setup to complete
3. Done! Ready to scrape.

### Option 2: Terminal Command
```bash
cd solar-data-extractor
./setup.sh
```

That's it! The script automatically:
- ✅ Checks Node.js installation
- ✅ Installs npm packages
- ✅ Creates `.env` file with correct settings
- ✅ Installs Playwright browsers
- ✅ Tests dashboard connection
- ✅ Shows you what to do next

---

## What Gets Configured

The setup script automatically creates `.env` with:

```bash
DASHBOARD_API_URL=https://eko-lead-dashboard.vercel.app
SCRAPER_API_KEY=eko-scraper-secret-2024
```

No manual copying needed!

---

## After Setup

Run the scraper:
```bash
node scrape-leads.js Georgia
```

Watch live updates:
```
https://eko-lead-dashboard.vercel.app/scraping
```

---

## Manual Setup (if needed)

If you prefer to set up manually:

1. Copy `.env.example` to `.env`
2. Edit `.env` and set:
   - `DASHBOARD_API_URL=https://eko-lead-dashboard.vercel.app`
   - `SCRAPER_API_KEY=eko-scraper-secret-2024`
3. Run `npm install`
4. Run `npx playwright install chromium`

---

## Troubleshooting

### "Permission denied" error
```bash
chmod +x setup.sh
./setup.sh
```

### Script won't run on Mac
Right-click `setup.command` → Open → Click "Open" in the dialog

### Node.js not found
Install Node.js from: https://nodejs.org/

---

## What's Next?

After setup completes:

1. **Start scraping:**
   ```bash
   node scrape-leads.js Georgia
   ```

2. **Watch live updates:**
   Open https://eko-lead-dashboard.vercel.app/scraping

3. **View all leads:**
   Open https://eko-lead-dashboard.vercel.app/leads

4. **Check settings:**
   Open https://eko-lead-dashboard.vercel.app/settings

---

## Pro Tips

- **Run daily:** Set up a cron job to scrape automatically
- **Multiple locations:** Run scraper for different states
- **Delete old leads:** Use the trash icon in the dashboard
- **API key:** Visible in Settings page (already configured by setup!)

---

That's it! Setup is now fully automated. 🎉

# 🚀 Quick Start: Lead Enrichment

Get phone numbers and emails for your scraped leads in **5-10 minutes**.

---

## Choose Your Path

### Path A: FREE (Local LLM) - Recommended for beginners

**Time:** 10 minutes
**Cost:** $0 forever
**Speed:** 5-20 sec/lead
**Privacy:** 100% local

```bash
# Step 1: Install Ollama
brew install ollama

# Step 2: Start service
ollama serve

# Step 3: Download model (in new terminal)
ollama pull llama3.2

# Step 4: Test it!
node test-local-enrichment.js
```

**You're done!** Check the results and enriched CSV file.

**Full guide:** [LOCAL-LLM-SETUP.md](./LOCAL-LLM-SETUP.md)

---

### Path B: Fast (Cloud API) - For speed

**Time:** 5 minutes
**Cost:** $0.003/lead (~$9/month for 100 leads/day)
**Speed:** 1-3 sec/lead
**Privacy:** Cloud-based

```bash
# Step 1: Get API key
# Go to: https://console.anthropic.com/
# Create account → API Keys → Create new key

# Step 2: Set environment variable
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Step 3: Test it!
node test-enrichment.js
```

**You're done!** Check the results and enriched CSV file.

**Full guide:** [ENRICHMENT-SETUP.md](./ENRICHMENT-SETUP.md)

---

## What Happens During Enrichment?

### Input (What You Have)
```
Name: John Smith
Location: Atlanta, GA
Message: My solar panels stopped working...
```

### Output (What You Get)
```
Name: John Smith
Location: Atlanta, GA
Message: My solar panels stopped working...
Phone: 404-555-1234          ← NEW!
Email: john@example.com      ← NEW!
LinkedIn: linkedin.com/in/... ← NEW!
Confidence: HIGH             ← NEW!
```

**Success Rate:** 50-60% (finds contact info for ~half of leads)

---

## Which Method Should I Use?

### Quick Decision:

**Choose LOCAL LLM if:**
- ✅ You want FREE unlimited enrichment
- ✅ You're processing 100+ leads/day
- ✅ Privacy is important
- ✅ Speed doesn't matter (overnight batches)

**Choose CLOUD API if:**
- ✅ You need results FAST (< 5 minutes)
- ✅ You're processing < 100 leads/day
- ✅ Setup time matters (cloud is faster to set up)
- ✅ $9-90/month is acceptable

**Not sure?** Start with LOCAL LLM (it's free to test!)

**Detailed comparison:** [ENRICHMENT-COMPARISON.md](./ENRICHMENT-COMPARISON.md)

---

## Examples

### Example 1: Test on Sample Leads

```bash
# Local LLM
node test-local-enrichment.js

# OR

# Cloud API
export ANTHROPIC_API_KEY="sk-ant-..."
node test-enrichment.js
```

**Result:** Tests on 3 sample leads, shows you what to expect

---

### Example 2: Enrich Your Latest Scraped Leads

Both test scripts automatically:
1. Find your latest CSV in `output/` folder
2. Enrich the first 3 real leads
3. Save results to new file (*-ENRICHED.csv)

```bash
# Just run the test script - it handles everything!
node test-local-enrichment.js
```

**Result:** Enriched CSV with phone/email columns filled

---

### Example 3: Enrich Custom Leads

Create a file `my-leads.js`:

```javascript
import { LocalLLMEnricher } from './enrichment/local-llm-enricher.js';
// Or: import { ClaudeEnricher } from './enrichment/claude-enricher.js';

const enricher = new LocalLLMEnricher();

const leads = [
  {
    name: 'John Smith',
    location: 'Atlanta, GA',
    message: 'My solar panels need repair...'
  },
  // ... more leads
];

const enriched = await enricher.enrichLeads(leads, {
  batchSize: 3,
  delayMs: 500,
  skipIfHasContact: true
});

console.log(enriched);
```

```bash
node my-leads.js
```

---

## Troubleshooting

### "Ollama not running"
```bash
ollama serve
```

### "Model not found"
```bash
ollama pull llama3.2
```

### "ANTHROPIC_API_KEY not set"
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### "Low accuracy / not finding contact info"
**This is normal!** Enrichment can only find publicly available info. Expect 50-60% success rate.

**Tips to improve:**
- Focus on high-quality leads (permits, incentives, business owners)
- Skip anonymous usernames (u/solarhelp2024)
- Enrich leads with more context (addresses, business names)

---

## Cost Comparison

### Your Cost (per 1,000 leads)

| Method | Cost | vs Apollo |
|--------|------|-----------|
| Local LLM | **$0** | Save $50 |
| Cloud API | **$3** | Save $47 |
| Apollo.io | $50 | - |

**Bottom line:** Save 94-100% on lead enrichment costs! 🎉

---

## Next Steps After Testing

### 1. Integrate Into Main Scraper (Coming Soon!)

```bash
# Auto-enrich after scraping
node scrape-leads.js "Atlanta" --enrich

# Or manually enrich latest CSV
node enrich-csv.js output/georgia-solar-leads-*.csv
```

### 2. Schedule Batch Jobs

```bash
# Run overnight
0 1 * * * cd /path/to/scraper && node batch-enrich.js
```

### 3. Scale Up

- Enrich 500-1,000+ leads/day
- Cost: $0-9/month (vs $750-1,500/month for Apollo)
- Get 250-500+ callable leads daily

---

## Full Documentation

- **[LOCAL-LLM-SETUP.md](./LOCAL-LLM-SETUP.md)** - Complete local LLM guide
- **[ENRICHMENT-SETUP.md](./ENRICHMENT-SETUP.md)** - Complete cloud API guide
- **[ENRICHMENT-COMPARISON.md](./ENRICHMENT-COMPARISON.md)** - Detailed comparison
- **[AI-POWERED-UPGRADE-PLAN.md](./AI-POWERED-UPGRADE-PLAN.md)** - Full roadmap

---

## FAQ

**Q: Do I need both methods?**
A: No, choose one. Or use hybrid approach (bulk with local, retry with cloud).

**Q: Which is better?**
A: Local LLM = FREE but slower. Cloud API = Fast but paid. Both work great!

**Q: Can I test both?**
A: YES! Test local first (free), then try cloud if you need speed.

**Q: How long does enrichment take?**
A: Local: 5-20 sec/lead. Cloud: 1-3 sec/lead.

**Q: What if I have 10,000 leads?**
A: Use local LLM overnight. 100% FREE!

**Q: Is my data safe?**
A: Local LLM = 100% private (never leaves machine). Cloud API = sent to Anthropic.

**Q: What's the catch?**
A: No catch! Local LLM is truly FREE. Cloud API charges $0.003/lead but still 15x cheaper than Apollo.

---

## Support

**Need help?**
- Check troubleshooting section above
- Read full setup guides (LOCAL-LLM-SETUP.md or ENRICHMENT-SETUP.md)
- Review example code in test scripts

**Ready to enrich?**

```bash
# FREE method:
ollama serve
ollama pull llama3.2
node test-local-enrichment.js

# OR paid method:
export ANTHROPIC_API_KEY="sk-ant-..."
node test-enrichment.js
```

**Let's turn scraped leads into callable leads! 🚀**

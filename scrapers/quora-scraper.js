import { chromium } from 'playwright';

/**
 * Quora Solar Lead Scraper
 * Finds people asking questions about solar on Quora
 */
export async function scrapeQuoraLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Quora for solar leads in ${location}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  // Search queries
  const searches = [
    // NEW INSTALLATION
    `solar installer ${location}`,
    `solar panels ${location}`,
    `solar cost ${location}`,
    `best solar company ${location}`,
    // REPAIR/TROUBLESHOOTING
    `solar not working ${location}`,
    `solar repair ${location}`,
    `solar panel broken ${location}`,
    `solar inverter error ${location}`
  ];

  for (const query of searches) {
    try {
      const searchUrl = `https://www.quora.com/search?q=${encodeURIComponent(query)}`;
      console.log(`  Searching: ${query}`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Extract questions
      const questions = await page.evaluate(() => {
        const results = [];
        const questionElements = document.querySelectorAll('a[class*="question"]');

        questionElements.forEach((qEl, index) => {
          if (index > 15) return; // Limit to 15 questions per search

          try {
            const questionText = qEl.textContent?.trim() || '';
            const questionUrl = qEl.href || '';

            // Check if it's about getting service/recommendations OR repair
            const isServiceRequest = /how much|cost|price|recommend|good|best|should i|which|install|worth it|hire|not working|broken|repair|fix|troubleshoot|error/i.test(questionText);
            const isSolar = /solar|panel|photovoltaic|pv|inverter/i.test(questionText);

            if (isServiceRequest && isSolar && questionText.length > 20) {
              results.push({
                question: questionText,
                url: questionUrl
              });
            }
          } catch (e) {
            // Skip
          }
        });

        return results;
      });

      // Score and add to leads
      questions.forEach(q => {
        const message = q.question.toLowerCase();
        let score = 0;

        // REPAIR/TROUBLESHOOTING = EXTREMELY HOT
        if (/not working|broken|stopped working|failed|dead/.test(message)) score += 40;
        if (/repair|fix|troubleshoot|service/.test(message)) score += 35;
        if (/error|fault|issue|problem/.test(message)) score += 30;

        // High intent keywords (new installation)
        if (/quote|estimate|cost|price|how much/.test(message)) score += 25;
        if (/recommend|good|best/.test(message)) score += 20;
        if (/should i|worth it|thinking about/.test(message)) score += 15;
        if (/install|hire|company/.test(message)) score += 10;

        // Quora questions are generally research phase (unless repair!)
        score += 10;

        const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

        leads.push({
          source: 'Quora',
          platform: 'Quora Questions',
          name: 'Anonymous',
          location: location,
          message: q.question,
          profileUrl: '',
          postUrl: q.url,
          timestamp: new Date().toISOString(),
          score,
          priority,
          intent: score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low'
        });
      });

      console.log(`    Found ${questions.length} potential leads`);

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }
  }

  await browser.close();

  console.log(`✅ Quora scraping complete: ${leads.length} leads found`);
  return leads;
}

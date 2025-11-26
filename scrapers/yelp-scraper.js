import { chromium } from 'playwright';

/**
 * Yelp Q&A Solar Lead Scraper
 * Finds people asking questions on solar company Yelp pages
 */
export async function scrapeYelpLeads(location = 'Atlanta, GA') {
  console.log(`\n🔍 Searching Yelp Q&A for solar leads in ${location}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  try {
    // Search for solar companies in the area
    const searchUrl = `https://www.yelp.com/search?find_desc=solar+installation&find_loc=${encodeURIComponent(location)}`;
    console.log(`  Checking: solar companies in ${location}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get top 5 solar companies
    const companies = await page.evaluate(() => {
      const results = [];
      const bizElements = document.querySelectorAll('[data-testid*="serp-ia-card"]');

      bizElements.forEach((biz, index) => {
        if (index >= 5) return; // Only check top 5 companies

        const linkEl = biz.querySelector('a[href*="/biz/"]');
        if (linkEl) {
          results.push(linkEl.href);
        }
      });

      return results;
    });

    // Check Q&A section on each company page
    for (const companyUrl of companies) {
      try {
        await page.goto(companyUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Look for Q&A section
        const questions = await page.evaluate(() => {
          const results = [];
          const qaElements = document.querySelectorAll('[data-testid*="question"]');

          qaElements.forEach((qa, index) => {
            if (index > 10) return; // Limit to 10 questions per company

            try {
              const questionText = qa.textContent?.trim() || '';

              // Check if related to getting service/quote OR repair
              const isServiceRequest = /how much|cost|price|recommend|good|install|quote|estimate|should i|which one|help me choose|not working|broken|repair|fix|troubleshoot|error|issue/i.test(questionText);

              if (isServiceRequest && questionText.length > 20) {
                results.push({
                  question: questionText.slice(0, 300),
                  company: document.title
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

          // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (asking on Yelp = need help NOW!)
          if (/not working|broken|stopped|failed|dead|no power/.test(message)) score += 40;
          if (/repair|fix|troubleshoot/.test(message)) score += 35;
          if (/error|fault|issue|problem/.test(message)) score += 30;

          // High intent keywords (new installation)
          if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
          if (/need|looking for|should i|help me/.test(message)) score += 20;
          if (/install|service/.test(message)) score += 15;
          if (/recommend|good|best/.test(message)) score += 10;

          // Yelp Q&A tends to be high intent
          score += 15;

          const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

          leads.push({
            source: 'Yelp Q&A',
            platform: 'Yelp Business Q&A',
            name: 'Anonymous',
            location: location,
            message: q.question,
            profileUrl: '',
            postUrl: companyUrl,
            timestamp: new Date().toISOString(),
            score,
            priority,
            intent: score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low'
          });
        });

        console.log(`    Found ${questions.length} questions on this company`);

      } catch (error) {
        console.error(`  Error checking company:`, error.message);
      }
    }

  } catch (error) {
    console.error(`  Error searching Yelp:`, error.message);
  }

  await browser.close();

  console.log(`✅ Yelp scraping complete: ${leads.length} leads found`);
  return leads;
}

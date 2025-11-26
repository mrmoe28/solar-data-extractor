import { chromium } from 'playwright';

/**
 * Twitter/X Solar Lead Scraper
 * Finds people tweeting about needing solar services
 * Note: Twitter may require login for some content
 */
export async function scrapeTwitterLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Twitter for solar leads in ${location}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  // Search queries (repair/troubleshooting gets INSTANT visibility on Twitter!)
  const searches = [
    // NEW INSTALLATION
    `solar installer ${location}`,
    `need solar panels ${location}`,
    `solar quote ${location}`,
    // REPAIR/TROUBLESHOOTING (Very visible complaints!)
    `solar not working ${location}`,
    `solar repair ${location}`,
    `solar broken ${location}`,
    `inverter error ${location}`,
    `solar panel stopped working ${location}`
  ];

  for (const query of searches) {
    try {
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
      console.log(`  Searching: ${query}`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for content to load

      // Try to extract tweets (may not work if login required)
      const tweets = await page.evaluate(() => {
        const results = [];
        const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

        tweetElements.forEach((tweet, index) => {
          if (index > 10) return; // Limit to first 10 tweets

          try {
            const textEl = tweet.querySelector('[data-testid="tweetText"]');
            const text = textEl?.textContent?.trim() || '';

            const userEl = tweet.querySelector('[data-testid="User-Name"] a');
            const username = userEl?.textContent?.trim() || '';
            const profileUrl = userEl?.href || '';

            const timeEl = tweet.querySelector('time');
            const timestamp = timeEl?.getAttribute('datetime') || '';

            const isQuestion = /looking for|need|recommend|anyone know|help|quote|not working|broken|repair|fix|troubleshoot|error/i.test(text);
            const isSolar = /solar|panel|inverter|installation|photovoltaic/i.test(text);

            if (isQuestion && isSolar && username) {
              results.push({
                username,
                profileUrl,
                text,
                timestamp
              });
            }
          } catch (e) {
            console.error('Error extracting tweet:', e.message);
          }
        });

        return results;
      });

      // Score and add to leads
      tweets.forEach(tweet => {
        const message = tweet.text.toLowerCase();
        let score = 0;

        // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (public complaint = desperate!)
        if (/not working|broken|stopped working|no power|down|offline|failed/.test(message)) score += 40;
        if (/repair|fix|troubleshoot|service|technician/.test(message)) score += 35;
        if (/error|fault|inverter.*issue|panel.*issue/.test(message)) score += 30;
        if (/installer.*not.*respond|won't call back|ignoring|abandoned/.test(message)) score += 25;

        // High intent keywords (new installation)
        if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
        if (/need|looking for|hire/.test(message)) score += 20;
        if (/urgent|asap|soon|immediately/.test(message)) score += 15;
        if (/recommend/.test(message)) score += 10;

        // Recent tweets
        if (tweet.timestamp) {
          const age = new Date() - new Date(tweet.timestamp);
          const hours = age / (1000 * 60 * 60);
          if (hours < 1) score += 25;
          else if (hours < 24) score += 15;
          else if (hours < 72) score += 10;
        }

        const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

        leads.push({
          source: 'Twitter',
          platform: 'Twitter/X',
          name: tweet.username,
          location: location,
          message: tweet.text,
          profileUrl: tweet.profileUrl,
          postUrl: tweet.profileUrl,
          timestamp: tweet.timestamp || new Date().toISOString(),
          score,
          priority,
          intent: score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low'
        });
      });

      console.log(`    Found ${tweets.length} potential leads`);

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }
  }

  await browser.close();

  console.log(`✅ Twitter scraping complete: ${leads.length} leads found`);
  return leads;
}

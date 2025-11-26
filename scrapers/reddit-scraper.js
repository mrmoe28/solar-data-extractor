import { chromium } from 'playwright';

/**
 * Reddit Solar Lead Scraper
 * Finds real people asking about solar installation in specific locations
 */
export async function scrapeRedditLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Reddit for solar leads in ${location}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  // Search queries that indicate intent to buy/hire OR need repair
  const searches = [
    // NEW INSTALLATION
    `solar installation ${location}`,
    `solar installer recommendation ${location}`,
    `solar panels ${location}`,
    `need solar quote ${location}`,
    // REPAIR/TROUBLESHOOTING (VERY HOT!)
    `solar not working ${location}`,
    `solar panel repair ${location}`,
    `solar system broken ${location}`,
    `solar troubleshooting ${location}`,
    `solar inverter error ${location}`
  ];

  for (const query of searches) {
    try {
      const searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=post&sort=new`;
      console.log(`  Checking: ${query}`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000); // Let content load

      // Extract posts
      const posts = await page.evaluate(() => {
        const results = [];
        const postElements = document.querySelectorAll('[data-testid="post-container"]');

        postElements.forEach((post, index) => {
          if (index > 10) return; // Limit to first 10 posts per search

          try {
            // Get title
            const titleEl = post.querySelector('h3, [slot="title"]');
            const title = titleEl?.textContent?.trim() || '';

            // Get author
            const authorEl = post.querySelector('[data-testid="post_author_link"], a[href*="/user/"]');
            const author = authorEl?.textContent?.trim()?.replace('u/', '') || '';

            // Get subreddit
            const subredditEl = post.querySelector('a[href*="/r/"]');
            const subreddit = subredditEl?.textContent?.trim() || '';

            // Get post URL
            const linkEl = post.querySelector('a[data-click-id="body"]');
            const postUrl = linkEl?.href || '';

            // Get timestamp
            const timeEl = post.querySelector('time');
            const timestamp = timeEl?.getAttribute('datetime') || '';

            // Check if it's a question/request (including repair/troubleshooting)
            const isQuestion = /looking for|need|recommend|anyone know|help|advice|quote|cost|price|how much|not working|broken|repair|fix|troubleshoot|error|fault|inverter.*issue/i.test(title);

            if (isQuestion && author && postUrl) {
              results.push({
                title,
                author,
                subreddit,
                postUrl,
                timestamp,
              });
            }
          } catch (e) {
            console.error('Error extracting post:', e.message);
          }
        });

        return results;
      });

      // Score and add to leads
      posts.forEach(post => {
        const message = post.title.toLowerCase();
        const fullText = post.title;
        let score = 0;

        // Extract phone number if included in post
        const phoneMatch = fullText.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        // Extract email if included in post
        const emailMatch = fullText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[0] : '';

        // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (broken system = urgent need!)
        if (/not working|broken|stopped working|no power|error|fault|failed/.test(message)) score += 40;
        if (/repair|fix|troubleshoot|service|maintenance/.test(message)) score += 35;
        if (/inverter|panel|system.*down|offline/.test(message)) score += 30;
        if (/installer.*not responding|can't reach|won't answer/.test(message)) score += 25;

        // High intent keywords (new installation)
        if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
        if (/need|looking for|hire/.test(message)) score += 20;
        if (/urgent|asap|soon|immediately/.test(message)) score += 15;
        if (/recommend|recommendation|best/.test(message)) score += 10;

        // Recent posts
        if (post.timestamp) {
          const age = new Date() - new Date(post.timestamp);
          const days = age / (1000 * 60 * 60 * 24);
          if (days < 1) score += 20;
          else if (days < 7) score += 10;
          else if (days < 30) score += 5;
        }

        const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

        // BOOST SCORE if they included contact info (very hot!)
        if (phone) score += 20;
        if (email) score += 20;

        leads.push({
          source: 'Reddit',
          platform: post.subreddit,
          name: post.author,
          location: location,
          message: post.title,
          profileUrl: `https://reddit.com/user/${post.author}`,
          postUrl: post.postUrl,
          timestamp: post.timestamp || new Date().toISOString(),
          score,
          priority,
          intent: score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low',
          phone,
          email
        });
      });

      console.log(`    Found ${posts.length} potential leads`);

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }
  }

  await browser.close();

  console.log(`✅ Reddit scraping complete: ${leads.length} leads found`);
  return leads;
}

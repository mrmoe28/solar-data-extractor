import { chromium } from 'playwright';

/**
 * Nextdoor Solar Lead Scraper
 * Finds people posting about solar in their neighborhoods
 * Note: Requires login (similar to Facebook)
 */
export async function scrapeNextdoorLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Nextdoor for solar leads in ${location}...`);
  console.log('  Note: You may need to login manually when browser opens');

  const browser = await chromium.launch({
    headless: false, // Open visible browser for login
    timeout: 60000
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  const leads = [];

  try {
    // Navigate to Nextdoor
    await page.goto('https://nextdoor.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check if logged in
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('button[data-testid="login-button"]');
    });

    if (!isLoggedIn) {
      console.log('\n⚠️  NOT LOGGED IN TO NEXTDOOR');
      console.log('  Please login manually in the browser window...');
      console.log('  (Waiting 60 seconds for you to login)');
      await page.waitForTimeout(60000); // Wait 60 seconds for manual login
    }

    // Search for solar posts (neighbors complaining about broken systems!)
    const searches = [
      // NEW INSTALLATION
      `solar installation ${location}`,
      `solar panels ${location}`,
      `solar installer ${location}`,
      // REPAIR/TROUBLESHOOTING (VERY visible in neighborhoods!)
      `solar not working ${location}`,
      `solar repair ${location}`,
      `solar broken ${location}`,
      `solar panel issue ${location}`,
      `inverter error ${location}`
    ];

    for (const query of searches) {
      try {
        const searchUrl = `https://nextdoor.com/search/?query=${encodeURIComponent(query)}`;
        console.log(`  Searching: ${query}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Extract posts
        const posts = await page.evaluate(() => {
          const results = [];
          const postElements = document.querySelectorAll('[data-testid*="post"]');

          postElements.forEach((post, index) => {
            if (index > 15) return; // Limit to 15 posts

            try {
              const textElements = post.querySelectorAll('span, p');
              let text = '';
              textElements.forEach(el => {
                if (el.textContent.length > 20) {
                  text += el.textContent + ' ';
                }
              });
              text = text.trim();

              const authorEl = post.querySelector('[data-testid*="author"]');
              const author = authorEl?.textContent?.trim() || '';

              const linkEl = post.querySelector('a[href*="/post/"]');
              const postUrl = linkEl?.href || '';

              // Check if looking for service OR has broken system
              const isLookingFor = /looking for|need|recommend|anyone know|help|quote|estimate|cost|not working|broken|repair|fix|troubleshoot|error|issue/i.test(text);
              const isSolarRelated = /solar|photovoltaic|pv panel|inverter|installation/i.test(text);

              if (isLookingFor && isSolarRelated && author && text.length > 20) {
                results.push({
                  author,
                  text,
                  postUrl
                });
              }
            } catch (e) {
              console.error('Error extracting Nextdoor post:', e.message);
            }
          });

          return results;
        });

        // Score and add to leads
        posts.forEach(post => {
          const message = post.text.toLowerCase();
          let score = 0;

          // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (asking neighbors = desperate!)
          if (/not working|broken|stopped working|dead|failed/.test(message)) score += 40;
          if (/repair|fix|troubleshoot|service|technician/.test(message)) score += 35;
          if (/error|fault|issue|problem/.test(message)) score += 30;
          if (/installer.*not responding|won't call back|can't reach/.test(message)) score += 25;

          // High intent keywords (new installation)
          if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
          if (/need|looking for|hire/.test(message)) score += 20;
          if (/urgent|asap|soon|immediately/.test(message)) score += 15;
          if (/recommend|trust|reliable/.test(message)) score += 10;

          // Nextdoor is hyper-local and high trust
          score += 20;

          const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

          leads.push({
            source: 'Nextdoor',
            platform: 'Nextdoor Neighborhoods',
            name: post.author,
            location: location,
            message: post.text.slice(0, 500),
            profileUrl: '',
            postUrl: post.postUrl,
            timestamp: new Date().toISOString(),
            score,
            priority,
            intent: score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low'
          });
        });

        console.log(`    Found ${posts.length} potential leads`);

      } catch (error) {
        console.error(`  Error searching "${query}":`, error.message);
      }
    }

  } catch (error) {
    console.error('Nextdoor scraping error:', error.message);
  }

  await browser.close();

  console.log(`✅ Nextdoor scraping complete: ${leads.length} leads found`);
  return leads;
}

import { chromium } from 'playwright';

/**
 * Facebook Solar Lead Scraper
 * Note: Facebook requires login for most content.
 * This scraper will prompt for manual login on first run.
 */
export async function scrapeFacebookLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Facebook for solar leads in ${location}...`);
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
    // Navigate to Facebook
    await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check if logged in
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('input[name="email"]');
    });

    if (!isLoggedIn) {
      console.log('\n⚠️  NOT LOGGED IN TO FACEBOOK');
      console.log('  Please login manually in the browser window...');
      console.log('  (Waiting 60 seconds for you to login)');
      await page.waitForTimeout(60000); // Wait 60 seconds for manual login
    }

    // Search queries for Facebook (people complain about broken systems here!)
    const searches = [
      // NEW INSTALLATION
      `solar installation ${location}`,
      `solar panels ${location}`,
      `need solar installer ${location}`,
      `solar quote ${location}`,
      // REPAIR/TROUBLESHOOTING (public complaints!)
      `solar not working ${location}`,
      `solar broken ${location}`,
      `solar repair ${location}`,
      `solar panel issue ${location}`,
      `inverter not working ${location}`
    ];

    for (const query of searches) {
      try {
        const searchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(query)}`;
        console.log(`  Searching: ${query}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Scroll to load more posts
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);

        // Extract posts
        const posts = await page.evaluate(() => {
          const results = [];
          const postElements = document.querySelectorAll('[role="article"]');

          postElements.forEach((post, index) => {
            if (index > 15) return; // Limit to first 15 posts

            try {
              // Get post text
              const textElements = post.querySelectorAll('div[dir="auto"]');
              let text = '';
              textElements.forEach(el => {
                if (el.textContent.length > 20) {
                  text += el.textContent + ' ';
                }
              });
              text = text.trim();

              // Get author
              const authorEl = post.querySelector('a[role="link"] strong, h4 a, h2 a');
              const author = authorEl?.textContent?.trim() || '';

              // Get profile link
              const profileLink = authorEl?.closest('a')?.href || '';

              // Get timestamp
              const timeElements = post.querySelectorAll('a[role="link"]');
              let timestamp = '';
              timeElements.forEach(el => {
                if (el.textContent.includes('h') || el.textContent.includes('d') || el.textContent.includes('w')) {
                  timestamp = el.textContent;
                }
              });

              // Check if looking for service OR has broken system
              const isLookingFor = /looking for|need|recommend|anyone know|help|quote|estimate|cost|price|not working|broken|repair|fix|troubleshoot|error|issue/i.test(text);
              const isSolarRelated = /solar|photovoltaic|pv panel|inverter|installation/i.test(text);

              if (isLookingFor && isSolarRelated && author && text.length > 20) {
                results.push({
                  author,
                  profileLink,
                  text,
                  timestamp
                });
              }
            } catch (e) {
              console.error('Error extracting Facebook post:', e.message);
            }
          });

          return results;
        });

        // Score and add to leads
        posts.forEach(post => {
          const message = post.text.toLowerCase();
          let score = 0;

          // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (public complaint!)
          if (/not working|broken|stopped working|dead|failed/.test(message)) score += 40;
          if (/repair|fix|troubleshoot|service|technician/.test(message)) score += 35;
          if (/error|fault|issue|problem/.test(message)) score += 30;
          if (/installer.*not responding|won't call back|ignoring me/.test(message)) score += 25;

          // High intent keywords (new installation)
          if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
          if (/need|looking for|hire/.test(message)) score += 20;
          if (/urgent|asap|soon|immediately/.test(message)) score += 15;
          if (/budget|\$/.test(message)) score += 10;

          // Recent posts
          if (post.timestamp) {
            if (/min|mins|hour|hours/.test(post.timestamp)) score += 25;
            else if (/day|days/.test(post.timestamp)) score += 15;
            else if (/week/.test(post.timestamp)) score += 10;
          }

          const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

          leads.push({
            source: 'Facebook',
            platform: 'Facebook Groups/Posts',
            name: post.author,
            location: location,
            message: post.text.slice(0, 500),
            profileUrl: post.profileLink,
            postUrl: '',
            timestamp: post.timestamp || new Date().toISOString(),
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
    console.error('Facebook scraping error:', error.message);
  }

  await browser.close();

  console.log(`✅ Facebook scraping complete: ${leads.length} leads found`);
  return leads;
}

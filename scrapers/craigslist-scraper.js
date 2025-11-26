/**
 * Craigslist Solar Lead Scraper
 * Uses RSS feeds - much more reliable than web scraping!
 * Finds people posting in "services wanted" looking for solar installers
 */
export async function scrapeCraigslistLeads(location = 'atlanta') {
  console.log(`\n🔍 Searching Craigslist for solar leads in ${location}...`);

  const leads = [];

  // Craigslist city codes
  const cityMap = {
    'atlanta': 'atlanta',
    'georgia': 'atlanta',
    'savannah': 'savannah',
    'augusta': 'augusta',
    'macon': 'macon',
    'columbus': 'columbus',
    'fulton': 'atlanta'
  };

  const city = cityMap[location.toLowerCase()] || 'atlanta';

  try {
    // Use RSS feed instead of web scraping (much more reliable!)
    const rssUrl = `https://${city}.craigslist.org/search/wan?query=solar&sort=date&format=rss`;
    console.log(`  Checking: ${rssUrl}`);

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.log(`    RSS feed error: ${response.status}`);
      return leads;
    }

    const rssText = await response.text();

    // Parse RSS XML
    const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || [];
    const posts = items.slice(0, 20).map(item => {
      try {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const dateMatch = item.match(/<dc:date>(.*?)<\/dc:date>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

        const title = titleMatch ? titleMatch[1] : '';
        const postUrl = linkMatch ? linkMatch[1] : '';
        const timestamp = dateMatch ? dateMatch[1] : '';
        const description = descMatch ? descMatch[1] : '';

        // Extract location from description
        const locationMatch = description.match(/\((.*?)\)/);
        const hood = locationMatch ? locationMatch[1] : '';

        // Check if it's about installation/repair/service
        const fullText = `${title} ${description}`;
        const isServiceRequest = /install|repair|quote|looking for|need|hire|cost|price|fix|troubleshoot|not working|broken|service/i.test(fullText);
        const isSolar = /solar|panel|photovoltaic|pv|inverter/i.test(fullText);

        if (isServiceRequest && isSolar) {
          return {
            title,
            postUrl,
            timestamp,
            location: hood
          };
        }
      } catch (e) {
        // Skip invalid items
      }
      return null;
    }).filter(Boolean);

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

      // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (Craigslist = immediate need!)
      if (/not working|broken|stopped|no power|dead|failed/.test(message)) score += 40;
      if (/repair|fix|troubleshoot|service|technician/.test(message)) score += 35;
      if (/error|fault|issue|problem/.test(message)) score += 30;

      // High intent keywords (new installation)
      if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
      if (/need|looking for|hire|asap|urgent/.test(message)) score += 25;
      if (/install/.test(message)) score += 20;
      if (/recommend|recommendation/.test(message)) score += 10;

      // Recent posts
      if (post.timestamp) {
        const age = new Date() - new Date(post.timestamp);
        const hours = age / (1000 * 60 * 60);
        if (hours < 24) score += 25;
        else if (hours < 72) score += 15;
        else if (hours < 168) score += 10;
      }

      // BOOST SCORE if they included contact info (EXTREMELY hot - ready to buy!)
      if (phone) score += 25;
      if (email) score += 25;

      const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

      leads.push({
        source: 'Craigslist',
        platform: `Craigslist ${city}`,
        name: 'Anonymous', // Craigslist doesn't show names in listings
        location: post.location || location,
        message: post.title,
        profileUrl: '',
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
    console.error(`  Error searching Craigslist:`, error.message);
  }

  console.log(`✅ Craigslist scraping complete: ${leads.length} leads found`);
  return leads;
}

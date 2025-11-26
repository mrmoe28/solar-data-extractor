/**
 * City-Data Forums Solar Lead Scraper
 * Scrapes local city forums for solar installation/repair discussions
 * Uses RSS feeds - no browser automation required
 */
export async function scrapeCityDataLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching City-Data forums for solar leads in ${location}...`);

  const leads = [];

  // Map locations to City-Data forum IDs
  const cityForums = {
    'atlanta': { id: '171', name: 'Atlanta' },
    'georgia': { id: '171', name: 'Atlanta' }, // Default to Atlanta for Georgia
    'savannah': { id: '184', name: 'Savannah' },
    'augusta': { id: '164', name: 'Augusta' },
    'macon': { id: '180', name: 'Macon' },
    'columbus': { id: '169', name: 'Columbus' },
    'athens': { id: '163', name: 'Athens' },
    'sandy springs': { id: '171', name: 'Atlanta' },
    'roswell': { id: '171', name: 'Atlanta' },
    'johns creek': { id: '171', name: 'Atlanta' },
    'albany': { id: '162', name: 'Albany' },
    'marietta': { id: '171', name: 'Atlanta' },
    'fulton': { id: '171', name: 'Atlanta' }
  };

  const forum = cityForums[location.toLowerCase()] || cityForums['atlanta'];

  try {
    // City-Data RSS feed for recent forum posts
    const rssUrl = `https://www.city-data.com/forum/rss/rss-${forum.id}.xml`;
    console.log(`  Checking: ${forum.name} forum (${rssUrl})`);

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

    console.log(`    Found ${items.length} recent forum posts`);

    const posts = items.slice(0, 50).map(item => {
      try {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

        const title = titleMatch ? titleMatch[1] : '';
        const postUrl = linkMatch ? linkMatch[1] : '';
        const timestamp = dateMatch ? new Date(dateMatch[1]).toISOString() : '';
        const description = descMatch ? descMatch[1] : '';

        // Extract username from description (usually at the start)
        const usernameMatch = description.match(/^([A-Za-z0-9_]+):/);
        const username = usernameMatch ? usernameMatch[1] : 'Anonymous';

        // Check if it's about solar installation/repair
        const fullText = `${title} ${description}`;
        const fullTextLower = fullText.toLowerCase();

        // CRITICAL: Must mention solar PANELS/POWER/INSTALLATION
        const hasSolarContext = /solar panel|solar power|solar energy|solar installation|solar installer|solar system|photovoltaic|pv system|solar array|solar roof|inverter/i.test(fullText);

        if (!hasSolarContext) {
          return null; // Skip non-solar posts
        }

        // ONLY ACCEPT: Installation requests OR Repair requests
        const isInstallationRequest = /looking for.*installer|need.*installer|hire.*installer|recommend.*installer|seeking.*installer|anyone install|who installs|get solar|thinking about solar|considering solar/i.test(fullText);
        const isRepairRequest = /not working|broken|stopped working|no power|error|fault|failed|repair|fix|troubleshoot|inverter.*issue|panel.*issue|system.*down|offline/i.test(fullText);

        if (!isInstallationRequest && !isRepairRequest) {
          return null; // Skip if not asking for help
        }

        // FILTER OUT BUSINESS ADS
        const isBusinessAd = /we offer|our company|our team|our service|free estimate|call us|contact us|visit our|licensed and|certified|years of experience|family owned|serving|professional/i.test(fullText);

        if (isBusinessAd) {
          return null; // Skip business ads
        }

        return {
          title,
          postUrl,
          timestamp,
          description: description.substring(0, 500),
          username,
          intent: isRepairRequest ? 'Repair/Service' : 'Installation'
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Score and add to leads
    posts.forEach(post => {
      const message = `${post.title} ${post.description}`.toLowerCase();
      let score = 0;

      // REPAIR/TROUBLESHOOTING = EXTREMELY HOT
      if (/not working|broken|stopped working|no power|failed/.test(message)) score += 40;
      if (/repair|fix|troubleshoot|service/.test(message)) score += 35;
      if (/error|fault|inverter.*issue|panel.*issue/.test(message)) score += 30;

      // High intent keywords (new installation)
      if (/quote|estimate|cost|price|how much/.test(message)) score += 30;
      if (/need|looking for|hire|seeking/.test(message)) score += 25;
      if (/recommend|recommendation|best/.test(message)) score += 20;
      if (/thinking about|considering|planning/.test(message)) score += 15;

      // Recent posts
      if (post.timestamp) {
        const age = new Date() - new Date(post.timestamp);
        const hours = age / (1000 * 60 * 60);
        if (hours < 24) score += 20;
        else if (hours < 72) score += 15;
        else if (hours < 168) score += 10;
      }

      // City-Data forum users are typically homeowners (good quality)
      score += 10;

      const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

      leads.push({
        source: 'City-Data Forums',
        platform: `City-Data ${forum.name}`,
        name: `${post.username} (Forum)`,
        location: `${forum.name}, GA`,
        message: post.title.substring(0, 500),
        profileUrl: `https://www.city-data.com/forum/members/${post.username.toLowerCase()}.html`,
        postUrl: post.postUrl,
        timestamp: post.timestamp || new Date().toISOString(),
        score,
        priority,
        intent: post.intent,
        phone: `Forum DM: ${post.username}`,
        email: '',
        contactMethod: 'Forum DM'
      });
    });

    console.log(`    Found ${posts.length} solar-related posts`);

  } catch (error) {
    console.error(`  Error searching City-Data:`, error.message);
  }

  console.log(`✅ City-Data scraping complete: ${leads.length} leads found`);
  return leads;
}

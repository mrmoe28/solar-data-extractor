/**
 * Reddit Solar Lead Scraper
 * Uses Reddit's JSON API to find real people asking about solar
 */
export async function scrapeRedditLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Reddit for solar leads in ${location}...`);

  const leads = [];
  const seenPostUrls = new Set(); // Track seen posts to avoid duplicates

  // OPTIMIZED: Focus on high-quality searches to avoid rate limiting
  // Use targeted subreddit searches instead of broad keyword searches
  const searches = [
    // Solar-specific subreddits (most relevant)
    `(installer OR repair OR "not working" OR broken) ${location} subreddit:solar`,
    `(installer OR repair OR "not working" OR broken) ${location} subreddit:SolarDIY`,

    // Location-specific subreddits (local discussion)
    `(solar OR "solar panel" OR "solar power") (installer OR repair OR broken) subreddit:${location.toLowerCase()}`,

    // Home improvement subreddits (installation requests)
    `solar (installer OR repair OR quote) ${location} subreddit:homeimprovement`,
    `solar (installer OR repair OR quote) ${location} subreddit:HomeOwners`,

    // Broad searches for repair (HOT leads - people with urgent problems)
    `"solar not working" ${location}`,
    `"solar repair" ${location}`,
    `"solar panel broken" ${location}`
  ];

  for (const query of searches) {
    try {
      console.log(`  Checking: ${query}`);

      // Use Reddit's JSON API (much more reliable than scraping HTML)
      const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=25&t=month`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.log(`    API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const posts = data?.data?.children || [];

      let foundCount = 0;

      // Process each post
      for (const item of posts) {
        const post = item.data;

        // Check if it's a question/request (including repair/troubleshooting)
        const title = post.title || '';
        const selftext = post.selftext || '';
        const fullText = `${title} ${selftext}`;
        const fullTextLower = fullText.toLowerCase();

        // CRITICAL: Must mention solar PANELS/POWER/INSTALLATION (not just "solar system" as in space)
        const hasSolarContext = /solar panel|solar power|solar energy|solar installation|solar installer|solar system installation|photovoltaic|pv system|solar array|solar roof/i.test(fullText);

        if (!hasSolarContext) {
          continue; // Skip posts about space, fiction, or unrelated "solar" mentions
        }

        // EXTRA FILTER: Solar keywords must appear in TITLE or post must be from solar-related subreddit
        const titleLower = title.toLowerCase();
        const hasSolarInTitle = /solar panel|solar power|solar energy|solar installation|solar installer|photovoltaic|pv|inverter|solar|panel/i.test(title);
        const isSolarSubreddit = /solar|renewable|green.*energy|homeimprovement|diy|electrical|homeowners/i.test(post.subreddit);

        // Accept if: (solar in title) OR (solar subreddit AND installation/repair request)
        if (!hasSolarInTitle && !isSolarSubreddit) {
          continue; // Skip if solar only mentioned in body of non-solar subreddit
        }

        // FILTER OUT BUSINESS ADS AND PROMOTIONAL CONTENT
        const isBusinessAd = /we offer|our company|our team|our service|free estimate|call us|contact us|visit our|licensed and|certified|years of experience|family owned|serving|professional|check us out|dm for|pm for|click here|www\.|\.com|discount|promotion|special offer/i.test(fullText);

        if (isBusinessAd) {
          continue; // Skip business ads
        }

        // ONLY ACCEPT: Installation requests OR Repair requests
        const isInstallationRequest = /looking for.*installer|need.*installer|hire.*installer|recommend.*installer|seeking.*installer|anyone install|who installs/i.test(fullText);
        const isRepairRequest = /not working|broken|stopped working|no power|error|fault|failed|repair|fix|troubleshoot|inverter.*issue|panel.*issue|system.*down|offline/i.test(fullText);

        // Must be ASKING for installation or repair (not offering services)
        if (!isInstallationRequest && !isRepairRequest) {
          continue;
        }

        // Skip deleted accounts
        if (!post.author || post.author === '[deleted]') {
          continue;
        }

        // Skip duplicate posts (same URL already processed)
        const postUrl = `https://reddit.com${post.permalink}`;
        if (seenPostUrls.has(postUrl)) {
          continue;
        }
        seenPostUrls.add(postUrl);

        foundCount++;

        // Extract location from post content
        let extractedLocation = location; // Default to search location
        const locationMatch = fullText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(GA|Georgia|AL|Alabama|FL|Florida|TN|Tennessee|SC|South Carolina|NC|North Carolina)\b/);
        if (locationMatch) {
          extractedLocation = `${locationMatch[1]}, ${locationMatch[2]}`;
        }

        // Extract phone number if included in post
        const phoneMatch = fullText.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        // Extract email if included in post
        const emailMatch = fullText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[0] : '';

        // Determine specific intent: ONLY Installation or Repair
        let intent = 'Installation';
        const messageText = fullText.toLowerCase();

        if (isRepairRequest) {
          intent = 'Repair/Service';
        } else if (isInstallationRequest) {
          intent = 'Installation';
        }

        // Score the lead
        let score = 0;

        // REPAIR/TROUBLESHOOTING = EXTREMELY HOT (broken system = urgent need!)
        if (/not working|broken|stopped working|no power|error|fault|failed/.test(messageText)) score += 40;
        if (/repair|fix|troubleshoot|service|maintenance/.test(messageText)) score += 35;
        if (/inverter|panel|system.*down|offline/.test(messageText)) score += 30;
        if (/installer.*not responding|can't reach|won't answer/.test(messageText)) score += 25;

        // High intent keywords (new installation)
        if (/quote|estimate|cost|price|how much/.test(messageText)) score += 30;
        if (/need|looking for|hire/.test(messageText)) score += 20;
        if (/urgent|asap|soon|immediately/.test(messageText)) score += 15;
        if (/recommend|recommendation|best/.test(messageText)) score += 10;

        // Recent posts
        const postTime = post.created_utc ? new Date(post.created_utc * 1000) : new Date();
        const age = new Date() - postTime;
        const days = age / (1000 * 60 * 60 * 24);
        if (days < 1) score += 20;
        else if (days < 7) score += 10;
        else if (days < 30) score += 5;

        // BOOST SCORE if they included contact info (very hot!)
        if (phone) score += 20;
        if (email) score += 20;

        const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

        // Better name formatting
        const displayName = phone || email
          ? post.author // If they have contact info, show username
          : `Contact via Reddit: u/${post.author}`;

        leads.push({
          source: 'Reddit',
          platform: `r/${post.subreddit}`,
          name: displayName,
          location: extractedLocation,
          message: title.substring(0, 500), // Limit message length
          profileUrl: `https://reddit.com/user/${post.author}`,
          postUrl: postUrl,
          timestamp: postTime.toISOString(),
          score,
          priority,
          intent,
          phone,
          email
        });
      }

      console.log(`    Found ${foundCount} potential leads`);

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }

    // Rate limit: Wait 2 seconds between searches (avoid 429 errors)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`✅ Reddit scraping complete: ${leads.length} leads found`);
  return leads;
}

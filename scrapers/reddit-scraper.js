/**
 * Enhanced Reddit Solar Lead Scraper with OAuth Support & Rate Limit Handling
 * Works without OAuth but performs better with it
 */

let accessToken = null;
let tokenExpiry = null;

/**
 * Get Reddit OAuth access token (optional - falls back to public API)
 */
async function getAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  // If no credentials, use public API
  if (!clientId || !clientSecret) {
    return null;
  }

  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SolarLeadAutomation/1.0'
      },
      body: 'grant_type=client_credentials'
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
      console.log('  ✓ Reddit OAuth authenticated');
      return accessToken;
    }
  } catch (error) {
    console.log('  ⚠️  Reddit OAuth failed, using public API');
  }

  return null;
}

/**
 * Fetch with exponential backoff retry logic
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success
      if (response.ok) {
        return response;
      }

      // Rate limited - wait and retry
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
        console.log(`    ⏳ Rate limited, waiting ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Other errors - return immediately
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Check if a Reddit post has been resolved in comments
 */
async function checkIfResolved(permalink, token) {
  try {
    const commentsUrl = token
      ? `https://oauth.reddit.com${permalink}.json`
      : `https://www.reddit.com${permalink}.json`;

    const headers = {
      'User-Agent': 'SolarLeadAutomation/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithRetry(commentsUrl, { headers }, 2);
    if (!response.ok) return false;

    const data = await response.json();
    if (!data || data.length < 2) return false;

    const post = data[0]?.data?.children?.[0]?.data;
    const comments = data[1]?.data?.children || [];
    const opAuthor = post?.author;
    if (!opAuthor) return false;

    // Check OP's replies for resolution indicators
    const resolutionKeywords = /thank|thanks|solved|fixed|worked|perfect|exactly what i needed|that did it|problem solved|issue resolved|all set|got it working|this helped|appreciate|you're right/i;

    for (const comment of comments) {
      const commentData = comment.data;
      if (!commentData || commentData.author !== opAuthor) continue;

      const commentText = commentData.body || '';
      if (resolutionKeywords.test(commentText)) {
        console.log(`    ✗ Skipping - OP found solution: "${commentText.substring(0, 50)}..."`);
        return true;
      }
    }

    // Check if post is marked as resolved
    const flair = post?.link_flair_text?.toLowerCase() || '';
    if (flair.includes('solved') || flair.includes('resolved') || flair.includes('closed')) {
      console.log(`    ✗ Skipping - Post marked as: ${flair}`);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Reddit Solar Lead Scraper
 */
export async function scrapeRedditLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching Reddit for solar leads in ${location}...`);

  // Get OAuth token if available
  const token = await getAccessToken();

  const leads = [];
  const seenPostUrls = new Set();

  // OPTIMIZED: Reduced searches to avoid rate limiting (8 → 4)
  // Focus on highest-value sources only
  const searches = [
    // Solar-specific subreddits (most relevant - HIGH ROI)
    `(installer OR repair OR "not working" OR broken) ${location} subreddit:solar`,

    // DIY solar (people troubleshooting - HOT LEADS)
    `(installer OR repair OR "not working" OR broken) ${location} subreddit:SolarDIY`,

    // Urgent repair requests (HOTTEST LEADS)
    `"solar not working" ${location}`,
    `"solar panel broken" ${location}`,
  ];

  for (const query of searches) {
    try {
      console.log(`  Checking: ${query}`);

      const baseUrl = token ? 'https://oauth.reddit.com' : 'https://www.reddit.com';
      const searchUrl = `${baseUrl}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=25&t=month`;

      const headers = {
        'User-Agent': 'SolarLeadAutomation/1.0'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithRetry(searchUrl, { headers });

      if (!response.ok) {
        console.log(`    API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const posts = data?.data?.children || [];

      let foundCount = 0;

      for (const item of posts) {
        const post = item.data;

        // Check if it's a question/request
        const title = post.title || '';
        const selftext = post.selftext || '';
        const fullText = `${title} ${selftext}`;

        // Must mention solar panels/power/installation
        const hasSolarContext = /solar panel|solar power|solar energy|solar installation|solar installer|solar system installation|photovoltaic|pv system|solar array|solar roof/i.test(fullText);
        if (!hasSolarContext) continue;

        // Solar in title OR solar subreddit
        const hasSolarInTitle = /solar panel|solar power|solar energy|solar installation|solar installer|photovoltaic|pv|inverter|solar|panel/i.test(title);
        const isSolarSubreddit = /solar|renewable|green.*energy|homeimprovement|diy|electrical|homeowners/i.test(post.subreddit);
        if (!hasSolarInTitle && !isSolarSubreddit) continue;

        // Filter out business ads
        const isBusinessAd = /we offer|our company|our team|our service|free estimate|call us|contact us|visit our|licensed and|certified|years of experience|family owned|serving|professional|check us out|dm for|pm for|click here|www\\.|\\.com|discount|promotion|special offer/i.test(fullText);
        if (isBusinessAd) continue;

        // Only accept installation or repair requests
        const isInstallationRequest = /looking for.*installer|need.*installer|hire.*installer|recommend.*installer|seeking.*installer|anyone install|who installs/i.test(fullText);
        const isRepairRequest = /not working|broken|stopped working|no power|error|fault|failed|repair|fix|troubleshoot|inverter.*issue|panel.*issue|system.*down|offline/i.test(fullText);
        if (!isInstallationRequest && !isRepairRequest) continue;

        // Skip deleted accounts
        if (!post.author || post.author === '[deleted]') continue;

        // Skip duplicates
        const postUrl = `https://reddit.com${post.permalink}`;
        if (seenPostUrls.has(postUrl)) continue;
        seenPostUrls.add(postUrl);

        // Check if resolved in comments
        const isResolved = await checkIfResolved(post.permalink, token);
        if (isResolved) continue;

        foundCount++;

        // Extract location
        let extractedLocation = location;
        const locationMatch = fullText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(GA|Georgia|AL|Alabama|FL|Florida|TN|Tennessee|SC|South Carolina|NC|North Carolina)\b/);
        if (locationMatch) {
          extractedLocation = `${locationMatch[1]}, ${locationMatch[2]}`;
        }

        // Extract contact info
        const phoneMatch = fullText.match(/(\d{3}[-.\\s]?\d{3}[-.\\s]?\d{4}|\\(\\d{3}\\)\\s*\d{3}[-.\\s]?\d{4})/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        const emailMatch = fullText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[0] : '';

        // Determine intent
        let intent = isRepairRequest ? 'Repair/Service' : 'Installation';

        // Score the lead
        let score = 0;
        const messageText = fullText.toLowerCase();

        // REPAIR = HOTTEST
        if (/not working|broken|stopped working|no power|error|fault|failed/.test(messageText)) score += 40;
        if (/repair|fix|troubleshoot|service|maintenance/.test(messageText)) score += 35;
        if (/inverter|panel|system.*down|offline/.test(messageText)) score += 30;

        // High intent
        if (/quote|estimate|cost|price|how much/.test(messageText)) score += 30;
        if (/need|looking for|hire/.test(messageText)) score += 20;
        if (/urgent|asap|soon|immediately/.test(messageText)) score += 15;

        // Recency
        const postTime = post.created_utc ? new Date(post.created_utc * 1000) : new Date();
        const age = new Date() - postTime;
        const days = age / (1000 * 60 * 60 * 24);
        if (days < 1) score += 20;
        else if (days < 7) score += 10;
        else if (days < 30) score += 5;

        // Contact info boost
        if (phone) score += 20;
        if (email) score += 20;

        const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

        const displayName = phone || email ? post.author : `u/${post.author}`;

        leads.push({
          source: 'Reddit',
          platform: `r/${post.subreddit}`,
          name: displayName,
          location: extractedLocation,
          message: title.substring(0, 500),
          profileUrl: `https://reddit.com/user/${post.author}`,
          postUrl: postUrl,
          timestamp: postTime.toISOString(),
          score,
          priority,
          intent,
          phone: phone || `DM: u/${post.author}`,
          email: email || '',
          contactMethod: phone ? 'Phone' : email ? 'Email' : 'Reddit DM'
        });
      }

      console.log(`    Found ${foundCount} potential leads`);

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }

    // Rate limit: Wait between searches
    // With OAuth: 1s, Without OAuth: 5s (to avoid 429 errors)
    const delay = token ? 1000 : 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log(`✅ Reddit scraping complete: ${leads.length} leads found`);
  return leads;
}

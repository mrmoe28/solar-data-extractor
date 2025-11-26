/**
 * Web Search Aggregator for Solar Leads
 * Searches Google, Bing, and other search engines for solar installation/repair requests
 * Finds forum posts, social media, Q&A sites mentioning solar needs
 */
export async function scrapeWebSearchLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching web for solar leads in ${location}...`);

  const leads = [];

  // Search queries that find people asking for solar help
  const searches = [
    // Installation requests
    `"need solar installer" ${location} site:reddit.com OR site:facebook.com OR site:nextdoor.com`,
    `"looking for solar installer" ${location} inurl:forum OR inurl:community`,
    `"solar installation quote" ${location} site:homeadvisor.com OR site:angieslist.com OR site:thumbtack.com`,

    // Repair/troubleshooting (VERY HOT!)
    `"solar panel not working" ${location} site:reddit.com OR site:quora.com`,
    `"solar repair" ${location} inurl:question OR inurl:ask`,
    `"solar panel broken" ${location} site:reddit.com`,

    // Q&A sites
    `"solar installer recommendation" ${location} site:quora.com OR site:reddit.com`,
    `"best solar company" ${location} site:yelp.com OR site:bbb.org`
  ];

  for (const query of searches) {
    try {
      console.log(`  Searching: ${query.substring(0, 60)}...`);

      // Use Google Custom Search JSON API (free tier: 100 queries/day)
      // You need to set up API key: https://developers.google.com/custom-search/v1/overview
      const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

      if (!apiKey || !searchEngineId) {
        console.log(`  ⚠️  Google Search API not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env`);
        console.log(`  Skipping web search for now...`);
        break;
      }

      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;

      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.log(`    API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const items = data.items || [];

      let foundCount = 0;

      for (const item of items) {
        const title = item.title || '';
        const snippet = item.snippet || '';
        const link = item.link || '';
        const fullText = `${title} ${snippet}`;

        // Check if it's a real request (not a business listing)
        const isRequest = /looking for|need|recommend|anyone know|help|advice|quote|not working|broken|repair|fix/i.test(fullText);
        const isNotAd = !/we offer|our company|hire us|call us|free estimate/i.test(fullText);

        if (isRequest && isNotAd) {
          foundCount++;

          // Extract source platform
          let source = 'Web Search';
          if (link.includes('reddit.com')) source = 'Reddit';
          else if (link.includes('quora.com')) source = 'Quora';
          else if (link.includes('facebook.com')) source = 'Facebook';
          else if (link.includes('nextdoor.com')) source = 'Nextdoor';
          else if (link.includes('yelp.com')) source = 'Yelp';

          // Determine intent
          let intent = 'Installation';
          if (/not working|broken|repair|fix/i.test(fullText)) {
            intent = 'Repair/Service';
          }

          // Score the lead
          let score = 0;
          const lowerText = fullText.toLowerCase();

          // Repair = hottest
          if (/not working|broken|failed/.test(lowerText)) score += 40;
          if (/repair|fix/.test(lowerText)) score += 35;

          // High intent
          if (/quote|estimate|cost/.test(lowerText)) score += 30;
          if (/need|looking for/.test(lowerText)) score += 25;
          if (/urgent|asap/.test(lowerText)) score += 20;

          const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

          leads.push({
            source: source,
            platform: 'Web Search',
            name: 'See post for contact',
            location: location,
            message: title.substring(0, 500),
            profileUrl: '',
            postUrl: link,
            timestamp: new Date().toISOString(),
            score,
            priority,
            intent,
            phone: '',
            email: ''
          });
        }
      }

      console.log(`    Found ${foundCount} potential leads`);

      // Rate limit: Wait 1 second between searches
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  Error searching:`, error.message);
    }
  }

  console.log(`✅ Web search complete: ${leads.length} leads found`);
  return leads;
}

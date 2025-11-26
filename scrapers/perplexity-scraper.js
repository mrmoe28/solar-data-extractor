/**
 * Perplexity AI Search Scraper
 * Uses Perplexity's Search API to find solar leads across the entire web
 * Searches hundreds of billions of webpages in one API call
 */

export async function scrapePerplexityLeads(location = 'Georgia') {
  console.log(`\n🔍 Perplexity AI Search: Scanning web for solar leads in ${location}...`);

  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.log(`  ⚠️  Perplexity API not configured. Skipping...`);
    console.log(`  💡 Get API key at: https://www.perplexity.ai/api-platform`);
    return [];
  }

  const leads = [];

  // Optimized search queries for solar leads
  const searches = [
    // Installation requests
    `"need solar installer" OR "looking for solar installer" ${location}`,
    `"solar installation quote" OR "solar panel estimate" ${location}`,
    `"recommend solar company" OR "best solar installer" ${location}`,

    // Repair/service requests (HOT leads!)
    `"solar not working" OR "solar panel broken" ${location}`,
    `"solar repair" OR "inverter not working" ${location}`,
    `"solar system down" OR "solar panel issue" ${location}`,

    // Forum discussions
    `solar installer recommendation ${location} site:reddit.com OR site:quora.com`,
    `solar repair help ${location} forum OR community`,
  ];

  for (const query of searches) {
    try {
      console.log(`  Searching: ${query.substring(0, 60)}...`);

      // Perplexity Search API endpoint
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a lead generation assistant. Extract posts/messages where people are asking for solar installation or repair services. Return results as a JSON array with fields: source, url, title, snippet, author (if available).'
            },
            {
              role: 'user',
              content: `Find recent posts where people in ${location} are asking for solar installation or repair services. Search query: ${query}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1,
          search_domain_filter: ['reddit.com', 'quora.com', 'nextdoor.com', 'facebook.com'],
          return_citations: true,
          search_recency_filter: 'month', // Only last month
        }),
      });

      if (!response.ok) {
        console.log(`    API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const citations = data.citations || [];

      // Parse results and create leads
      for (const citation of citations) {
        const url = citation.url || '';
        const title = citation.title || '';
        const snippet = citation.snippet || '';

        // Filter for actual requests (not business ads)
        const fullText = `${title} ${snippet}`.toLowerCase();

        const isRequest = /looking for|need|recommend|anyone know|help|advice|quote|not working|broken|repair|fix/i.test(fullText);
        const isNotAd = !/we offer|our company|hire us|call us|free estimate|licensed and|certified|years of experience/i.test(fullText);
        const hasSolar = /solar|inverter|photovoltaic|pv system/i.test(fullText);

        if (isRequest && isNotAd && hasSolar) {
          // Determine source from URL
          let source = 'Web';
          let platform = 'Perplexity Search';
          if (url.includes('reddit.com')) {
            source = 'Reddit';
            platform = 'r/' + (url.match(/\/r\/([^\/]+)/) || ['', 'unknown'])[1];
          } else if (url.includes('quora.com')) {
            source = 'Quora';
          } else if (url.includes('nextdoor.com')) {
            source = 'Nextdoor';
          } else if (url.includes('facebook.com')) {
            source = 'Facebook';
          }

          // Score the lead
          let score = 0;

          // REPAIR = EXTREMELY HOT
          if (/not working|broken|stopped working|no power|error|fault|failed/.test(fullText)) score += 40;
          if (/repair|fix|troubleshoot|service/.test(fullText)) score += 35;
          if (/urgent|asap|soon|immediately/.test(fullText)) score += 15;

          // Installation intent
          if (/quote|estimate|cost|price|how much/.test(fullText)) score += 30;
          if (/need|looking for|hire/.test(fullText)) score += 20;
          if (/recommend|recommendation|best/.test(fullText)) score += 10;

          // Determine intent
          let intent = 'Installation';
          if (/not working|broken|repair|fix|troubleshoot/.test(fullText)) {
            intent = 'Repair/Service';
          }

          const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

          leads.push({
            source,
            platform,
            name: 'See post for contact',
            location,
            message: title.substring(0, 500),
            profileUrl: '',
            postUrl: url,
            timestamp: new Date().toISOString(),
            score,
            priority,
            intent,
            phone: '',
            email: '',
          });
        }
      }

      console.log(`    Found ${citations.length} results`);

      // Rate limit: Wait 2 seconds between searches
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`  Error searching "${query.substring(0, 40)}...":`, error.message);
    }
  }

  console.log(`✅ Perplexity search complete: ${leads.length} leads found`);
  return leads;
}

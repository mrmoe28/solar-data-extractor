/**
 * YouTube Comments Lead Scraper
 * Finds leads from people commenting on solar panel videos
 * Uses YouTube Data API v3 (FREE tier: 10,000 requests/day)
 */

export async function scrapeYouTubeLeads(location = 'Georgia') {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.log('     YouTube API not configured. Skipping...');
    console.log('  =¡ Get free API key at: https://console.cloud.google.com/apis/library/youtube.googleapis.com');
    return [];
  }

  console.log(`\n=ú Searching YouTube comments for solar leads in ${location}...`);

  const leads = [];
  const seenCommenters = new Set();

  // Search queries for solar videos
  const searchQueries = [
    `solar panel not working ${location}`,
    `solar repair help ${location}`,
    `solar installation ${location}`,
    `inverter not working ${location}`,
    `solar panel broken ${location}`,
    `need solar installer ${location}`
  ];

  for (const query of searchQueries) {
    try {
      console.log(`  Searching videos: ${query}`);

      // Step 1: Find relevant videos
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`;

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        console.log(`    API error: ${searchResponse.status}`);
        continue;
      }

      const searchData = await searchResponse.json();
      const videos = searchData.items || [];

      console.log(`    Found ${videos.length} videos`);

      // Step 2: Get comments from each video
      for (const video of videos) {
        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;

        try {
          const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&key=${apiKey}`;

          const commentsResponse = await fetch(commentsUrl);
          if (!commentsResponse.ok) continue;

          const commentsData = await commentsResponse.json();
          const commentThreads = commentsData.items || [];

          // Step 3: Analyze each comment for leads
          for (const thread of commentThreads) {
            const comment = thread.snippet.topLevelComment.snippet;
            const commentText = comment.textDisplay;
            const author = comment.authorDisplayName;
            const channelId = comment.authorChannelId?.value;

            // Skip if we've already seen this commenter
            if (seenCommenters.has(channelId)) continue;
            seenCommenters.add(channelId);

            // Filter for actual requests (not just comments)
            const textLower = commentText.toLowerCase();

            // Must be asking for help or service
            const isRequest = /help|anyone know|need|looking for|recommend|broken|not working|repair|fix|installer|quote/i.test(commentText);

            // Must mention solar
            const hasSolar = /solar|panel|inverter|photovoltaic|pv system/i.test(commentText);

            // Filter out business ads
            const isNotAd = !/we offer|our company|call us|visit our|www\\.|\\.com|hire us/i.test(commentText);

            if (isRequest && hasSolar && isNotAd) {
              // Determine intent
              let intent = 'Installation';
              if (/not working|broken|repair|fix|troubleshoot|error/.test(textLower)) {
                intent = 'Repair/Service';
              }

              // Score the lead
              let score = 0;

              // REPAIR = HOT
              if (/not working|broken|stopped working|error|fault|failed/.test(textLower)) score += 40;
              if (/repair|fix|troubleshoot/.test(textLower)) score += 30;
              if (/urgent|asap|help please/.test(textLower)) score += 15;

              // Installation intent
              if (/quote|estimate|cost|price/.test(textLower)) score += 25;
              if (/need|looking for|recommend/.test(textLower)) score += 20;

              // Location mentioned
              if (commentText.toLowerCase().includes(location.toLowerCase())) score += 15;

              const priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

              // Extract contact info (rare but sometimes people post it)
              const phoneMatch = commentText.match(/(\d{3}[-.\\s]?\d{3}[-.\\s]?\d{4})/);
              const emailMatch = commentText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/);

              const phone = phoneMatch ? phoneMatch[0] : '';
              const email = emailMatch ? emailMatch[0] : '';

              if (phone) score += 20;
              if (email) score += 20;

              leads.push({
                source: 'YouTube',
                platform: 'Video Comments',
                name: author,
                location: location,
                message: commentText.replace(/<[^>]*>/g, '').substring(0, 500), // Strip HTML
                profileUrl: `https://www.youtube.com/channel/${channelId}`,
                postUrl: `https://www.youtube.com/watch?v=${videoId}&lc=${thread.id}`,
                timestamp: comment.publishedAt,
                score,
                priority,
                intent,
                phone: phone || `YouTube: @${author}`,
                email: email || '',
                contactMethod: phone ? 'Phone' : email ? 'Email' : 'YouTube Comment Reply',
                videoContext: videoTitle
              });
            }
          }

        } catch (error) {
          // Skip this video if comments disabled
          continue;
        }

        // Rate limit between videos
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`    Found ${leads.length} leads so far`);

      // Rate limit between searches
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`  Error searching "${query}":`, error.message);
    }
  }

  console.log(` YouTube scraping complete: ${leads.length} leads found`);
  return leads;
}

#!/usr/bin/env node
/**
 * Solar Customer Lead Generator
 * Finds: Homeowners & businesses actively looking for solar installation/troubleshooting
 * Sources: Social media, forums, review sites, quote request sites
 * Output: Hot leads ready for outreach
 */

const fs = require('fs');
const path = require('path');

class SolarCustomerLeadGenerator {
  constructor() {
    this.leads = [];
    this.outputDir = path.join(__dirname, '..', 'output');
    this.timestamp = new Date().toISOString().split('T')[0];

    this.leadSources = {
      facebook: 'Facebook Groups',
      nextdoor: 'Nextdoor',
      reddit: 'Reddit',
      yelp: 'Yelp Reviews',
      homeAdvisor: 'HomeAdvisor',
      thumbtack: 'Thumbtack',
      angiesList: "Angie's List",
      google: 'Google Reviews',
      twitter: 'Twitter/X'
    };

    this.searchQueries = {
      installation: [
        'looking for solar panel installer',
        'need solar installation quote',
        'solar panel installation recommendations',
        'best solar installer near me',
        'solar panel installation cost',
        'thinking about going solar'
      ],
      troubleshooting: [
        'solar panels not working',
        'solar inverter error',
        'solar system troubleshooting',
        'solar panel repair needed',
        'solar panels stopped producing',
        'need solar technician'
      ],
      maintenance: [
        'solar panel cleaning',
        'solar panel maintenance',
        'solar system checkup',
        'solar panel inspection'
      ]
    };
  }

  /**
   * Generate search URLs for customer leads
   */
  getCustomerSearchURLs(location, type = 'installation') {
    const queries = this.searchQueries[type] || this.searchQueries.installation;

    return {
      // Facebook Groups (solar, homeowner, local groups)
      facebook: queries.map(q =>
        `https://www.facebook.com/search/groups/?q=${encodeURIComponent(q + ' ' + location)}`
      ),

      // Nextdoor (neighborhood-specific)
      nextdoor: `https://nextdoor.com/search/?query=${encodeURIComponent('solar installation ' + location)}`,

      // Reddit discussions
      reddit: queries.map(q =>
        `https://www.reddit.com/search/?q=${encodeURIComponent(q + ' ' + location)}&type=post`
      ),

      // Yelp - people asking questions
      yelp: `https://www.yelp.com/search?find_desc=${encodeURIComponent('solar installation')}&find_loc=${encodeURIComponent(location)}`,

      // HomeAdvisor quote requests
      homeAdvisor: `https://www.homeadvisor.com/c.Solar-Energy-Contractors.${encodeURIComponent(location)}.html`,

      // Thumbtack - service requests
      thumbtack: `https://www.thumbtack.com/k/solar-panel-installation/near-me/?zip_code=${location}`,

      // Google - local searches
      google: `https://www.google.com/search?q=${encodeURIComponent('solar installation quote ' + location)}`,

      // Twitter/X
      twitter: queries.map(q =>
        `https://twitter.com/search?q=${encodeURIComponent(q + ' ' + location)}&src=typed_query&f=live`
      )
    };
  }

  /**
   * Extract Facebook Group Posts (people asking about solar)
   */
  getFacebookExtractorScript() {
    return `
      (function() {
        const leads = [];
        const posts = document.querySelectorAll('[role="article"]');

        posts.forEach((post) => {
          try {
            // Get post text
            const textEl = post.querySelector('[data-ad-preview="message"]');
            const text = textEl ? textEl.textContent.trim() : '';

            // Get author name
            const authorEl = post.querySelector('a[role="link"] strong, h4 a');
            const author = authorEl ? authorEl.textContent.trim() : '';

            // Get profile link
            const profileLink = authorEl ? authorEl.closest('a')?.href : '';

            // Get timestamp
            const timeEl = post.querySelector('a[aria-label*="ago"]');
            const timestamp = timeEl ? timeEl.textContent.trim() : '';

            // Get location hint from text
            const locationMatch = text.match(/in\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,?\\s*[A-Z]{2}?)/);
            const location = locationMatch ? locationMatch[1] : '';

            // Check if looking for service
            const isLookingFor = /looking for|need|recommend|anyone know|help|quote|estimate|cost/i.test(text);
            const isSolarRelated = /solar|photovoltaic|pv|panel|inverter|installation/i.test(text);

            if (isLookingFor && isSolarRelated && author) {
              leads.push({
                source: 'Facebook',
                name: author,
                profileUrl: profileLink,
                message: text,
                location: location,
                timestamp: timestamp,
                intent: text.toLowerCase().includes('quote') || text.toLowerCase().includes('cost') ? 'High' : 'Medium',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting Facebook post:', e);
          }
        });

        return leads;
      })();
    `;
  }

  /**
   * Extract Reddit Posts
   */
  getRedditExtractorScript() {
    return `
      (function() {
        const leads = [];
        const posts = document.querySelectorAll('[data-testid="post-container"]');

        posts.forEach((post) => {
          try {
            const titleEl = post.querySelector('h3');
            const title = titleEl ? titleEl.textContent.trim() : '';

            const authorEl = post.querySelector('[data-testid="post_author_link"]');
            const author = authorEl ? authorEl.textContent.trim() : '';
            const authorLink = authorEl ? authorEl.href : '';

            const bodyEl = post.querySelector('[data-click-id="text"]');
            const body = bodyEl ? bodyEl.textContent.trim() : '';

            const subredditEl = post.querySelector('[data-click-id="subreddit"]');
            const subreddit = subredditEl ? subredditEl.textContent.trim() : '';

            const permalinkEl = post.querySelector('[data-click-id="comments"]');
            const permalink = permalinkEl ? permalinkEl.href : '';

            const text = title + ' ' + body;
            const isLookingFor = /looking for|need|recommend|anyone|help|quote|advice/i.test(text);
            const isSolarRelated = /solar|panel|inverter|installation/i.test(text);

            if (isLookingFor && isSolarRelated && author) {
              leads.push({
                source: 'Reddit',
                name: author,
                profileUrl: authorLink,
                subreddit: subreddit,
                title: title,
                message: body,
                postUrl: permalink,
                intent: text.toLowerCase().includes('quote') ? 'High' : 'Medium',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting Reddit post:', e);
          }
        });

        return leads;
      })();
    `;
  }

  /**
   * Extract Yelp Quote Requests
   */
  getYelpExtractorScript() {
    return `
      (function() {
        const leads = [];

        // Extract from reviews/questions
        const reviews = document.querySelectorAll('[data-testid*="review"]');
        reviews.forEach((review) => {
          try {
            const userEl = review.querySelector('[data-testid="user-name"]');
            const user = userEl ? userEl.textContent.trim() : '';

            const textEl = review.querySelector('[lang="en"]');
            const text = textEl ? textEl.textContent.trim() : '';

            const locationEl = review.querySelector('[data-testid="user-location"]');
            const location = locationEl ? locationEl.textContent.trim() : '';

            const isQuestion = /\\?\\s*$/.test(text) || /looking for|need|recommend/i.test(text);
            const isSolarRelated = /solar|panel|inverter|installation/i.test(text);

            if (isQuestion && isSolarRelated && user) {
              leads.push({
                source: 'Yelp',
                name: user,
                message: text,
                location: location,
                intent: 'Medium',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting Yelp review:', e);
          }
        });

        return leads;
      })();
    `;
  }

  /**
   * Extract Twitter/X Posts
   */
  getTwitterExtractorScript() {
    return `
      (function() {
        const leads = [];
        const tweets = document.querySelectorAll('[data-testid="tweet"]');

        tweets.forEach((tweet) => {
          try {
            const userEl = tweet.querySelector('[data-testid="User-Name"] a');
            const user = userEl ? userEl.textContent.trim() : '';
            const profileUrl = userEl ? userEl.href : '';

            const textEl = tweet.querySelector('[data-testid="tweetText"]');
            const text = textEl ? textEl.textContent.trim() : '';

            const timeEl = tweet.querySelector('time');
            const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';

            const isLookingFor = /looking for|need|recommend|anyone know|quote/i.test(text);
            const isSolarRelated = /solar|panel|inverter|installation/i.test(text);

            // Extract location from bio or tweet
            const locationMatch = text.match(/in\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,?\\s*[A-Z]{2}?)/);
            const location = locationMatch ? locationMatch[1] : '';

            if (isLookingFor && isSolarRelated && user) {
              leads.push({
                source: 'Twitter',
                name: user,
                profileUrl: profileUrl,
                message: text,
                location: location,
                timestamp: timestamp,
                intent: 'Medium',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting tweet:', e);
          }
        });

        return leads;
      })();
    `;
  }

  /**
   * Extract HomeAdvisor/Thumbtack service requests
   */
  getServiceRequestExtractorScript() {
    return `
      (function() {
        const leads = [];

        // Look for service request cards
        const cards = document.querySelectorAll('[class*="request"], [class*="lead"], [class*="project"]');

        cards.forEach((card) => {
          try {
            const textContent = card.textContent;

            // Extract key info
            const locationMatch = textContent.match(/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,\\s*[A-Z]{2})/);
            const budgetMatch = textContent.match(/\\$([\\d,]+)\\s*-\\s*\\$([\\d,]+)/);
            const timeframeMatch = textContent.match(/(ASAP|within \\d+ (?:days?|weeks?|months?))/i);

            leads.push({
              source: window.location.hostname,
              description: textContent.slice(0, 200),
              location: locationMatch ? locationMatch[1] : '',
              budget: budgetMatch ? budgetMatch[0] : '',
              timeframe: timeframeMatch ? timeframeMatch[1] : '',
              intent: 'High', // These are active requests
              extractedAt: new Date().toISOString()
            });
          } catch (e) {
            console.error('Error extracting service request:', e);
          }
        });

        return leads;
      })();
    `;
  }

  /**
   * Score and prioritize leads
   */
  scoreLeads(leads) {
    return leads.map(lead => {
      let score = 0;
      const message = (lead.message || lead.description || '').toLowerCase();

      // High intent keywords
      if (/quote|estimate|cost|price|how much/i.test(message)) score += 30;
      if (/need|looking for|hire|install/i.test(message)) score += 20;
      if (/urgent|asap|soon|immediately/i.test(message)) score += 15;
      if (/budget|\\$/i.test(message)) score += 10;

      // Location specified
      if (lead.location) score += 10;

      // Recent posts
      if (lead.timestamp) {
        const age = new Date() - new Date(lead.timestamp);
        const days = age / (1000 * 60 * 60 * 24);
        if (days < 1) score += 20;
        else if (days < 7) score += 10;
        else if (days < 30) score += 5;
      }

      // Source reliability
      if (lead.source === 'HomeAdvisor' || lead.source === 'Thumbtack') score += 25;
      if (lead.source === 'Yelp') score += 15;

      lead.score = score;
      lead.priority = score >= 50 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold';

      return lead;
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Export to CSV
   */
  exportToCSV(leads, filename) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const headers = [
      'Priority',
      'Score',
      'Source',
      'Name',
      'Location',
      'Message/Request',
      'Profile URL',
      'Post URL',
      'Timestamp',
      'Intent',
      'Extracted At'
    ];

    const csvRows = [
      headers.join(','),
      ...leads.map(lead => [
        lead.priority || '',
        lead.score || '',
        this.escapeCsv(lead.source),
        this.escapeCsv(lead.name || 'Anonymous'),
        this.escapeCsv(lead.location || ''),
        this.escapeCsv((lead.message || lead.description || '').slice(0, 500)),
        this.escapeCsv(lead.profileUrl || ''),
        this.escapeCsv(lead.postUrl || ''),
        lead.timestamp || '',
        lead.intent || '',
        lead.extractedAt
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, csvContent, 'utf8');
    console.log(`\n✅ Exported ${leads.length} customer leads to: ${filepath}`);

    return filepath;
  }

  escapeCsv(value) {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Print usage
   */
  printUsage() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║          Solar Customer Lead Generator                         ║
║          Find People LOOKING for Solar Services                ║
╚════════════════════════════════════════════════════════════════╝

WHAT IT FINDS:
--------------
✅ Homeowners asking about solar installation
✅ People requesting quotes on social media
✅ Troubleshooting requests (broken systems)
✅ Service requests on HomeAdvisor/Thumbtack
✅ Questions in local Facebook groups
✅ Reddit discussions about going solar
✅ Yelp reviews mentioning solar needs

LEAD SOURCES:
-------------
🔥 HomeAdvisor - Active service requests
🔥 Thumbtack - Quote requests
📱 Facebook Groups - Local homeowner discussions
📱 Nextdoor - Neighborhood requests
🗣️  Reddit - r/solar, r/homeimprovement discussions
⭐ Yelp - People asking in reviews
🐦 Twitter/X - Real-time solar questions

LEAD TYPES:
-----------
1. INSTALLATION LEADS (New customers)
   - "Looking for solar installer in Miami"
   - "Need quote for solar panel installation"
   - "Thinking about going solar"

2. TROUBLESHOOTING LEADS (Service calls)
   - "Solar panels not working"
   - "Inverter showing error"
   - "Need solar technician ASAP"

3. MAINTENANCE LEADS (Ongoing service)
   - "Solar panel cleaning needed"
   - "Annual solar system inspection"

LEAD SCORING:
-------------
🔥 HOT (Score: 50+)
   - Has budget mentioned
   - Says "need quote" or "ASAP"
   - Posted in last 24 hours
   - From HomeAdvisor/Thumbtack

🌡️  WARM (Score: 30-49)
   - Asked for recommendations
   - Posted in last week
   - Has location specified

❄️  COLD (Score: <30)
   - General questions
   - Older posts
   - No urgency indicated

USAGE EXAMPLES:
---------------

Find Installation Leads:
  "Find people looking for solar installation in California"
  → Searches Facebook, Reddit, HomeAdvisor

Find Troubleshooting Customers:
  "Find solar troubleshooting requests in Texas"
  → Searches for broken/malfunctioning systems

Local Leads:
  "Find solar leads in Miami from last 7 days"
  → Recent, location-specific requests

HOW IT WORKS:
-------------
You: "Find solar installation leads in Los Angeles"

Claude:
  1. Searches Facebook groups for LA solar discussions
  2. Checks Reddit r/solar for LA mentions
  3. Scans Nextdoor for neighborhood requests
  4. Checks HomeAdvisor/Thumbtack for active requests
  5. Scores each lead (Hot/Warm/Cold)
  6. Exports prioritized list to CSV

OUTPUT:
-------
📁 ~/solar-data-extractor/output/customer-leads-YYYY-MM-DD.csv

CSV includes:
✅ Lead priority (Hot/Warm/Cold)
✅ Lead score (0-100)
✅ Contact info (name, profile link)
✅ Their exact message/request
✅ Location
✅ How recent
✅ Source platform

OUTREACH STRATEGY:
------------------
HOT LEADS (Respond within 1 hour):
  - Direct message with quote
  - Offer free consultation
  - Fast response wins the job

WARM LEADS (Respond within 24 hours):
  - Helpful response to their question
  - Share relevant experience
  - Build trust before selling

COLD LEADS (Nurture campaign):
  - Add to email list
  - Share educational content
  - Follow up in 30 days

Ready to find customers actively looking for solar services!
    `);
  }
}

if (require.main === module) {
  const generator = new SolarCustomerLeadGenerator();
  generator.printUsage();
} else {
  module.exports = SolarCustomerLeadGenerator;
}

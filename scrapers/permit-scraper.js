import { chromium } from 'playwright';

/**
 * County Permit Database Scraper
 * Finds people who got solar permits = HOTTEST LEADS
 * These people are actively installing or just installed
 */
export async function scrapePermitLeads(location = 'Fulton County, GA') {
  console.log(`\n🔍 Searching ${location} permit database for solar installations...`);
  console.log('  Note: This finds people who ALREADY got permits - extremely hot leads!');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  try {
    // Georgia counties with online permit search
    const countyUrls = {
      'fulton': 'https://gis.fultoncountyga.gov/apps/PermitSearch/',
      'gwinnett': 'https://apps.gwinnettcounty.com/PermitExpress/',
      'cobb': 'https://cobbcounty.org/planning/building-permits',
      'dekalb': 'https://dekalbcountyga.gov/planning-sustainability/building-permits'
    };

    const county = location.toLowerCase().includes('fulton') ? 'fulton' :
                   location.toLowerCase().includes('gwinnett') ? 'gwinnett' :
                   location.toLowerCase().includes('cobb') ? 'cobb' :
                   location.toLowerCase().includes('dekalb') ? 'dekalb' : null;

    if (!county || !countyUrls[county]) {
      console.log(`  ⚠️  County permit database not configured for: ${location}`);
      console.log(`  Available: Fulton, Gwinnett, Cobb, DeKalb`);
      return leads;
    }

    await page.goto(countyUrls[county], { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try to search for solar permits
    // Note: Each county has different UI, this is a template
    const permits = await page.evaluate(() => {
      const results = [];

      // Look for permit records (this varies by county)
      const permitRows = document.querySelectorAll('tr[class*="permit"], div[class*="permit-record"]');

      permitRows.forEach((row, index) => {
        if (index > 50) return; // Limit to first 50 permits

        try {
          const text = row.textContent || '';

          // Check if it's a solar permit
          const isSolar = /solar|photovoltaic|pv|panel/i.test(text);

          if (isSolar) {
            // Extract what we can (format varies by county)
            const addressMatch = text.match(/(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|way|ct|court))/i);
            const permitMatch = text.match(/permit\s*#?\s*:?\s*(\d+[\w\d-]*)/i);
            const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);

            results.push({
              address: addressMatch ? addressMatch[1] : '',
              permitNumber: permitMatch ? permitMatch[1] : '',
              date: dateMatch ? dateMatch[1] : '',
              rawText: text.slice(0, 300)
            });
          }
        } catch (e) {
          // Skip
        }
      });

      return results;
    });

    // Score and add to leads
    permits.forEach(permit => {
      let score = 0;

      // These are EXTREMELY hot leads
      score += 50; // Base score for having a permit

      // Recent permits = hotter
      if (permit.date) {
        const permitDate = new Date(permit.date);
        const ageMonths = (new Date() - permitDate) / (1000 * 60 * 60 * 24 * 30);

        if (ageMonths < 1) score += 40; // Brand new - they're installing NOW
        else if (ageMonths < 3) score += 30; // Recent - may need service
        else if (ageMonths < 6) score += 20; // Follow-up opportunity
        else score += 10; // Future upsell
      }

      leads.push({
        source: 'County Permits',
        platform: `${county} County Building Permits`,
        name: 'Property Owner', // Don't have name yet, need to look up
        location: permit.address || location,
        message: `Solar permit issued. Permit #${permit.permitNumber}. This property owner is actively installing solar.`,
        profileUrl: '',
        postUrl: countyUrls[county],
        timestamp: permit.date || new Date().toISOString(),
        score,
        priority: 'Hot', // All permit leads are hot
        intent: 'Extreme', // They're literally installing
        permitNumber: permit.permitNumber,
        address: permit.address
      });
    });

    console.log(`    Found ${permits.length} solar permits`);
    console.log(`    💰 These are ACTIVE installations - contact them for:`)
    console.log(`       - Maintenance contracts`);
    console.log(`       - Extended warranties`);
    console.log(`       - Monitoring services`);
    console.log(`       - Battery add-ons`);

  } catch (error) {
    console.error(`  Error scraping permits:`, error.message);
  }

  await browser.close();

  console.log(`✅ Permit scraping complete: ${leads.length} leads found`);
  return leads;
}

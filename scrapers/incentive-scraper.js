import { chromium } from 'playwright';

/**
 * Solar Incentive/Rebate Applicant Scraper
 * Finds people who applied for solar rebates/incentives = HOTTEST LEADS
 * These people are actively getting solar or planning to
 */
export async function scrapeIncentiveLeads(location = 'Georgia') {
  console.log(`\n🔍 Searching for solar incentive applicants in ${location}...`);
  console.log('  Note: These are people actively applying for rebates - they ARE getting solar!');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const leads = [];

  try {
    // Georgia solar incentive databases
    const sources = [
      {
        name: 'Georgia Power Solar Buyback',
        url: 'https://www.georgiapower.com/residential/save-money-and-energy/products-programs/residential-solar-solutions.html',
        type: 'utility'
      },
      {
        name: 'DSIRE Database',
        url: 'https://programs.dsireusa.org/system/program?state=GA',
        type: 'federal'
      }
    ];

    for (const source of sources) {
      try {
        console.log(`  Checking: ${source.name}`);

        await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Some incentive programs publish approved applications
        const applicants = await page.evaluate(() => {
          const results = [];

          // Look for published lists of approved applicants
          // Format varies by program
          const tables = document.querySelectorAll('table, div[class*="applicant"], div[class*="approved"]');

          tables.forEach(table => {
            const rows = table.querySelectorAll('tr, div[class*="row"]');

            rows.forEach((row, index) => {
              if (index > 100) return; // Limit

              try {
                const text = row.textContent || '';

                // Look for location/address indicators
                const hasLocation = /GA|Georgia|\d{5}|atlanta|savannah|augusta/i.test(text);
                const hasSolar = /solar|photovoltaic|pv|panel|kW|kilowatt/i.test(text);

                if (hasLocation && hasSolar) {
                  const addressMatch = text.match(/(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road))/i);
                  const cityMatch = text.match(/(atlanta|savannah|augusta|macon|columbus|athens)/i);
                  const sizeMatch = text.match(/(\d+\.?\d*)\s*kW/i);

                  results.push({
                    address: addressMatch ? addressMatch[1] : '',
                    city: cityMatch ? cityMatch[1] : '',
                    systemSize: sizeMatch ? sizeMatch[1] + 'kW' : '',
                    rawText: text.slice(0, 200)
                  });
                }
              } catch (e) {
                // Skip
              }
            });
          });

          return results;
        });

        // Score and add to leads
        applicants.forEach(applicant => {
          let score = 90; // EXTREMELY hot - they're getting incentives = they're installing

          leads.push({
            source: 'Incentive Programs',
            platform: source.name,
            name: 'Property Owner', // Lookup needed
            location: applicant.city || location,
            message: `Applied for solar rebate/incentive. System size: ${applicant.systemSize}. This homeowner is ACTIVELY installing solar.`,
            profileUrl: '',
            postUrl: source.url,
            timestamp: new Date().toISOString(),
            score,
            priority: 'Hot',
            intent: 'Extreme', // They're literally getting solar
            address: applicant.address,
            systemSize: applicant.systemSize
          });
        });

        console.log(`    Found ${applicants.length} incentive applicants`);

      } catch (error) {
        console.error(`  Error checking ${source.name}:`, error.message);
      }
    }

    console.log(`\n    💰 Contact these leads for:`);
    console.log(`       - Extended warranties`);
    console.log(`       - Monitoring & maintenance`);
    console.log(`       - Battery storage add-ons`);
    console.log(`       - Referral programs`);

  } catch (error) {
    console.error(`  Error scraping incentives:`, error.message);
  }

  await browser.close();

  console.log(`✅ Incentive scraping complete: ${leads.length} leads found`);
  return leads;
}

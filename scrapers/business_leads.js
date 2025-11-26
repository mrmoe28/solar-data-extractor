#!/usr/bin/env node
/**
 * Solar Business Lead Generator
 * Extracts: Company name, Address, Phone, Email, Website
 * Sources: Google Maps, Yellow Pages, LinkedIn
 * Output: CRM-ready CSV spreadsheet
 */

const fs = require('fs');
const path = require('path');

class SolarBusinessLeadGenerator {
  constructor() {
    this.leads = [];
    this.outputDir = path.join(__dirname, '..', 'output');
    this.timestamp = new Date().toISOString().split('T')[0];
  }

  /**
   * Generate Google Maps search URL for solar businesses
   */
  getGoogleMapsSearchURL(searchTerm, location) {
    const query = encodeURIComponent(`${searchTerm} ${location}`);
    return `https://www.google.com/maps/search/${query}`;
  }

  /**
   * Generate Yellow Pages search URL
   */
  getYellowPagesSearchURL(searchTerm, location) {
    const term = encodeURIComponent(searchTerm);
    const loc = encodeURIComponent(location);
    return `https://www.yellowpages.com/search?search_terms=${term}&geo_location_terms=${loc}`;
  }

  /**
   * Generate LinkedIn company search URL
   */
  getLinkedInSearchURL(searchTerm, location) {
    const query = encodeURIComponent(`${searchTerm} ${location}`);
    return `https://www.linkedin.com/search/results/companies/?keywords=${query}`;
  }

  /**
   * Extract business data from Google Maps
   * Returns JavaScript code to be executed in browser
   */
  getGoogleMapsExtractorScript() {
    return `
      (function() {
        const results = [];
        const businesses = document.querySelectorAll('[role="article"]');

        businesses.forEach((business, index) => {
          try {
            // Company name
            const nameEl = business.querySelector('[class*="fontHeadlineSmall"]');
            const name = nameEl ? nameEl.textContent.trim() : '';

            // Address
            const addressEl = business.querySelector('[class*="W4Efsd"]:nth-of-type(2)');
            const address = addressEl ? addressEl.textContent.trim() : '';

            // Phone
            const phoneEl = business.querySelector('[data-item-id*="phone"]');
            const phone = phoneEl ? phoneEl.textContent.trim() : '';

            // Website - click to reveal
            const websiteButton = business.querySelector('[data-item-id="authority"]');
            const website = websiteButton ? websiteButton.getAttribute('href') : '';

            // Rating
            const ratingEl = business.querySelector('[role="img"][aria-label*="stars"]');
            const rating = ratingEl ? ratingEl.getAttribute('aria-label') : '';

            // Reviews count
            const reviewsEl = business.querySelector('[role="img"][aria-label*="stars"]')?.parentElement?.nextElementSibling;
            const reviews = reviewsEl ? reviewsEl.textContent.trim() : '';

            if (name) {
              results.push({
                source: 'Google Maps',
                name: name,
                address: address,
                phone: phone,
                website: website,
                email: '', // Will be extracted from website
                rating: rating,
                reviews: reviews,
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting business:', e);
          }
        });

        return results;
      })();
    `;
  }

  /**
   * Extract business data from Yellow Pages
   */
  getYellowPagesExtractorScript() {
    return `
      (function() {
        const results = [];
        const businesses = document.querySelectorAll('.result');

        businesses.forEach((business) => {
          try {
            const name = business.querySelector('.business-name')?.textContent.trim() || '';
            const address = business.querySelector('.adr')?.textContent.trim() || '';
            const phone = business.querySelector('.phones')?.textContent.trim() || '';
            const website = business.querySelector('.track-visit-website')?.href || '';

            if (name) {
              results.push({
                source: 'Yellow Pages',
                name: name,
                address: address,
                phone: phone,
                website: website,
                email: '',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting business:', e);
          }
        });

        return results;
      })();
    `;
  }

  /**
   * Extract email from website content
   */
  getEmailExtractorScript() {
    return `
      (function() {
        const text = document.body.innerText;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex) || [];

        // Filter out common false positives
        const validEmails = emails.filter(email =>
          !email.includes('example.com') &&
          !email.includes('yourdomain.com') &&
          !email.includes('sentry.io') &&
          !email.includes('wixpress.com')
        );

        return [...new Set(validEmails)]; // Remove duplicates
      })();
    `;
  }

  /**
   * Export leads to CSV
   */
  exportToCSV(leads, filename) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const headers = [
      'Source',
      'Company Name',
      'Address',
      'Phone',
      'Email',
      'Website',
      'Rating',
      'Reviews',
      'Extracted At'
    ];

    const csvRows = [
      headers.join(','),
      ...leads.map(lead => [
        this.escapeCsvValue(lead.source),
        this.escapeCsvValue(lead.name),
        this.escapeCsvValue(lead.address),
        this.escapeCsvValue(lead.phone),
        this.escapeCsvValue(lead.email),
        this.escapeCsvValue(lead.website),
        this.escapeCsvValue(lead.rating || ''),
        this.escapeCsvValue(lead.reviews || ''),
        this.escapeCsvValue(lead.extractedAt)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, csvContent, 'utf8');
    console.log(`\n✅ Exported ${leads.length} leads to: ${filepath}`);

    return filepath;
  }

  /**
   * Escape CSV values
   */
  escapeCsvValue(value) {
    if (!value) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Print usage instructions
   */
  printUsage() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Solar Business Lead Generator                          ║
╚════════════════════════════════════════════════════════════════╝

USAGE WITH CLAUDE:
------------------

1. Google Maps Solar Installers:
   "Use Playwright to navigate to Google Maps, search for 'solar installers in Los Angeles',
    scroll through results, and execute the extractor script"

2. Yellow Pages Solar Companies:
   "Navigate to Yellow Pages, search 'solar companies in California',
    extract all business listings"

3. LinkedIn Solar Companies:
   "Search LinkedIn for solar companies in Texas, extract company profiles"

4. Extract Emails from Websites:
   "Visit each business website and extract contact emails"

SEARCH EXAMPLES:
----------------
- "solar panel installers in [city]"
- "solar energy companies near [location]"
- "residential solar installers [state]"
- "commercial solar contractors [region]"
- "solar equipment distributors [country]"

OUTPUT:
-------
📁 Location: ~/solar-data-extractor/output/
📊 Format: solar-leads-YYYY-MM-DD.csv
📋 Fields: Source, Company, Address, Phone, Email, Website, Rating, Reviews

EXAMPLE WORKFLOW:
-----------------
You: "Find solar installers in Miami"
Claude:
  1. Opens Google Maps
  2. Searches "solar installers Miami"
  3. Scrolls through results
  4. Extracts all business data
  5. Visits websites to get emails
  6. Saves to CSV
  7. Shows you the results

SCRIPTS AVAILABLE:
------------------
Google Maps Extractor:  getGoogleMapsExtractorScript()
Yellow Pages Extractor: getYellowPagesExtractorScript()
Email Extractor:        getEmailExtractorScript()

Ready to start! Just tell Claude what you want to extract.
    `);
  }
}

// Export for use
if (require.main === module) {
  const generator = new SolarBusinessLeadGenerator();
  generator.printUsage();
} else {
  module.exports = SolarBusinessLeadGenerator;
}

#!/usr/bin/env node
/**
 * Solar Product Scraper
 * Extracts: Solar Panels, Inverters, Batteries, Mounting Equipment
 * Sources: Amazon, eBay, AltE Store, Wholesale Solar, EnergySage
 * Features: Price tracking, specs extraction, inventory monitoring
 */

const fs = require('fs');
const path = require('path');

class SolarProductScraper {
  constructor() {
    this.products = [];
    this.outputDir = path.join(__dirname, '..', 'output');
    this.timestamp = new Date().toISOString().split('T')[0];

    this.productCategories = {
      panels: 'Solar Panels',
      inverters: 'Inverters',
      batteries: 'Batteries',
      mounting: 'Mounting Equipment',
      chargeControllers: 'Charge Controllers',
      combinerBoxes: 'Combiner Boxes'
    };
  }

  /**
   * Generate search URLs for different platforms
   */
  getSearchURLs(productType, brand = '') {
    const searchTerm = brand ? `${brand} ${productType}` : productType;

    return {
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`,
      ebay: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}`,
      alteStore: `https://www.altestore.com/store/search/?q=${encodeURIComponent(searchTerm)}`,
      wholesaleSolar: `https://www.wholesalesolar.com/search?keywords=${encodeURIComponent(searchTerm)}`,
      energySage: `https://www.energysage.com/solar-panels/search/?q=${encodeURIComponent(searchTerm)}`
    };
  }

  /**
   * Amazon Product Extractor Script
   */
  getAmazonExtractorScript() {
    return `
      (function() {
        const products = [];
        const items = document.querySelectorAll('[data-component-type="s-search-result"]');

        items.forEach((item) => {
          try {
            const titleEl = item.querySelector('h2 a span');
            const priceWhole = item.querySelector('.a-price-whole');
            const priceFraction = item.querySelector('.a-price-fraction');
            const ratingEl = item.querySelector('[aria-label*="out of 5 stars"]');
            const reviewsEl = item.querySelector('[aria-label*="out of 5 stars"]')?.parentElement?.nextElementSibling;
            const imageEl = item.querySelector('img.s-image');
            const linkEl = item.querySelector('h2 a');

            const title = titleEl ? titleEl.textContent.trim() : '';
            const price = priceWhole && priceFraction
              ? parseFloat(priceWhole.textContent + priceFraction.textContent)
              : null;
            const rating = ratingEl ? ratingEl.getAttribute('aria-label') : '';
            const reviews = reviewsEl ? reviewsEl.textContent.trim() : '';
            const image = imageEl ? imageEl.src : '';
            const url = linkEl ? 'https://www.amazon.com' + linkEl.getAttribute('href') : '';

            // Extract wattage/capacity from title
            const wattageMatch = title.match(/(\\d+)\\s*W(?:att)?/i);
            const capacityMatch = title.match(/(\\d+)\\s*kWh?/i);
            const voltageMatch = title.match(/(\\d+)\\s*V(?:olt)?/i);

            if (title && price) {
              products.push({
                source: 'Amazon',
                title: title,
                price: price,
                currency: 'USD',
                rating: rating,
                reviews: reviews,
                image: image,
                url: url,
                wattage: wattageMatch ? wattageMatch[1] : '',
                capacity: capacityMatch ? capacityMatch[1] : '',
                voltage: voltageMatch ? voltageMatch[1] : '',
                inStock: !item.textContent.includes('Currently unavailable'),
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting product:', e);
          }
        });

        return products;
      })();
    `;
  }

  /**
   * eBay Product Extractor Script
   */
  getEbayExtractorScript() {
    return `
      (function() {
        const products = [];
        const items = document.querySelectorAll('.s-item');

        items.forEach((item, index) => {
          if (index === 0) return; // Skip first item (usually an ad)

          try {
            const titleEl = item.querySelector('.s-item__title');
            const priceEl = item.querySelector('.s-item__price');
            const imageEl = item.querySelector('.s-item__image-img');
            const linkEl = item.querySelector('.s-item__link');
            const conditionEl = item.querySelector('.SECONDARY_INFO');
            const shippingEl = item.querySelector('.s-item__shipping');

            const title = titleEl ? titleEl.textContent.trim() : '';
            const priceText = priceEl ? priceEl.textContent.trim() : '';
            const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
            const image = imageEl ? imageEl.src : '';
            const url = linkEl ? linkEl.href : '';
            const condition = conditionEl ? conditionEl.textContent.trim() : '';
            const shipping = shippingEl ? shippingEl.textContent.trim() : '';

            // Extract specs
            const wattageMatch = title.match(/(\\d+)\\s*W(?:att)?/i);
            const voltageMatch = title.match(/(\\d+)\\s*V(?:olt)?/i);

            if (title && price) {
              products.push({
                source: 'eBay',
                title: title,
                price: price,
                currency: 'USD',
                condition: condition,
                shipping: shipping,
                image: image,
                url: url,
                wattage: wattageMatch ? wattageMatch[1] : '',
                voltage: voltageMatch ? voltageMatch[1] : '',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting product:', e);
          }
        });

        return products;
      })();
    `;
  }

  /**
   * AltE Store Product Extractor Script
   */
  getAlteStoreExtractorScript() {
    return `
      (function() {
        const products = [];
        const items = document.querySelectorAll('.product-item, .product');

        items.forEach((item) => {
          try {
            const titleEl = item.querySelector('.product-name, .product-title, h3 a, h4 a');
            const priceEl = item.querySelector('.price, .product-price');
            const imageEl = item.querySelector('img');
            const linkEl = item.querySelector('a');
            const skuEl = item.querySelector('.sku, [data-sku]');

            const title = titleEl ? titleEl.textContent.trim() : '';
            const priceText = priceEl ? priceEl.textContent.trim() : '';
            const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
            const image = imageEl ? imageEl.src : '';
            const url = linkEl ? linkEl.href : '';
            const sku = skuEl ? (skuEl.textContent || skuEl.getAttribute('data-sku')) : '';

            // Extract detailed specs from title
            const wattageMatch = title.match(/(\\d+)\\s*W(?:att)?/i);
            const voltageMatch = title.match(/(\\d+)\\s*V(?:olt)?/i);
            const brandMatch = title.match(/^([A-Z][a-z]+|[A-Z]+)/);

            if (title && price) {
              products.push({
                source: 'AltE Store',
                title: title,
                price: price,
                currency: 'USD',
                sku: sku,
                image: image,
                url: url,
                wattage: wattageMatch ? wattageMatch[1] : '',
                voltage: voltageMatch ? voltageMatch[1] : '',
                brand: brandMatch ? brandMatch[1] : '',
                extractedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error extracting product:', e);
          }
        });

        return products;
      })();
    `;
  }

  /**
   * Generic Product Detail Extractor
   * Extracts detailed specs from product pages
   */
  getProductDetailExtractorScript() {
    return `
      (function() {
        const details = {
          title: document.querySelector('h1')?.textContent.trim() || '',
          description: document.querySelector('[name="description"]')?.content || '',
          specs: {}
        };

        // Extract from specification tables
        const specTables = document.querySelectorAll('table');
        specTables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length === 2) {
              const key = cells[0].textContent.trim().toLowerCase();
              const value = cells[1].textContent.trim();
              details.specs[key] = value;
            }
          });
        });

        // Extract from lists
        const specLists = document.querySelectorAll('.specifications li, .specs li, .features li');
        specLists.forEach(item => {
          const text = item.textContent.trim();
          const match = text.match(/([^:]+):\\s*(.+)/);
          if (match) {
            details.specs[match[1].toLowerCase()] = match[2];
          }
        });

        // Common solar product specs
        const extractSpec = (pattern) => {
          const text = document.body.textContent;
          const match = text.match(pattern);
          return match ? match[1] : null;
        };

        details.specs.wattage = extractSpec(/(\\d+)\\s*W(?:att)?/) || details.specs.wattage;
        details.specs.voltage = extractSpec(/(\\d+)\\s*V(?:olt)?/) || details.specs.voltage;
        details.specs.efficiency = extractSpec(/(\\d+\\.?\\d*)%\\s*efficiency/i) || details.specs.efficiency;
        details.specs.warranty = extractSpec(/(\\d+)\\s*year.*warranty/i) || details.specs.warranty;

        return details;
      })();
    `;
  }

  /**
   * Price Comparison Script
   */
  generatePriceComparison(products) {
    const grouped = {};

    products.forEach(product => {
      // Group by similar titles (simple matching)
      const normalizedTitle = product.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .slice(0, 50);

      if (!grouped[normalizedTitle]) {
        grouped[normalizedTitle] = [];
      }
      grouped[normalizedTitle].push(product);
    });

    const comparison = [];
    Object.keys(grouped).forEach(key => {
      const items = grouped[key];
      if (items.length > 1) {
        items.sort((a, b) => a.price - b.price);
        comparison.push({
          product: items[0].title,
          lowestPrice: items[0].price,
          lowestSource: items[0].source,
          highestPrice: items[items.length - 1].price,
          highestSource: items[items.length - 1].source,
          priceDiff: items[items.length - 1].price - items[0].price,
          savings: ((items[items.length - 1].price - items[0].price) / items[items.length - 1].price * 100).toFixed(2) + '%',
          sources: items.length
        });
      }
    });

    return comparison.sort((a, b) => b.priceDiff - a.priceDiff);
  }

  /**
   * Export to CSV
   */
  exportToCSV(products, filename) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const headers = [
      'Source',
      'Title',
      'Price',
      'Currency',
      'Wattage',
      'Voltage',
      'Capacity',
      'Brand',
      'Rating',
      'Reviews',
      'Condition',
      'SKU',
      'In Stock',
      'Image URL',
      'Product URL',
      'Extracted At'
    ];

    const csvRows = [
      headers.join(','),
      ...products.map(p => [
        this.escapeCsv(p.source),
        this.escapeCsv(p.title),
        p.price || '',
        p.currency || 'USD',
        p.wattage || '',
        p.voltage || '',
        p.capacity || '',
        this.escapeCsv(p.brand || ''),
        this.escapeCsv(p.rating || ''),
        this.escapeCsv(p.reviews || ''),
        this.escapeCsv(p.condition || ''),
        this.escapeCsv(p.sku || ''),
        p.inStock !== undefined ? p.inStock : 'Unknown',
        this.escapeCsv(p.image || ''),
        this.escapeCsv(p.url || ''),
        p.extractedAt || new Date().toISOString()
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, csvContent, 'utf8');
    console.log(`\n✅ Exported ${products.length} products to: ${filepath}`);

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
║            Solar Product Scraper                               ║
╚════════════════════════════════════════════════════════════════╝

EXTRACT PRODUCTS FROM:
----------------------
✅ Amazon - Solar panels, inverters, batteries
✅ eBay - New and used solar equipment
✅ AltE Store - Professional solar equipment
✅ Wholesale Solar - Bulk pricing
✅ EnergySage - Solar panel marketplace

PRODUCT CATEGORIES:
------------------
🔆 Solar Panels (monocrystalline, polycrystalline, thin-film)
🔌 Inverters (string, micro, hybrid, off-grid)
🔋 Batteries (lithium, lead-acid, AGM, gel)
🔧 Mounting Equipment (roof, ground, pole mounts)
⚡ Charge Controllers (MPPT, PWM)
📦 Combiner Boxes & Accessories

DATA EXTRACTED:
---------------
• Product Name & Brand
• Price (with currency)
• Specifications (wattage, voltage, capacity)
• Ratings & Reviews
• Stock Status
• Product Images
• Direct Product URLs
• SKU/Model Number

EXAMPLE COMMANDS:
-----------------

Search Single Platform:
  "Extract all solar panels from Amazon"
  "Find inverters on eBay under $500"
  "Get batteries from AltE Store"

Compare Prices:
  "Find the cheapest 400W solar panels across all sites"
  "Compare prices for Tesla Powerwall batteries"

Brand-Specific:
  "Extract all Renogy products from Amazon"
  "Find SolarEdge inverters across all platforms"

Filtered Search:
  "Get 300-400W solar panels under $200"
  "Find MPPT charge controllers with 4+ star ratings"

USAGE WITH CLAUDE:
------------------
Just tell me what you want:

  "Extract solar panels from Amazon"
  → I'll navigate, scroll, extract all products

  "Compare prices for 400W panels"
  → I'll check multiple sites and show price comparison

  "Find the best-rated inverters under $1000"
  → I'll extract, filter, and rank by ratings

OUTPUT:
-------
📁 ~/solar-data-extractor/output/
📊 solar-products-YYYY-MM-DD.csv
📈 price-comparison-YYYY-MM-DD.csv

CSV includes:
- Product details
- Specifications
- Pricing
- Direct purchase links
- Images

PRICE TRACKING:
--------------
Run extractions daily to track price changes:
  "Extract and track prices for these products"
  → Saves historical data for trend analysis

Ready to extract solar products!
    `);
  }
}

if (require.main === module) {
  const scraper = new SolarProductScraper();
  scraper.printUsage();
} else {
  module.exports = SolarProductScraper;
}

AUTO-SUBMISSION SCRIPT FOR EKOSOLAR PROS
=========================================
Qualified Leads: 3

// ============================================================
// LEAD 1 of 3
// ============================================================
/**
 * AUTO-GENERATED: Submit lead to EkoSolarPros.com
 * Lead Source: Nextdoor - East Cobb
 * Lead Priority: Hot
 * Generated: 2025-11-26T01:59:01.820Z
 */

// Navigate to website
await page.goto('https://www.ekosolarpros.com');
await page.waitForLoadState('networkidle');

// Wait for form to be visible
await page.waitForSelector('form', { timeout: 5000 });

// Fill form fields
await page.fill('input[name="name"]', 'Lisa Davis');
await page.fill('input[name="email"]', 'lisa.davis@email.com');
await page.fill('input[name="phone"]', '(770) 555-0456');
await page.fill('input[name="address"]', 'Roswell GA');
await page.fill('textarea[name="message"]', `[AUTO-SUBMITTED LEAD from Nextdoor - East Cobb]\\nPriority: Hot (Score: 85)\\n\\nCUSTOMER REQUEST:\\nSolar panels stopped working this morning! Inverter showing error code. Need technician ASAP. Please help!!\\n\\nLocation: Roswell GA\\nPosted: 1 hour ago\\n\\nCONTACT INFO:\\nProfile: https://nextdoor.com/profile/lisa-davis\\nOriginal Post: https://nextdoor.com/p/abc123\\n\\nIntent Level: Urgent\\n\\n⚡ This lead was automatically extracted and submitted\\n📅 Follow up ASAP for best conversion rates`);

// Optional: Take screenshot before submission
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-preview-1764122341821.png' });

// Submit form
const submitButton = await page.locator('button[type="submit"], input[type="submit"]');
await submitButton.click();

// Wait for confirmation
await page.waitForLoadState('networkidle');

// Take screenshot of confirmation
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-submitted-1764122341821.png' });

console.log('✅ Lead submitted successfully!');

// Wait before next submission (avoid spam detection)
await page.waitForTimeout(2679.891665382499);

// ============================================================
// LEAD 2 of 3
// ============================================================
/**
 * AUTO-GENERATED: Submit lead to EkoSolarPros.com
 * Lead Source: HomeAdvisor Quote
 * Lead Priority: Hot
 * Generated: 2025-11-26T01:59:01.821Z
 */

// Navigate to website
await page.goto('https://www.ekosolarpros.com');
await page.waitForLoadState('networkidle');

// Wait for form to be visible
await page.waitForSelector('form', { timeout: 5000 });

// Fill form fields
await page.fill('input[name="name"]', 'Patricia Martinez');
await page.fill('input[name="email"]', 'p.martinez@email.com');
await page.fill('input[name="phone"]', '(678) 555-0789');
await page.fill('input[name="address"]', 'Alpharetta GA');
await page.fill('textarea[name="message"]', `[AUTO-SUBMITTED LEAD from HomeAdvisor Quote]\\nPriority: Hot (Score: 80)\\n\\nCUSTOMER REQUEST:\\nRequesting quotes for residential solar installation. 3-bedroom home, looking for competitive pricing and quality work.\\n\\nLocation: Alpharetta GA\\nPosted: 3 hours ago\\n\\nCONTACT INFO:\\nProfile: https://homeadvisor.com/pro/request/789\\nOriginal Post: https://homeadvisor.com/quotes/solar/789\\n\\nIntent Level: High\\n\\n⚡ This lead was automatically extracted and submitted\\n📅 Follow up ASAP for best conversion rates`);

// Optional: Take screenshot before submission
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-preview-1764122341821.png' });

// Submit form
const submitButton = await page.locator('button[type="submit"], input[type="submit"]');
await submitButton.click();

// Wait for confirmation
await page.waitForLoadState('networkidle');

// Take screenshot of confirmation
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-submitted-1764122341821.png' });

console.log('✅ Lead submitted successfully!');

// Wait before next submission (avoid spam detection)
await page.waitForTimeout(3604.1858516051634);

// ============================================================
// LEAD 3 of 3
// ============================================================
/**
 * AUTO-GENERATED: Submit lead to EkoSolarPros.com
 * Lead Source: Reddit r/Atlanta
 * Lead Priority: Hot
 * Generated: 2025-11-26T01:59:01.821Z
 */

// Navigate to website
await page.goto('https://www.ekosolarpros.com');
await page.waitForLoadState('networkidle');

// Wait for form to be visible
await page.waitForSelector('form', { timeout: 5000 });

// Fill form fields
await page.fill('input[name="name"]', 'Sarah Johnson');
await page.fill('input[name="email"]', 'sarah.j.reddit@pending-contact.com');
// No phone provided
await page.fill('input[name="address"]', 'Atlanta GA');
await page.fill('textarea[name="message"]', `[AUTO-SUBMITTED LEAD from Reddit r/Atlanta]\\nPriority: Hot (Score: 75)\\n\\nCUSTOMER REQUEST:\\nLooking for solar panel installation recommendations. Electric bill is \$250/month and want to go solar ASAP. Any good installers in Atlanta?\\n\\nLocation: Atlanta GA\\nPosted: 2 hours ago\\n\\nCONTACT INFO:\\nProfile: https://reddit.com/user/sarahjohnson\\nOriginal Post: https://reddit.com/r/Atlanta/comments/abc123\\n\\nIntent Level: High\\n\\n⚡ This lead was automatically extracted and submitted\\n📅 Follow up ASAP for best conversion rates`);

// Optional: Take screenshot before submission
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-preview-1764122341821.png' });

// Submit form
const submitButton = await page.locator('button[type="submit"], input[type="submit"]');
await submitButton.click();

// Wait for confirmation
await page.waitForLoadState('networkidle');

// Take screenshot of confirmation
await page.screenshot({ path: '/Users/ekodevapps/solar-data-extractor/output/form-submitted-1764122341821.png' });

console.log('✅ Lead submitted successfully!');

// Wait before next submission (avoid spam detection)
await page.waitForTimeout(4532.589465815869);

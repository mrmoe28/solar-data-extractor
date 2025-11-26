import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude-Powered Lead Enrichment
 * Uses Claude to find contact information from limited data
 *
 * Cost: ~$0.003/lead (vs Apollo $0.05/lead = 15x cheaper!)
 */

export class ClaudeEnricher {
  constructor(apiKey) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * Enrich a lead with contact information
   * Input: { name, location, source, message }
   * Output: { name, location, phone, email, linkedin, confidence }
   */
  async enrichLead(lead) {
    console.log(`  🤖 Enriching: ${lead.name} in ${lead.location}`);

    try {
      const prompt = this.buildEnrichmentPrompt(lead);

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.3, // Lower temp for factual accuracy
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const enrichedData = this.parseEnrichmentResponse(response.content[0].text);

      console.log(`    ✅ Found: ${enrichedData.phone ? 'Phone' : ''} ${enrichedData.email ? 'Email' : ''} ${enrichedData.linkedin ? 'LinkedIn' : ''}`);

      return {
        ...lead,
        ...enrichedData,
        enrichedAt: new Date().toISOString(),
        enrichmentCost: 0.003 // Track cost
      };

    } catch (error) {
      console.error(`    ❌ Enrichment failed: ${error.message}`);
      return {
        ...lead,
        enrichmentError: error.message
      };
    }
  }

  buildEnrichmentPrompt(lead) {
    return `You are a professional researcher finding contact information for a lead.

LEAD INFORMATION:
- Name: ${lead.name}
- Location: ${lead.location}
- Source: ${lead.source}
- Context: ${lead.message?.slice(0, 200)}
${lead.address ? `- Address: ${lead.address}` : ''}

TASK:
Find the most likely contact information for this person based on:
1. Their location (search "${lead.name} ${lead.location}")
2. Context clues in their message
3. Public records and business listings
4. Social media profiles

SEARCH STRATEGY:
- If they posted about solar issues, they likely own property
- Check for business listings if they seem to be a contractor
- Look for phone numbers in format: (XXX) XXX-XXXX or XXX-XXX-XXXX
- Look for email patterns: name@domain.com
- LinkedIn: linkedin.com/in/[username]

CONFIDENCE LEVELS:
- HIGH: Found in multiple sources or official business listing
- MEDIUM: Found in one reliable source
- LOW: Inferred from partial information
- NONE: Could not find

Return ONLY valid JSON (no markdown, no explanations):
{
  "phone": "404-555-1234 or null",
  "email": "john@example.com or null",
  "linkedin": "https://linkedin.com/in/username or null",
  "businessName": "ABC Solar Repair or null",
  "confidence": "HIGH/MEDIUM/LOW/NONE",
  "notes": "Brief note about where you found this info"
}

IMPORTANT:
- Only include phone/email if you have reasonable confidence
- Use null for missing data (not "unknown" or empty string)
- Phone must be in XXX-XXX-XXXX format
- Email must be valid format
- Return ONLY the JSON object, nothing else`;
  }

  parseEnrichmentResponse(responseText) {
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      // Validate and clean the data
      return {
        phone: this.validatePhone(parsed.phone),
        email: this.validateEmail(parsed.email),
        linkedin: this.validateLinkedIn(parsed.linkedin),
        businessName: parsed.businessName || null,
        enrichmentConfidence: parsed.confidence || 'NONE',
        enrichmentNotes: parsed.notes || ''
      };
    } catch (error) {
      console.error('    ⚠️  Failed to parse enrichment response:', error.message);
      return {
        phone: null,
        email: null,
        linkedin: null,
        enrichmentConfidence: 'NONE',
        enrichmentNotes: 'Failed to parse response'
      };
    }
  }

  validatePhone(phone) {
    if (!phone || phone === 'null') return null;

    // Clean and validate phone number
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `${cleaned.slice(1,4)}-${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
    }
    return null; // Invalid
  }

  validateEmail(email) {
    if (!email || email === 'null') return null;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : null;
  }

  validateLinkedIn(url) {
    if (!url || url === 'null') return null;

    // Validate LinkedIn URL format
    if (url.includes('linkedin.com/in/')) {
      return url;
    }
    return null;
  }

  /**
   * Batch enrich multiple leads
   * Processes in parallel with rate limiting
   */
  async enrichLeads(leads, options = {}) {
    const {
      batchSize = 5,        // Process 5 at a time
      delayMs = 1000,       // 1 second between batches
      skipIfHasContact = true
    } = options;

    console.log(`\n🤖 Claude Enrichment Starting...`);
    console.log(`   Leads to enrich: ${leads.length}`);
    console.log(`   Batch size: ${batchSize}`);
    console.log(`   Skip if has contact: ${skipIfHasContact}`);
    console.log('');

    // Filter leads that need enrichment
    const leadsToEnrich = skipIfHasContact
      ? leads.filter(lead => !lead.phone && !lead.email)
      : leads;

    console.log(`   Actually enriching: ${leadsToEnrich.length}`);
    console.log('');

    const enrichedLeads = [];
    let successCount = 0;
    let failCount = 0;

    // Process in batches
    for (let i = 0; i < leadsToEnrich.length; i += batchSize) {
      const batch = leadsToEnrich.slice(i, i + batchSize);

      console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(leadsToEnrich.length / batchSize)}`);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(lead => this.enrichLead(lead))
      );

      // Track success/failure
      batchResults.forEach(result => {
        if (result.phone || result.email) {
          successCount++;
        } else {
          failCount++;
        }
      });

      enrichedLeads.push(...batchResults);

      // Rate limiting delay between batches
      if (i + batchSize < leadsToEnrich.length) {
        console.log(`  ⏱️  Waiting ${delayMs}ms before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Merge enriched data back into original leads
    const finalLeads = leads.map(lead => {
      const enriched = enrichedLeads.find(e =>
        e.name === lead.name && e.location === lead.location
      );
      return enriched || lead;
    });

    // Summary
    console.log(`\n✅ Enrichment Complete!`);
    console.log(`   Success: ${successCount} (${Math.round(successCount/leadsToEnrich.length*100)}%)`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total cost: $${(leadsToEnrich.length * 0.003).toFixed(2)}`);
    console.log('');

    return finalLeads;
  }

  /**
   * Advanced: Use web search to find contact info
   * (Requires web search tool integration)
   */
  async enrichWithWebSearch(lead) {
    // TODO: Integrate with Tavily or similar web search API
    // For now, Claude uses its training data
    return this.enrichLead(lead);
  }
}

// Export singleton for easy use
export const enricher = new ClaudeEnricher();

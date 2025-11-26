/**
 * Local LLM Enricher
 * Uses Ollama (or any local LLM) instead of Claude API
 *
 * BENEFITS:
 * - Zero ongoing costs (no API fees)
 * - Complete privacy (data never leaves your machine)
 * - Unlimited enrichments
 * - No rate limits
 *
 * REQUIREMENTS:
 * - Ollama installed (brew install ollama)
 * - Model downloaded (ollama pull llama3.2)
 */

export class LocalLLMEnricher {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:11434';
    this.model = options.model || 'llama3.2'; // or mistral, codellama, etc.
    this.temperature = options.temperature || 0.3;
  }

  /**
   * Enrich a lead with contact information using local LLM
   */
  async enrichLead(lead) {
    console.log(`  🤖 Enriching: ${lead.name} in ${lead.location}`);

    try {
      const prompt = this.buildEnrichmentPrompt(lead);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.temperature,
            num_predict: 500, // Max tokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const enrichedData = this.parseEnrichmentResponse(data.response);

      console.log(`    ✅ Found: ${enrichedData.phone ? 'Phone' : ''} ${enrichedData.email ? 'Email' : ''} ${enrichedData.linkedin ? 'LinkedIn' : ''}`);

      return {
        ...lead,
        ...enrichedData,
        enrichedAt: new Date().toISOString(),
        enrichmentCost: 0, // FREE! 🎉
        enrichmentMethod: 'local-llm'
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
    return `You are a professional researcher finding contact information for a solar lead.

LEAD INFORMATION:
- Name: ${lead.name}
- Location: ${lead.location}
- Source: ${lead.source}
- Context: ${lead.message?.slice(0, 200)}
${lead.address ? `- Address: ${lead.address}` : ''}

TASK:
Based on this information, provide the most likely contact details:

1. Phone number (format: XXX-XXX-XXXX)
2. Email address (valid format)
3. LinkedIn profile URL
4. Business name (if applicable)

REASONING GUIDELINES:
- If they posted about solar issues, they likely own property or a solar business
- Check for common business listing patterns
- Look for phone numbers in format: (XXX) XXX-XXXX or XXX-XXX-XXXX
- Look for email patterns: name@domain.com
- LinkedIn: linkedin.com/in/[username]

CONFIDENCE LEVELS:
- HIGH: Multiple indicators suggest this is correct
- MEDIUM: One reliable indicator
- LOW: Inferred from limited information
- NONE: Cannot determine

Return ONLY valid JSON (no explanation, no markdown):
{
  "phone": "404-555-1234 or null",
  "email": "john@example.com or null",
  "linkedin": "https://linkedin.com/in/username or null",
  "businessName": "ABC Solar Repair or null",
  "confidence": "HIGH/MEDIUM/LOW/NONE",
  "notes": "Brief note about reasoning"
}

JSON:`;
  }

  parseEnrichmentResponse(responseText) {
    try {
      // Clean response - remove markdown, extra text
      let cleaned = responseText.trim();

      // Extract JSON if wrapped in markdown
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      const parsed = JSON.parse(cleaned);

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
      console.error('    Response was:', responseText.slice(0, 200));
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
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `${cleaned.slice(1,4)}-${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
    }
    return null;
  }

  validateEmail(email) {
    if (!email || email === 'null') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : null;
  }

  validateLinkedIn(url) {
    if (!url || url === 'null') return null;
    if (url.includes('linkedin.com/in/')) {
      return url;
    }
    return null;
  }

  /**
   * Batch enrich multiple leads
   */
  async enrichLeads(leads, options = {}) {
    const {
      batchSize = 3,        // Local LLM = slower, smaller batches
      delayMs = 500,        // Less delay needed (no rate limits)
      skipIfHasContact = true
    } = options;

    console.log(`\n🤖 Local LLM Enrichment Starting...`);
    console.log(`   Model: ${this.model}`);
    console.log(`   Leads to enrich: ${leads.length}`);
    console.log(`   Batch size: ${batchSize}`);
    console.log('');

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

      batchResults.forEach(result => {
        if (result.phone || result.email) {
          successCount++;
        } else {
          failCount++;
        }
      });

      enrichedLeads.push(...batchResults);

      if (i + batchSize < leadsToEnrich.length) {
        console.log(`  ⏱️  Waiting ${delayMs}ms before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Merge enriched data back
    const finalLeads = leads.map(lead => {
      const enriched = enrichedLeads.find(e =>
        e.name === lead.name && e.location === lead.location
      );
      return enriched || lead;
    });

    console.log(`\n✅ Enrichment Complete!`);
    console.log(`   Success: ${successCount} (${Math.round(successCount/leadsToEnrich.length*100)}%)`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total cost: $0.00 (FREE!) 🎉`);
    console.log('');

    return finalLeads;
  }

  /**
   * Check if Ollama is running and model is available
   */
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        return {
          running: false,
          error: 'Ollama not running'
        };
      }

      const data = await response.json();
      const hasModel = data.models?.some(m => m.name.includes(this.model));

      return {
        running: true,
        modelAvailable: hasModel,
        availableModels: data.models?.map(m => m.name) || []
      };
    } catch (error) {
      return {
        running: false,
        error: error.message
      };
    }
  }
}

// Export singleton
export const localEnricher = new LocalLLMEnricher();

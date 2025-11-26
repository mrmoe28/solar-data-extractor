/**
 * Google Gemini AI Lead Analyzer (FREE Alternative to OpenAI)
 * Same capabilities as OpenAI but with Google's Gemini API
 * FREE tier: 60 requests/minute, 1500/day
 */

/**
 * Analyze raw web content and extract solar leads using Gemini
 */
export async function extractLeadsFromContent(content, source, location) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('     Gemini API not configured. Skipping AI analysis...');
    return [];
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert lead generation analyst for solar installation companies. Extract ONLY genuine leads from the content below.

A valid lead must:
- Be a person/homeowner asking for solar installation or repair
- NOT be a business advertising services
- Have clear intent to get solar services
- Be from ${location} or nearby

Return ONLY a JSON array. Each lead must include:
{
  "name": "person's name or username",
  "message": "their request/question",
  "intent": "Installation" or "Repair/Service",
  "urgency": "high" or "medium" or "low",
  "phone": "extracted phone if found" or "",
  "email": "extracted email if found" or "",
  "why_hot": "brief explanation of why this is a good lead"
}

If no valid leads found, return: []

CONTENT TO ANALYZE:
${content}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const leads = JSON.parse(jsonMatch[0]);
      return leads.map(lead => ({
        ...lead,
        source,
        location: location
      }));
    }

    return [];
  } catch (error) {
    console.error('  Gemini analysis error:', error.message);
    return [];
  }
}

/**
 * Generate intelligent search queries using Gemini
 */
export async function generateSearchQueries(location, previousResults = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return basic queries if no API key
    return [
      `solar installation ${location}`,
      `solar repair ${location}`,
      `solar panel broken ${location}`
    ];
  }

  try {
    const sourcesFound = previousResults.map(r => r.source).join(', ');
    const resultsContext = previousResults.length > 0
      ? `Previous searches found leads on: ${sourcesFound}.`
      : 'First search attempt.';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a search query optimization expert. Generate 5 highly targeted search queries to find solar installation/repair leads. Return ONLY a JSON array of strings.

Generate search queries to find people in ${location} who need solar installation or repair. ${resultsContext} Focus on finding people asking questions or requesting help, not businesses advertising.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('  Query generation error:', error.message);
    return [];
  }
}

/**
 * Score and prioritize a lead using Gemini
 */
export async function scoreLeadWithAI(lead) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Use simple scoring
    return calculateBasicScore(lead);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a lead scoring expert. Score this solar lead from 0-100 based on likelihood to convert. Return ONLY a JSON object: {"score": number, "priority": "Hot"|"Warm"|"Cold", "reasoning": "brief explanation"}

Lead to score: ${JSON.stringify(lead)}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      return calculateBasicScore(lead);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score,
        priority: result.priority,
        whyHot: result.reasoning
      };
    }

    return calculateBasicScore(lead);
  } catch (error) {
    return calculateBasicScore(lead);
  }
}

function calculateBasicScore(lead) {
  let score = 0;
  const message = (lead.message || '').toLowerCase();

  if (/repair|broken|not working|error|fault/.test(message)) score += 40;
  if (/urgent|asap|immediately|soon/.test(message)) score += 20;
  if (/quote|estimate|price|cost/.test(message)) score += 15;
  if (lead.phone) score += 20;
  if (lead.email) score += 15;

  const priority = score >= 60 ? 'Hot' : score >= 35 ? 'Warm' : 'Cold';

  return { score, priority, whyHot: '' };
}

/**
 * Enrich lead with additional data using Gemini
 */
export async function enrichLead(lead) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return lead; // Return unchanged if no API key
  }

  // If lead has username but no contact info, try to find more details
  if (lead.name && !lead.phone && !lead.email) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a data enrichment assistant. Based on public information, suggest ways to contact this lead. Return JSON: {"contactSuggestions": ["suggestion 1", "suggestion 2"]}

Lead: ${lead.name} from ${lead.location}. Source: ${lead.source}. How can we reach them?`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const enrichment = JSON.parse(jsonMatch[0]);
          return {
            ...lead,
            actionRequired: enrichment.contactSuggestions?.join('. ') || lead.actionRequired
          };
        }
      }
    } catch (error) {
      // Continue with original lead
    }
  }

  return lead;
}

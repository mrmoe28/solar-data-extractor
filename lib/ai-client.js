/**
 * Smart AI Client - Automatically uses best available AI
 * Priority: Gemini (FREE) ’ OpenAI (Paid) ’ Fallback (No AI)
 */

import * as gemini from './gemini-analyzer.js';
import * as openai from './openai-analyzer.js';

let activeProvider = null;

/**
 * Detect which AI provider is available
 */
function detectProvider() {
  if (activeProvider) return activeProvider;

  // Priority 1: Google Gemini (FREE tier)
  if (process.env.GEMINI_API_KEY) {
    console.log('  > Using Google Gemini AI (FREE tier)');
    activeProvider = 'gemini';
    return 'gemini';
  }

  // Priority 2: OpenAI (Paid)
  if (process.env.OPENAI_API_KEY) {
    console.log('  > Using OpenAI GPT-4');
    activeProvider = 'openai';
    return 'openai';
  }

  // No AI available
  console.log('  9  No AI configured - using basic analysis');
  activeProvider = 'none';
  return 'none';
}

/**
 * Extract leads from content using AI
 */
export async function extractLeadsFromContent(content, source, location) {
  const provider = detectProvider();

  if (provider === 'gemini') {
    return await gemini.extractLeadsFromContent(content, source, location);
  } else if (provider === 'openai') {
    return await openai.extractLeadsFromContent(content, source, location);
  }

  return []; // No AI available
}

/**
 * Generate search queries using AI
 */
export async function generateSearchQueries(location, previousResults = []) {
  const provider = detectProvider();

  if (provider === 'gemini') {
    return await gemini.generateSearchQueries(location, previousResults);
  } else if (provider === 'openai') {
    return await openai.generateSearchQueries(location, previousResults);
  }

  // Fallback queries if no AI
  return [
    `solar installation ${location}`,
    `solar repair ${location}`,
    `solar panel broken ${location}`,
    `need solar installer ${location}`,
    `solar not working ${location}`
  ];
}

/**
 * Score a lead using AI
 */
export async function scoreLeadWithAI(lead) {
  const provider = detectProvider();

  if (provider === 'gemini') {
    return await gemini.scoreLeadWithAI(lead);
  } else if (provider === 'openai') {
    return await openai.scoreLeadWithAI(lead);
  }

  // Fallback to basic scoring
  return calculateBasicScore(lead);
}

/**
 * Enrich a lead using AI
 */
export async function enrichLead(lead) {
  const provider = detectProvider();

  if (provider === 'gemini') {
    return await gemini.enrichLead(lead);
  } else if (provider === 'openai') {
    return await openai.enrichLead(lead);
  }

  return lead; // No enrichment without AI
}

/**
 * Basic scoring fallback (no AI)
 */
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
 * Check if AI is available
 */
export function hasAI() {
  const provider = detectProvider();
  return provider !== 'none';
}

/**
 * Get current AI provider name
 */
export function getProviderName() {
  const provider = detectProvider();
  if (provider === 'gemini') return 'Google Gemini (FREE)';
  if (provider === 'openai') return 'OpenAI GPT-4';
  return 'None (Basic mode)';
}

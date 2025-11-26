#!/usr/bin/env node

/**
 * Dashboard API Client
 * Sends real-time scraping data to the Eko Lead Dashboard
 */

class DashboardAPIClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl || process.env.DASHBOARD_API_URL;
    this.apiKey = apiKey || process.env.SCRAPER_API_KEY;
    this.sessionId = null;

    if (!this.apiUrl) {
      console.warn('⚠️  DASHBOARD_API_URL not set. Running in offline mode.');
      this.enabled = false;
    } else if (!this.apiKey) {
      console.warn('⚠️  SCRAPER_API_KEY not set. Running in offline mode.');
      this.enabled = false;
    } else {
      this.enabled = true;
      console.log(`✅ Dashboard API Client connected to ${this.apiUrl}`);
    }
  }

  /**
   * Start a new scraping session
   */
  async createSession(location) {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.apiUrl}/api/scraping/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          apiKey: this.apiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.sessionId = data.sessionId;
        console.log(`✅ Session started: #${this.sessionId}`);
        return this.sessionId;
      } else {
        console.error('❌ Failed to create session:', data.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error creating session:', error.message);
      return null;
    }
  }

  /**
   * Send a log message to the dashboard
   */
  async sendLog(source, message, leadCount = 0, status = 'processing') {
    if (!this.enabled || !this.sessionId) return;

    try {
      await fetch(`${this.apiUrl}/api/scraping/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          source,
          message,
          leadCount,
          status,
          apiKey: this.apiKey,
        }),
      });
    } catch (error) {
      // Silently fail - don't interrupt scraping
      console.error('Failed to send log:', error.message);
    }
  }

  /**
   * Send a lead to the dashboard
   */
  async sendLead(lead) {
    if (!this.enabled || !this.sessionId) return;

    try {
      await fetch(`${this.apiUrl}/api/scraping/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          lead,
          apiKey: this.apiKey,
        }),
      });
    } catch (error) {
      console.error('Failed to send lead:', error.message);
    }
  }

  /**
   * Send multiple leads in batch
   */
  async sendLeadsBatch(leads) {
    if (!this.enabled || !this.sessionId) return;

    for (const lead of leads) {
      await this.sendLead(lead);
    }
  }

  /**
   * Complete the scraping session
   */
  async completeSession(status = 'completed', errorMessage = null) {
    if (!this.enabled || !this.sessionId) return;

    try {
      await fetch(`${this.apiUrl}/api/scraping/sessions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          status,
          errorMessage,
          apiKey: this.apiKey,
        }),
      });

      console.log(`✅ Session #${this.sessionId} ${status}`);
    } catch (error) {
      console.error('Failed to complete session:', error.message);
    }
  }
}

export { DashboardAPIClient };

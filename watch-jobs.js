#!/usr/bin/env node

/**
 * Job Watcher - Polls dashboard for pending scraping jobs
 * Run this script to automatically start scraping when jobs are triggered from the dashboard
 *
 * Usage: node watch-jobs.js
 */

import 'dotenv/config';
import { spawn } from 'child_process';

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'https://eko-lead-dashboard.vercel.app';
const POLL_INTERVAL = 5000; // Check every 5 seconds

let currentJob = null;

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║          🤖  SCRAPER JOB WATCHER  🤖                             ║');
console.log('║          Waiting for scraping jobs from dashboard...             ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📡 Dashboard: ${DASHBOARD_API_URL}`);
console.log(`⏱️  Polling every ${POLL_INTERVAL / 1000} seconds`);
console.log('');
console.log('✅ Watcher is running. Press Ctrl+C to stop.');
console.log('💡 Tip: Go to the dashboard and click "Start Scraping" to trigger a job.');
console.log('');

/**
 * Check for pending jobs
 */
async function checkForJobs() {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/api/scraping/sessions`);
    const sessions = await response.json();

    // Find pending sessions
    const pendingSession = sessions.find(s => s.status === 'pending');

    if (pendingSession && !currentJob) {
      console.log(`\n🚀 New job detected!`);
      console.log(`   Session ID: ${pendingSession.id}`);
      console.log(`   Location: ${pendingSession.location}`);
      console.log('');

      startScraper(pendingSession);
    }
  } catch (error) {
    console.error('❌ Error checking for jobs:', error.message);
  }
}

/**
 * Start the scraper for a job
 */
function startScraper(session) {
  currentJob = session;

  console.log(`▶️  Starting scraper for ${session.location}...`);
  console.log('');

  // Spawn scraper process
  const scraper = spawn('node', ['scrape-leads.js', session.location], {
    stdio: 'inherit', // Show scraper output in real-time
    env: {
      ...process.env,
      SCRAPING_SESSION_ID: session.id.toString(),
    },
  });

  scraper.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ Scraper completed successfully!');
    } else {
      console.log(`\n❌ Scraper exited with code ${code}`);
    }
    console.log('');
    console.log('🔍 Watching for new jobs...');
    console.log('');
    currentJob = null;
  });

  scraper.on('error', (error) => {
    console.error('❌ Failed to start scraper:', error);
    currentJob = null;
  });
}

// Start polling
console.log('🔍 Watching for jobs...');
setInterval(checkForJobs, POLL_INTERVAL);

// Check immediately on startup
checkForJobs();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down job watcher...');
  process.exit(0);
});

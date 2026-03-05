import cron from 'node-cron';
import { scrapeQueue } from './index.js';

// Seed URLs to proactively monitor (expand this list later)
const WATCH_LIST = [
  'https://www.udemy.com/courses/search/?q=python&sort=newest',
  'https://www.coursera.org/search?query=programming',
];

export function startScheduler() {
  // Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[scheduler] Running scheduled scrape...');
    for (const url of WATCH_LIST) {
      await scrapeQueue.add('scheduled', { url }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });
    }
  });

  console.log('[scheduler] 24x7 scheduler started');
}
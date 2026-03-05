import { isAllowed } from './robotsChecker.js';
import { scrapeStatic } from './staticScraper.js';
import { scrapeDynamic } from './dynamicScraper.js';
import { normalize } from './normalizer.js';

const JS_HEAVY_DOMAINS = ['udemy.com', 'coursera.org', 'skillshare.com'];

function needsDynamicScraping(url) {
  return JS_HEAVY_DOMAINS.some(domain => url.includes(domain));
}

export async function scrape(url) {
  console.log(`[scraper] Starting: ${url}`);

  const allowed = await isAllowed(url);
  if (!allowed) {
    throw new Error(`robots.txt disallows scraping: ${url}`);
  }

  const raw = needsDynamicScraping(url)
    ? await scrapeDynamic(url)
    : await scrapeStatic(url);

  const normalized = normalize(raw, url);
  console.log(`[scraper] Done: ${url}`);
  return normalized;
}
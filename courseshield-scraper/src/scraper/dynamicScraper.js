import { chromium } from 'playwright';

export async function scrapeDynamic(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'FakeCourseDetectorBot/1.0 (educational project; non-commercial)',
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000); // Let JS render

    const data = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      h1: document.querySelector('h1')?.innerText?.trim() || '',
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 5000),
    }));

    return data;
  } finally {
    await browser.close();
  }
}
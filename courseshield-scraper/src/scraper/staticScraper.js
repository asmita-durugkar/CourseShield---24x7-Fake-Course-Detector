import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'FakeCourseDetectorBot/1.0 (educational project; non-commercial)',
};

export async function scrapeStatic(url) {
  const res = await axios.get(url, {
    headers: HEADERS,
    timeout: 10000,
  });

  const $ = cheerio.load(res.data);

  return {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    h1: $('h1').first().text().trim(),
    bodyText: $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000),
    links: $('a[href]').map((_, el) => $(el).attr('href')).get().slice(0, 50),
  };
}
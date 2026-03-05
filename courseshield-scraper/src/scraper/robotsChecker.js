import robotsParser from 'robots-parser';
import axios from 'axios';

const cache = new Map();

export async function isAllowed(url) {
  try {
    const { origin } = new URL(url);
    const robotsUrl = `${origin}/robots.txt`;

    if (!cache.has(origin)) {
      const res = await axios.get(robotsUrl, { timeout: 5000 });
      cache.set(origin, robotsParser(robotsUrl, res.data));
    }

    const robots = cache.get(origin);
    return robots.isAllowed(url, 'FakeCourseDetectorBot') ?? true;
  } catch {
    // If robots.txt doesn't exist or fails, we allow (conservative assumption)
    return true;
  }
}
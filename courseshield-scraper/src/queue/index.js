import { Queue, Worker, QueueEvents } from 'bullmq';
import { upsertCourse, createScrapeJob, updateScrapeJob, saveFeatures } from '../db/courseRepository.js';
import { scrape } from '../scraper/index.js';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue('scrape', { connection });
export const scrapeQueueEvents = new QueueEvents('scrape', { connection });

export const worker = new Worker('scrape', async (job) => {
  const { url, triggeredBy = 'manual' } = job.data;

  const course = await upsertCourse({ url });
  const scrapeJob = await createScrapeJob({ courseId: course.id, triggeredBy });

  try {
    const result = await scrape(url);

    await updateScrapeJob(scrapeJob.id, {
      status: 'success',
      rawText: result.raw,
    });

    await saveFeatures(scrapeJob.id, result.features);

    console.log(`[queue] Job done for ${url}`, result.features);
    return { scrapeJobId: scrapeJob.id, features: result.features };

  } catch (err) {
    await updateScrapeJob(scrapeJob.id, { status: 'failed' });
    throw err;
  }

}, {
  connection,
  concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
  limiter: { max: 10, duration: 60000 },
});

worker.on('failed', (job, err) => {
  console.error(`[queue] Job failed for ${job.data.url}:`, err.message);
});
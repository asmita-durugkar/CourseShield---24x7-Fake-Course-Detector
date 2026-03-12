import { Queue, Worker, QueueEvents } from 'bullmq';
import { upsertCourse, createScrapeJob, updateScrapeJob, saveFeatures } from '../db/courseRepository.js';
import { scrape } from '../scraper/index.js';
import { extractFeatures } from '../scraper/normalizer.js';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue('scrape', { connection });
export const scrapeQueueEvents = new QueueEvents('scrape', { connection });

export const worker = new Worker('scrape', async (job) => {
  const { url, triggeredBy = 'manual', manual = false, courseData } = job.data;

  // Manual input flow
  if (manual) {
    const manualUrl = `manual-${Date.now()}`;
    const course = await upsertCourse({
      url: manualUrl,
      title: courseData.title,
      instructor: courseData.instructor,
      price: courseData.price,
      description: courseData.description,
    });
    const scrapeJob = await createScrapeJob({ courseId: course.id, triggeredBy: 'manual' });
    await updateScrapeJob(scrapeJob.id, { status: 'success', rawText: courseData.description });
    const features = extractFeatures(courseData);
    await saveFeatures(scrapeJob.id, features);
    console.log(`[queue] Manual job done`, features);
    return { scrapeJobId: scrapeJob.id, features };
  }

  // URL flow
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
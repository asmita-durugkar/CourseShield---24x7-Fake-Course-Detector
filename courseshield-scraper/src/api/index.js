import express from 'express';
import dotenv from 'dotenv';
import { scrapeQueue, scrapeQueueEvents } from '../queue/index.js';
import { startScheduler } from '../queue/scheduler.js';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const job = await scrapeQueue.add('on-demand', { url }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
  });

  // Wait for the job to finish before responding
  const result = await job.waitUntilFinished(scrapeQueueEvents, 60000);

  res.json({ jobId: job.id, status: 'completed', url, result });
});

app.get('/job/:id', async (req, res) => {
  const job = await scrapeQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const state = await job.getState();

  res.json({
    jobId: job.id,
    state,
    result: job.returnvalue,
    error: job.failedReason,
    attempts: job.attemptsMade,
  });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[api] Running on port ${PORT}`);
  startScheduler();
});
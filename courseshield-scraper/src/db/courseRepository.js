import prisma from './client.js';

// Upsert a course — create if new, skip if already exists
export async function upsertCourse({ url, title, platform, instructor, price, description }) {
  return prisma.course.upsert({
    where: { url },
    update: { title, platform, instructor, price, description },
    create: { url, title, platform, instructor, price, description },
  });
}

// Create a scrape job record
export async function createScrapeJob({ courseId, triggeredBy }) {
  return prisma.scrapeJob.create({
    data: { courseId, triggeredBy, status: 'pending' },
  });
}

// Update scrape job status + raw text
export async function updateScrapeJob(id, { status, rawText }) {
  return prisma.scrapeJob.update({
    where: { id },
    data: { status, rawText },
  });
}

// Save extracted features
export async function saveFeatures(scrapeJobId, features) {
  return prisma.courseFeatures.create({
    data: { scrapeJobId, ...features },
  });
}

// Save model's verdict
export async function saveAnalysisResult(scrapeJobId, { verdict, confidenceScore, flaggedReasons }) {
  return prisma.analysisResult.create({
    data: { scrapeJobId, verdict, confidenceScore, flaggedReasons },
  });
}

// Fetch full course history
export async function getCourseByUrl(url) {
  return prisma.course.findUnique({
    where: { url },
    include: {
      scrapeJobs: {
        include: {
          features: true,
          result: true,
        },
        orderBy: { scrapedAt: 'desc' },
      },
    },
  });
}
-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "platform" TEXT,
    "instructor" TEXT,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rawText" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFeatures" (
    "id" TEXT NOT NULL,
    "scrapeJobId" TEXT NOT NULL,
    "wordCount" INTEGER,
    "hasInflatedClaims" BOOLEAN NOT NULL DEFAULT false,
    "hasMoneyBackGuarantee" BOOLEAN NOT NULL DEFAULT false,
    "descriptionLength" INTEGER,
    "titleDescriptionMismatch" BOOLEAN NOT NULL DEFAULT false,
    "reviewVelocity" DOUBLE PRECISION,
    "instructorCourseCount" INTEGER,
    "pricingAnomalyScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "scrapeJobId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "flaggedReasons" TEXT[],
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_url_key" ON "Course"("url");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeatures_scrapeJobId_key" ON "CourseFeatures"("scrapeJobId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_scrapeJobId_key" ON "AnalysisResult"("scrapeJobId");

-- AddForeignKey
ALTER TABLE "ScrapeJob" ADD CONSTRAINT "ScrapeJob_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeatures" ADD CONSTRAINT "CourseFeatures_scrapeJobId_fkey" FOREIGN KEY ("scrapeJobId") REFERENCES "ScrapeJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_scrapeJobId_fkey" FOREIGN KEY ("scrapeJobId") REFERENCES "ScrapeJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

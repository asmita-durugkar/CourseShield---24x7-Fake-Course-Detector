export function normalize(raw, url) {
  const wordCount = raw.bodyText.split(' ').length;
  const hasMoneyBackGuarantee = /money.back|refund/i.test(raw.bodyText);
  const hasInflatedClaims = /(become an expert|master .* in \d+ days|guaranteed job|earn \$\d+)/i.test(raw.bodyText);
  const descriptionLength = raw.description.length;

  return {
    url,
    scrapedAt: new Date().toISOString(),
    title: raw.title,
    description: raw.description,
    h1: raw.h1,
    features: {
      wordCount,
      hasMoneyBackGuarantee,
      hasInflatedClaims,
      descriptionLength,
      titleDescriptionMismatch: !raw.description.toLowerCase().includes(
        raw.title.toLowerCase().split(' ')[0]
      ),
    },
    raw: raw.bodyText,
  };
}

export function extractFeatures(data) {
  const wordCount = data.description?.split(' ').length || 0;
  const hasInflatedClaims = /(become an expert|master .* in \d+ days|guaranteed job|earn \$\d+)/i.test(data.description);
  const hasMoneyBackGuarantee = /money.back|refund/i.test(data.description);
  const descriptionLength = data.description?.length || 0;
  const titleDescriptionMismatch = !data.description?.toLowerCase().includes(
    data.title?.toLowerCase().split(' ')[0]
  );
  const reviewVelocity = data.num_reviews && data.published_date
    ? data.num_reviews / Math.max(1, Math.floor((Date.now() - new Date(data.published_date)) / (1000 * 60 * 60 * 24)))
    : null;
  const subscriberToReviewRatio = data.num_subscribers && data.num_reviews
    ? data.num_subscribers / Math.max(1, data.num_reviews)
    : null;
  const contentPerLecture = data.content_duration && data.num_lectures
    ? data.content_duration / Math.max(1, data.num_lectures)
    : null;

  return {
    wordCount,
    hasInflatedClaims,
    hasMoneyBackGuarantee,
    descriptionLength,
    titleDescriptionMismatch,
    reviewVelocity,
    subscriberToReviewRatio,
    contentPerLecture,
  };
}
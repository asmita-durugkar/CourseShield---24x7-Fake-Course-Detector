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
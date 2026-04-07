import { SITE_ORIGIN } from './siteOrigin.ts';

const APP_NAME = 'BioBot';

const DESCRIPTION =
  'Free in-browser CV and resume builder with ATS-oriented Word export, live preview, and optional Google Gemini tailoring to job descriptions. No sign-up; your draft stays on your device.';

/** Canonical public URL for the app (trailing slash, matches index.html link rel=canonical). */
export function landingPageUrl(): string {
  return `${SITE_ORIGIN}/`;
}

export type JsonLdGraphRoot = {
  '@context': string;
  '@graph': Record<string, unknown>[];
};

export function buildLandingJsonLdGraph(): JsonLdGraphRoot {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: APP_NAME,
        description: DESCRIPTION,
        url: landingPageUrl(),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web browser',
        browserRequirements: 'Requires JavaScript. Modern evergreen browser.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };
}

export function buildLandingJsonLdString(): string {
  return JSON.stringify(buildLandingJsonLdGraph());
}

import { describe, expect, it } from 'vitest';

import { SITE_ORIGIN } from './siteOrigin.ts';
import { buildLandingJsonLdGraph, buildLandingJsonLdString, landingPageUrl } from './landingSeo.ts';

describe('landingSeo', () => {
  it('landingPageUrl matches canonical base', () => {
    expect(landingPageUrl()).toBe(`${SITE_ORIGIN}/`);
    expect(landingPageUrl().startsWith(SITE_ORIGIN)).toBe(true);
  });

  it('buildLandingJsonLdGraph has one WebApplication with required fields', () => {
    const root = buildLandingJsonLdGraph();
    expect(root['@context']).toBe('https://schema.org');
    expect(root['@graph']).toHaveLength(1);

    const app = root['@graph'][0] as Record<string, unknown>;
    expect(app['@type']).toBe('WebApplication');
    expect(typeof app.name).toBe('string');
    expect((app.name as string).length).toBeGreaterThan(0);
    expect(typeof app.description).toBe('string');
    expect((app.description as string).length).toBeGreaterThan(0);
    expect(app.url).toBe(landingPageUrl());
    expect(app.applicationCategory).toBe('BusinessApplication');
    expect(app.operatingSystem).toBe('Web browser');

    const offers = app.offers as Record<string, unknown>;
    expect(offers['@type']).toBe('Offer');
    expect(offers.price).toBe('0');
    expect(offers.priceCurrency).toBe('USD');
  });

  it('buildLandingJsonLdString parses back to same graph shape', () => {
    const parsed = JSON.parse(buildLandingJsonLdString()) as ReturnType<
      typeof buildLandingJsonLdGraph
    >;
    expect(parsed['@graph']).toHaveLength(1);
    expect((parsed['@graph'][0] as Record<string, unknown>)['@type']).toBe('WebApplication');
  });
});

import { buildLandingJsonLdString } from '@/lib/landingSeo.ts';

/** Prerender-friendly WebApplication JSON-LD for the marketing homepage. */
export function LandingSeoJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: buildLandingJsonLdString() }}
    />
  );
}

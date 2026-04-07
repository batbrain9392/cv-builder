/**
 * Optional, privacy-oriented analytics injected at runtime when configured via
 * environment variables. Default is zero tracking.
 *
 * **Cloudflare Web Analytics (recommended here):** set
 * `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN` to the token from the Cloudflare
 * dashboard (Web Analytics → your site → Manage site → JS snippet). The
 * beacon uses `https://static.cloudflareinsights.com/beacon.min.js` and
 * enables SPA route tracking via the History API (see Cloudflare docs).
 *
 * **Plausible-style script:** if the Cloudflare token is unset, you may set
 * `VITE_ANALYTICS_SCRIPT_URL` and optionally `VITE_ANALYTICS_DATA_DOMAIN`
 * (`data-domain` on the script tag).
 */

const CLOUDFLARE_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';

function injectCloudflareBeacon(token: string): void {
  const script = document.createElement('script');
  script.defer = true;
  script.src = CLOUDFLARE_BEACON_SRC;
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.appendChild(script);
}

function injectCustomScript(src: string, dataDomain?: string): void {
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  if (dataDomain) script.dataset.domain = dataDomain;
  document.head.appendChild(script);
}

export function initAnalytics(): void {
  const cfToken = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  if (cfToken) {
    injectCloudflareBeacon(cfToken);
    return;
  }

  const src = import.meta.env.VITE_ANALYTICS_SCRIPT_URL;
  if (!src) return;

  const domain = import.meta.env.VITE_ANALYTICS_DATA_DOMAIN;
  injectCustomScript(src, domain);
}

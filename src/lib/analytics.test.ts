/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('initAnalytics', () => {
  let holder: HTMLDivElement;

  beforeEach(() => {
    holder = document.createElement('div');
    vi.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
      holder.appendChild(node);
      return node;
    });
    vi.stubEnv('VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN', '');
    vi.stubEnv('VITE_ANALYTICS_SCRIPT_URL', '');
    vi.stubEnv('VITE_ANALYTICS_DATA_DOMAIN', '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
    holder.replaceChildren();
  });

  it('injects Cloudflare Web Analytics when VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN is set', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN', 'my-test-token');
    const { initAnalytics } = await import('./analytics.ts');
    initAnalytics();

    const script = holder.querySelector<HTMLScriptElement>('script[src*="cloudflareinsights.com"]');
    expect(script).not.toBeNull();
    expect(script?.defer).toBe(true);
    expect(script?.getAttribute('data-cf-beacon')).toBe(JSON.stringify({ token: 'my-test-token' }));
  });

  it('does not inject scripts when no analytics env is set', async () => {
    const { initAnalytics } = await import('./analytics.ts');
    initAnalytics();
    expect(holder.querySelectorAll('script')).toHaveLength(0);
  });

  it('injects custom script when only VITE_ANALYTICS_SCRIPT_URL is set', async () => {
    vi.stubEnv('VITE_ANALYTICS_SCRIPT_URL', 'https://plausible.io/js/script.js');
    vi.stubEnv('VITE_ANALYTICS_DATA_DOMAIN', 'example.com');
    const { initAnalytics } = await import('./analytics.ts');
    initAnalytics();

    const script = holder.querySelector('script');
    expect(script?.getAttribute('src')).toBe('https://plausible.io/js/script.js');
    expect(script?.dataset.domain).toBe('example.com');
  });

  it('prefers Cloudflare token over Plausible-style vars', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN', 'cf-token');
    vi.stubEnv('VITE_ANALYTICS_SCRIPT_URL', 'https://plausible.io/js/script.js');
    const { initAnalytics } = await import('./analytics.ts');
    initAnalytics();

    expect(holder.querySelectorAll('script')).toHaveLength(1);
    expect(holder.querySelector('script')?.getAttribute('data-cf-beacon')).toContain('cf-token');
  });
});

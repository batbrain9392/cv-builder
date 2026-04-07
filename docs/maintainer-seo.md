# Maintainer guide: GitHub Pages, SEO, Google Search, and Cloudflare Web Analytics

Audience: **you** (or anyone maintaining deploy + search + analytics), not end users. This ties together how the site is hosted, what we ship for crawlers, **Google Search Console (GSC)**, and **Cloudflare Web Analytics** (used on the maintainer’s production build when the CI token is set; forks can omit it).

---

## 1. How the live site works (and why Google can index it)

The app is a **static SPA** on **GitHub Pages** under a project path, e.g.  
`https://<user>.github.io/<repo>/`.

**Path-based URLs** (`/`, `/guide`, `/app`) matter for SEO: each route is a real URL, unlike hash routing (`/#/guide`), which is weaker for crawlers.

The full routing + `404.html` + prerender story is documented here (read this first if you change routes or hosting):

- **[`github-pages-spa-routing.md`](./github-pages-spa-routing.md)** — `BrowserRouter`, `basename`, `dist/404.html`, prerender, hydration.

**Crawler-relevant outcome:**

- **`/`** and **`/guide`** — Prerendered HTML in `dist/` so bots get real content without executing JS (`scripts/prerender.ts`, `src/prerender.tsx`, `src/marketingPrerenderUrls.json`).
- **`/app`** — Served via the Pages **404 fallback** with an **empty `#root`** so the editor does not ship landing markup; HTTP status may still be **404** for that path (static hosting limitation).

---

## 2. What we ship for SEO (repo map)

| Piece                                                                                                                                                              | Role                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`index.html`](../index.html)                                                                                                                                      | Canonical URL, `<title>`, `meta description`, Open Graph, Twitter cards. Keep in sync with landing title logic in [`LandingPage.tsx`](../src/pages/LandingPage.tsx) (`useDocumentTitle` subtitle).                                                                    |
| [`scripts/prerender.ts`](../scripts/prerender.ts)                                                                                                                  | Injects prerendered React HTML into `dist/index.html` and `dist/guide/index.html`. Patches **guide-only** `<head>` (title, canonical, OG/Twitter). Regexes assume **multiline** `<meta>` blocks in `index.html` — do not change head shape without updating patterns. |
| [`public/robots.txt`](../public/robots.txt)                                                                                                                        | `Allow: /` + sitemap URL.                                                                                                                                                                                                                                             |
| [`public/sitemap.xml`](../public/sitemap.xml)                                                                                                                      | Lists marketing URLs (landing + guide). **Forks:** replace host with your Pages URL.                                                                                                                                                                                  |
| [`src/lib/siteOrigin.ts`](../src/lib/siteOrigin.ts), [`landingSeo.ts`](../src/lib/landingSeo.ts), [`LandingSeoJsonLd.tsx`](../src/components/LandingSeoJsonLd.tsx) | **WebApplication** JSON-LD on the landing page only (prerendered into `#root`). **Forks:** align `SITE_ORIGIN` and descriptions with your deploy URL.                                                                                                                 |
| [`public/google*.html`](../public/)                                                                                                                                | **Google Search Console** HTML file verification (filename + one-line body from GSC). Safe to commit; do not remove while the property relies on it.                                                                                                                  |
| [`src/lib/analytics.ts`](../src/lib/analytics.ts), [`src/main.tsx`](../src/main.tsx)                                                                               | Optional **Cloudflare Web Analytics** beacon when `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is set at build time (see §5).                                                                                                                                                |

**Intentionally not in this doc:** ranking guarantees, keyword strategy, FAQ schema (see plan history if needed).

---

## 3. Google Search Console — setup we use

### Property type

Use a **URL-prefix** property for the deployed base URL, e.g.:

`https://batbrain9392.github.io/cv-builder/`

(Domain properties are possible but different; URL-prefix matches how we verify and filter.)

### Ownership verification

1. In GSC, choose **HTML file** verification.
2. Download the file Google gives you (name like `googleXXXXXXXX.html`).
3. Place it under **`public/`** in this repo so Vite copies it to **`dist/`** root on build.
4. File **content** must match **exactly** what Google shows (usually a single line).
5. Deploy (push to `main` so CI publishes Pages).
6. Confirm it is reachable:  
   `https://<user>.github.io/<repo>/googleXXXXXXXX.html`
7. Click **Verify** in GSC.

### Sitemaps

1. GSC → **Sitemaps** → add:  
   `https://<user>.github.io/<repo>/sitemap.xml`
2. Ensure [`public/sitemap.xml`](../public/sitemap.xml) uses the **same origin** as production.

### Request indexing

After major launches or first-time setup:

- **URL inspection** → enter the homepage URL → **Request indexing** (use occasionally, not repeatedly on every commit).

### Checking if Google has the site

- **`site:`** is unreliable for **paths**. Prefer:  
  `site:<user>.github.io inurl:<repo>`  
  or rely on **GSC → Pages / URL inspection** (“URL is on Google” vs not).
- **First indexing** can take **days to weeks** even when everything is correct.

---

## 4. Fork or custom domain checklist

If you fork or change hostname:

1. [`index.html`](../index.html) — `canonical`, `og:url`, `og:image`, absolute asset URLs if any.
2. [`public/sitemap.xml`](../public/sitemap.xml) — all `<loc>` values.
3. [`public/robots.txt`](../public/robots.txt) — `Sitemap:` line.
4. [`src/lib/siteOrigin.ts`](../src/lib/siteOrigin.ts) — `SITE_ORIGIN`.
5. [`scripts/prerender.ts`](../scripts/prerender.ts) — `SITE_ORIGIN` in guide head patch (must match).
6. **GSC** — new property (or updated verification), new sitemap submit, request indexing.
7. **Remove or replace** `public/google*.html` with **your** verification file if you use HTML file method.
8. **Cloudflare Web Analytics** (if used) — in the Cloudflare dashboard, set the site hostname to your **real public URL** (same origin as `SITE_ORIGIN`). Update the **`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`** secret (or disable analytics by leaving it unset).

---

## 5. Cloudflare Web Analytics

**Cloudflare Web Analytics** is **traffic and performance analytics** (page views, top paths, Web Vitals-style signals). This app is wired to use it in **production** whenever the build has **`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`** (e.g. GitHub Actions secret). It is **not** a replacement for **Google Search Console**: GSC answers “is Google indexing me?” and “what did Search show?”; Cloudflare answers “how many people loaded the site?”

### Do you need a Cloudflare “zone” or move hosting?

**No** for the setup we use. The app is built with an optional beacon injected in [`src/lib/analytics.ts`](../src/lib/analytics.ts) when **`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`** is set at **build** time. That matches Cloudflare’s flow for **sites not proxied through Cloudflare** (e.g. plain GitHub Pages): you add a **Web Analytics** site in the dashboard and paste the **token** into the build.

If the domain is later **proxied through Cloudflare**, automatic beacon injection may apply; see [Cloudflare Web Analytics — get started](https://developers.cloudflare.com/web-analytics/get-started/). Our repo still works with the **manual token** approach.

### Setup (dashboard + CI)

1. [Cloudflare dashboard](https://dash.cloudflare.com) → **Analytics & logs** (or search) → **Web Analytics**.
2. **Add a site** → enter the **exact hostname** visitors use (e.g. `batbrain9392.github.io` for `https://batbrain9392.github.io/cv-builder/`, or your custom domain if you add one).
3. **Manage site** → copy the **token** from the JavaScript snippet (`data-cf-beacon`).
4. **GitHub Actions:** add a repository secret **`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`** with that token. [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) passes it into `npm run build` so production JS includes the beacon.
5. **Local / preview:** put the same variable in `.env.local` (not committed), then `npm run build && npm run preview`.

If the secret is **unset**, no analytics script is shipped (default).

### Behaviour notes

- The beacon loads from `static.cloudflareinsights.com` and reports to Cloudflare’s endpoints; see their privacy docs for what they collect.
- Cloudflare documents **SPA / History API** tracking for this beacon; path-based React Router routes are intended to be counted as separate navigations (no hash-router requirement).
- **Vitest:** [`src/lib/analytics.test.ts`](../src/lib/analytics.test.ts) stubs empty `VITE_*` analytics env vars so a local `.env` does not break CI.

### Optional: Cloudflare Pages as host

This project deploys to **GitHub Pages** today. **Cloudflare Pages** is a separate free-tier host you could use instead; it would change URLs, CI, and every **origin** in this doc (`index.html`, sitemap, `SITE_ORIGIN`, GSC property, Cloudflare Web Analytics hostname). Not documented step-by-step here — treat as a **migration**, not a toggle.

---

## 6. Other optional analytics

If **`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`** is unset, you may use a **Plausible-style** script via **`VITE_ANALYTICS_SCRIPT_URL`** and optional **`VITE_ANALYTICS_DATA_DOMAIN`** (see [`README.md`](../README.md) and `analytics.ts`). Same rule: **not** a substitute for GSC.

---

## 7. Quick health checks (production)

- Homepage **200**: `https://<user>.github.io/<repo>/`
- Sitemap **200** and valid XML: `…/sitemap.xml`
- `robots.txt` **200**: `…/robots.txt`
- Verification file **200** (if used): `…/googleXXXXXXXX.html`
- GSC **URL inspection** on homepage — no unexpected “Blocked” / “Excluded” reason

If those pass and GSC still shows slow indexing, the usual answer is **time and discovery** (links, sitemap, request indexing once), not a missing meta tag.

**If Cloudflare Web Analytics is enabled:** after visiting the live site, check the browser **Network** tab for requests to `cloudflareinsights.com` / `rum` to confirm the beacon runs (allow a few minutes for data in the Cloudflare dashboard).

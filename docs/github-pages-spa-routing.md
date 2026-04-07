# GitHub Pages and SPA routing

This app is a single-page application (SPA) deployed to **GitHub Pages** under the project subpath **`/cv-builder/`** (see `base` in `vite.config.ts`).

## What we do today: `BrowserRouter` + `404.html`

We use **`BrowserRouter`** with **`basename="/cv-builder"`** (see `src/main.tsx`). Public URLs look like:

- `https://<user>.github.io/cv-builder/` — landing
- `https://<user>.github.io/cv-builder/guide` — how-to guide
- `https://<user>.github.io/cv-builder/app` — editor

Clicks inside the app are handled by React Router without a full page load.

### Why `dist/404.html` exists

GitHub Pages only serves static files. A **direct visit or refresh** on `/cv-builder/guide` would normally 404 because there is no `guide/index.html`. After each production build, **`scripts/copy-github-pages-404.ts`** writes **`dist/404.html`** from the same **scripts, CSS, and `<head>`** as **`dist/index.html`**, but with an **empty `#root`**.

That matters because **`dist/index.html` is prerendered** with the full landing page inside `#root`. Unknown paths (e.g. `/cv-builder/app`) must not ship that marketing HTML — users should get a blank shell so React mounts the editor without tearing down the wrong DOM.

GitHub Pages serves `404.html` for unknown paths so the SPA loads and React Router reads `window.location.pathname`.

This uses GitHub’s **404 page as an SPA fallback**; HTTP status may still be 404 for those paths (a static-hosting limitation). Hosts like Netlify or Cloudflare Pages can return **200** with a rewrite rule instead.

The step runs automatically via **`npm run build`** (`package.json`), after **`scripts/prerender.ts`**.

### Prerender and hydration

**`/`** and **`/guide`** are **prerendered** at build time (`scripts/prerender.ts` + `src/prerender.tsx`) so crawlers receive real HTML. **`marketingRouteElements.tsx`** uses **eager** imports for those pages (not `lazy`) so the client tree matches the static HTML. In production, **`src/main.tsx`** uses **`hydrateRoot`** when `#root` already has content; **`/app`** (via `404.html`) uses **`createRoot`** on an empty `#root`.

If you add another **marketing** route, update **`marketingRouteElements.tsx`** (a route fragment, not a wrapper component), add its URL to **`src/marketingPrerenderUrls.json`**, and extend **`patchGuideHead`** in **`scripts/prerender.ts`** if that page needs its own `<head>`.

## Hash routing (previous approach)

Earlier versions used **`HashRouter`** (`/#/guide`, etc.). That avoided the 404 workaround but is weaker for SEO because fragments are not separate URLs for crawlers. We switched to path-based URLs for discoverability.

## In-app links

Use **`<Link to="/guide">`** (and similar), not hardcoded absolute paths. React Router applies `basename` for you.

## Related files

- `src/main.tsx` — `BrowserRouter`, `basename`, `hydrateRoot` / `createRoot`
- `src/marketingRouteElements.tsx` — shared marketing `<Route>` fragment (used by `App.tsx` and `src/prerender.tsx`)
- `src/marketingPrerenderUrls.json` — URLs prerendered to static HTML (read by `scripts/prerenderRoutes.ts`)
- `vite.config.ts` — `base: '/cv-builder/'`
- `scripts/html-root.ts` — parse `#root` and replace inner HTML (prerender + `404.html`)
- `scripts/prerender.ts` — SSR prerender for `/` and `/guide` (run via `tsx` from `npm run build`)
- `scripts/copy-github-pages-404.ts` — post-build `404.html` with empty `#root`
- `playwright.config.ts` — E2E `baseURL` includes `/cv-builder/`
- `.github/workflows/ci.yml` — build output uploaded to Pages

import { renderToString } from 'react-dom/server';
import { Routes, StaticRouter } from 'react-router';

import { marketingRouteElements } from './marketingRouteElements.tsx';

/**
 * Render a route to static HTML for the prerender postbuild step.
 *
 * Marketing `<Route>`s live in `marketingRouteElements.tsx`; URL list in
 * `marketingPrerenderUrls.json`. Uses `renderToString` (no `lazy`/`Suspense`).
 * `/app` is not prerendered — editor state depends on `localStorage`.
 */
export function renderRoute(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <Routes>{marketingRouteElements}</Routes>
    </StaticRouter>,
  );
}

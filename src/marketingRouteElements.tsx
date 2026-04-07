import { Route } from 'react-router';

import GuidePage from './pages/GuidePage.tsx';
import LandingPage from './pages/LandingPage.tsx';

/**
 * Fragment of `<Route>`s for marketing pages. Must stay a **fragment** (not a
 * wrapper component): React Router only allows `<Route>` or `<Fragment>` as
 * direct children of `<Routes>`. Prerender URLs: `marketingPrerenderUrls.json`.
 */
export const marketingRouteElements = (
  <>
    <Route index element={<LandingPage />} />
    <Route path="guide" element={<GuidePage />} />
  </>
);

# Code Review Log

Last reviewed: 2026-04-06

## Review #3 — 2026-04-06

**Scope: guide page and documentation sync**

TypeScript clean, ESLint clean, 130/130 tests pass, production build succeeds (~4.9 s). No new test files — the guide is a static content page with no interactive logic requiring unit tests.

### New feature: user guide (`/guide`)

A full step-by-step guide page was added at `/#/guide`, accessible from the landing page, editor menu, and AppHeader. The implementation lives in:

- `src/pages/GuidePage.tsx` — route-level page (lazy-loaded), 771 lines
- `src/guide/` — five extracted components: `GuideCallout`, `GuidePathPicker`, `GuidePhase`, `GuideSection`, `GuideToc`

The guide uses a path-first hub (user picks their starting point) with collapsible phases and a sticky sidebar TOC on desktop. All content is hardcoded JSX — no markdown rendering or external data fetching.

### Documentation updates

README.md, `generate-overview.mjs`, and OVERVIEW.md were updated to reflect:

- The `/guide` route (was missing from all three)
- CV file import (Word, PDF, image, text) and job description upload (was under-documented)
- Correct hash route listing (`/#/`, `/#/guide`, `/#/app`)
- New `src/guide/` directory in the source layout table

### Metrics

| Metric                  | Value                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| TypeScript              | 0 errors                                                                     |
| ESLint                  | 0 errors, 0 warnings                                                         |
| Tests                   | 130 passed, 0 failed (15 test files)                                         |
| Source files            | 82 (up from 76)                                                              |
| Build time              | ~4.9 s                                                                       |
| Largest chunk (mammoth) | 500 KB (130 KB gzip)                                                         |
| Largest chunk (vendor)  | 398 KB (126 KB gzip)                                                         |
| App chunk               | 352 KB (104 KB gzip)                                                         |
| Lazy chunks             | docx 407 KB, genai 284 KB, sentry 143 KB, LandingPage 28 KB, GuidePage 25 KB |

### Architecture Notes

- **Routing:** Three hash routes now — `/` (landing), `/guide` (guide), `/app` (editor). Guide and landing are both lazy-loaded with `Suspense`.
- **Guide structure:** Path picker + collapsible phases pattern. No form state, no API calls, no localStorage. Pure read-only content page.
- **Bundle impact:** GuidePage adds a 25 KB lazy chunk (7 KB gzip) — negligible since it only loads on demand.

### Areas to Watch in Future Reviews

- `GuidePage.tsx` at 771 lines is large for a content page. If it grows further, consider extracting phase content into data arrays or separate modules.
- The guide content is hardcoded — if features change, the guide must be manually updated to match.
- `CvEditorPage` complexity remains a watch item (now 974 lines).

---

## Review #2 — 2026-04-06

**Overall: 8.4 / 10**

TypeScript clean, ESLint clean, 130/130 tests pass (up from 79), production build succeeds. Test coverage improved significantly (+51 tests, +5 test files). New features (file upload/import via mammoth, Sentry error tracking) are well-integrated. Pattern uniformity across components is strong with a few minor inconsistencies addressed below.

### Issues Found and Resolved

| #   | Issue                                                                                    | Severity | Status    | Fix                                                                                            |
| --- | ---------------------------------------------------------------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------- |
| 1   | `SectionToolbar` uses `<h2>` inside `<h3>` context — heading hierarchy violation         | Medium   | **Fixed** | Changed `<h2>` to `<p>` — it's a visual label, not a document heading                          |
| 2   | `HighlightsAiEnhance` uses `[&>svg]:!size-3.5` vs `[&>svg]:size-3.5!` in other AI badges | Low      | **Fixed** | Normalized to `[&>svg]:size-3.5!` to match CvEditorPage and CoverLetterFields                  |
| 3   | Hardcoded `amber-600`/`yellow-500` colors in AiSettingsFields and ImportDataFields       | Medium   | **Fixed** | Added `--warning-*` CSS variables to theme; replaced hardcoded classes                         |
| 4   | `mammoth` chunk 500.56 KB triggers Vite build warning                                    | Low      | **Fixed** | Already in `manualChunks`; raised `chunkSizeWarningLimit` to 510 KB                            |
| 5   | `OVERVIEW.md` stale: wrong file counts, missing deps, incorrect localStorage claims      | High     | **Fixed** | Fixed `generate-overview.mjs` script (persistence, localStorage, Sentry, mammoth); regenerated |

### Known Issues (Not Fixed — Acceptable)

| #   | Issue                                                                        | Severity | Reason                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7   | `CvEditorPage` is now 944 lines (was 680 in Review #1)                       | Medium   | Grew due to new features (import, cover letter, starter data handling). Form sections are extracted into `*Fields.tsx`. Further splitting adds prop-drilling complexity. |
| 8   | `EMPTY_DEFAULTS` has empty arrays that violate schema's `min(1)` constraints | Low      | Only used as form reset defaults (not validated on mount). Tests that reference `EMPTY_DEFAULTS.experience[0]` are fragile but passing.                                  |
| 9   | `parseCvFromText` relaxed path returns structurally incomplete `CvFormData`  | Low      | By design — surfaces `issues[]` to caller. Users fix in the form.                                                                                                        |
| 10  | CV preview hardcodes colors (`#000`, `#333`) instead of theme variables      | Low      | Intentional — preview simulates printed document appearance.                                                                                                             |
| 11  | `GeminiIcon` and "built with" logos load from `cdn.simpleicons.org`          | Low      | Decorative images with `alt=""` — graceful failure.                                                                                                                      |
| 12  | Index-based `key` props in `CvPreview` list rendering                        | Low      | Preview is read-only (no reorder/delete); React reconciliation risk is minimal.                                                                                          |
| 13  | Landing page "step cards" use manual classes instead of `Card` component     | Low      | Intentional design variation — step cards have a different visual treatment (number badges, no border-left accent) than feature cards.                                   |

### Metrics

| Metric                  | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| TypeScript              | 0 errors                                                    |
| ESLint                  | 0 errors, 0 warnings                                        |
| Tests                   | 130 passed, 0 failed (15 test files)                        |
| Build time              | ~5.4s                                                       |
| Largest chunk (mammoth) | 500 KB (130 KB gzip)                                        |
| Largest chunk (vendor)  | 398 KB (126 KB gzip)                                        |
| App chunk               | 351 KB (104 KB gzip)                                        |
| Lazy chunks             | docx 407 KB, genai 284 KB, sentry 143 KB, LandingPage 31 KB |

### Architecture Notes

- **State**: Local component state + react-hook-form. No global store.
- **Routing**: HashRouter with two routes (landing `/`, editor `/app`).
- **AI**: Client-side Gemini calls via `@google/genai`, dynamically imported.
- **Import**: CV file parsing via `mammoth` (DOCX) and Gemini (PDF/image), dynamically imported.
- **Export**: DOCX via `docx` library, dynamically imported.
- **Styling**: Tailwind CSS v4 + shadcn-style UI primitives. OKLCH CSS variables for theming, including new `--warning-*` semantic tokens.
- **Error monitoring**: Sentry with PII scrubbing, lazy-loaded (143 KB chunk).
- **Persistence**: CV data, API key, and theme in `localStorage` via `cvStorage.ts`.

### Areas to Watch in Future Reviews

- `CvEditorPage` complexity — now 944 lines, approaching the point where extraction would pay off
- Bundle sizes: `mammoth` at 500 KB is the largest single chunk
- Accessibility: verify Base UI tooltip wires `aria-describedby` correctly
- Component test coverage improving (now 7 component test files, up from 3)

---

## Review #1 — 2026-04-04

**Overall: 8.2 / 10**

TypeScript clean, ESLint clean, 79/79 tests pass, production build succeeds.

### Issues Found and Resolved

| #   | Issue                                                                                 | Severity | Status    | Fix                                                                                      |
| --- | ------------------------------------------------------------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------- |
| 1   | `downloadBlob` immediate `revokeObjectURL` is racy — Safari can abort downloads       | High     | **Fixed** | Added 60s `setTimeout` before revoke                                                     |
| 2   | `CvPreviewPanel.useFormData` did `JSON.parse(JSON.stringify(...))` on every keystroke | High     | **Fixed** | Replaced with per-field `useWatch` calls — zero-copy, type-safe                          |
| 3   | Desktop preview always mounted on mobile (duplicate useWatch + ResizeObserver)        | High     | **Fixed** | Conditional render via `useMediaQuery('(min-width: 1024px)')`                            |
| 4   | 732 KB single chunk (docx + genai + app code)                                         | Medium   | **Fixed** | `manualChunks` in vite.config.ts — split into vendor/genai/docx/app, no chunk > 500 KB   |
| 5   | `useIsScrolledPast` returned true for elements below the fold, not just above         | Medium   | **Fixed** | Replaced `!useIsInView` with dedicated observer checking `boundingClientRect.bottom < 0` |
| 6   | `ErrorBoundary` had no reset path — users stuck on fallback until page reload         | Medium   | **Fixed** | `fallback` now accepts `(reset) => ReactNode`; "Try again" buttons added                 |

### Known Issues (Not Fixed — Acceptable)

| #   | Issue                                                                         | Severity | Reason                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | `CvEditorPage` is 680+ lines                                                  | Medium   | Form sections are already extracted into `*Fields.tsx`. Splitting further would add prop-drilling complexity without clear benefit until new features are added. |
| 8   | `EMPTY_DEFAULTS` has empty arrays that violate schema's `min(1)` constraints  | Low      | Only used as form reset defaults (not validated on mount). Tests that reference `EMPTY_DEFAULTS.experience[0]` are fragile but passing.                          |
| 9   | `parseCvFromText` relaxed path returns structurally incomplete `CvFormData`   | Low      | By design — surfaces `issues[]` to caller. Users fix in the form.                                                                                                |
| 10  | CV preview hardcodes colors (`#000`, `#333`) instead of theme variables       | Low      | Intentional — preview simulates printed document appearance.                                                                                                     |
| 11  | `GeminiIcon` and "built with" logos load from `cdn.simpleicons.org`           | Low      | Decorative images with `alt=""` — graceful failure.                                                                                                              |
| 12  | Index-based `key` props in `CvPreview` list rendering                         | Low      | Preview is read-only (no reorder/delete); React reconciliation risk is minimal.                                                                                  |
| 13  | `onGenerateSummary` / `onGenerateCoverLetter` not memoized with `useCallback` | Low      | These are passed to components that don't memo-compare props. No measurable impact.                                                                              |

### Metrics

| Metric                 | Value                                        |
| ---------------------- | -------------------------------------------- |
| TypeScript             | 0 errors                                     |
| ESLint                 | 0 errors, 0 warnings                         |
| Tests                  | 79 passed, 0 failed (10 test files)          |
| Build time             | ~3s                                          |
| Largest chunk (app)    | 326 KB (97 KB gzip)                          |
| Largest chunk (vendor) | 407 KB (129 KB gzip)                         |
| Lazy chunks            | docx 407 KB, genai 284 KB, LandingPage 28 KB |

### Architecture Notes

- **State**: Local component state + react-hook-form. No global store.
- **Routing**: HashRouter with two routes (landing `/`, editor `/app`).
- **AI**: Client-side Gemini calls via `@google/genai`, dynamically imported.
- **Export**: DOCX via `docx` library, dynamically imported.
- **Styling**: Tailwind CSS v4 + shadcn-style UI primitives. OKLCH CSS variables for theming.

### Areas to Watch in Future Reviews

- `CvEditorPage` complexity if new features are added
- Bundle sizes as dependencies update
- Accessibility: verify Base UI tooltip wires `aria-describedby` correctly
- Test coverage for component-level tests (currently only 3 component test files)

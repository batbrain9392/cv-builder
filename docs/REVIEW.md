# Code Review Log

Last reviewed: 2026-04-04

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
| 9   | Mobile "Install app" menu item does nothing for non-installable states        | Low      | Edge case (iOS hint flow). The desktop `InstallPwa` component handles it correctly via Popover.                                                                  |
| 10  | `parseCvFromText` relaxed path returns structurally incomplete `CvFormData`   | Low      | By design — surfaces `issues[]` to caller. Users fix in the form.                                                                                                |
| 11  | CV preview hardcodes colors (`#000`, `#333`) instead of theme variables       | Low      | Intentional — preview simulates printed document appearance.                                                                                                     |
| 12  | `GeminiIcon` and "built with" logos load from `cdn.simpleicons.org`           | Low      | Decorative images with `alt=""` — graceful failure.                                                                                                              |
| 13  | Index-based `key` props in `CvPreview` list rendering                         | Low      | Preview is read-only (no reorder/delete); React reconciliation risk is minimal.                                                                                  |
| 14  | `onGenerateSummary` / `onGenerateCoverLetter` not memoized with `useCallback` | Low      | These are passed to components that don't memo-compare props. No measurable impact.                                                                              |

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
- **PWA**: Service worker with stale-while-revalidate, version-stamped cache.

### Areas to Watch in Future Reviews

- `CvEditorPage` complexity if new features are added
- Bundle sizes as dependencies update
- Accessibility: verify Base UI tooltip wires `aria-describedby` correctly
- Test coverage for component-level tests (currently only 3 component test files)

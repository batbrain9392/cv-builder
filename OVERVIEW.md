# BioBot — Project Overview for AI Agents

> **Auto-generated** by `scripts/generate-overview.mjs` on 2026-04-04 (main@ffc2605).
> Re-run with `npm run generate:overview` after structural changes.

---

## What is this app?

BioBot is an **AI-powered CV and cover letter builder** that runs entirely in the browser. Users load their career data, paste a job description, let Google Gemini reshape their experience highlights and summary to match the role, then export a polished DOCX. There is **no backend** — all data stays in browser memory unless explicitly exported.

### Core product goals

- **ATS-friendly output** — DOCX uses clean, structured formatting that applicant tracking systems parse correctly.
- **Per-job tailoring** — load data once, paste a JD, generate AI suggestions, tweak, export. Repeat for each application.
- **Privacy-first, local-first** — no cookies, no server, no analytics. Gemini API calls go directly from the browser using the user's own API key.
- **Simple English, honest content** — no fake metrics, no company-specific acronyms in exported CVs.

---

## Tech stack

| Layer        | Technology                           | Version                    |
| ------------ | ------------------------------------ | -------------------------- |
| UI framework | React + TypeScript                   | ^19.0.0, TS ~5.7.2         |
| Build tool   | Vite                                 | ^6.0.7                     |
| Styling      | Tailwind CSS v4 + shadcn (base-nova) | ^4.2.2                     |
| Form state   | react-hook-form + Zod v4             | RHF ^7.72.0, Zod ^4.3.6    |
| Routing      | react-router (HashRouter)            | ^7.14.0                    |
| AI           | @google/genai (Gemini, client-side)  | ^1.48.0                    |
| DOCX export  | docx.js                              | ^9.6.1                     |
| Markdown     | marked                               | ^17.0.5                    |
| Icons        | lucide-react                         | ^1.7.0                     |
| Toasts       | sonner                               | ^2.0.7                     |
| Font         | Geist Variable                       | @fontsource-variable/geist |

### Dev tooling

| Tool                   | Purpose                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| ESLint 9 (flat config) | Linting with TS, React hooks, import sorting, a11y, **no type assertions** |
| Prettier               | Formatting (single quotes, trailing commas, 100 print width)               |
| Vitest                 | Unit tests (Node) + component tests (happy-dom + Testing Library)          |
| Playwright             | E2E tests (Chromium, against preview build)                                |
| Husky + lint-staged    | Pre-commit: ESLint --fix + Prettier on staged files                        |
| GitHub Actions         | CI: lint → typecheck → test → build → Playwright                           |

---

## Project structure

```
├── .cursor/
│   ├── rules/
│   │   └── theme.mdc
│   └── mcp.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── screenshot-desktop.png
│   ├── screenshot-form.png
│   └── screenshot-preview.png
├── e2e/
│   ├── fixtures/
│   │   └── test-cv.json
│   └── cv-editor.spec.ts
├── public/
│   ├── favicon-32.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.png
│   ├── manifest.json
│   ├── og-image.png
│   └── sw.js
├── scripts/
│   ├── generate-icons.mjs
│   ├── generate-og-image.mjs
│   └── generate-overview.mjs
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── field.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppLogo.tsx
│   │   ├── EmojiIcon.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GeminiIcon.tsx
│   │   ├── InstallPwa.tsx
│   │   ├── menuItemClass.ts
│   │   ├── RobotIcon.tsx
│   │   ├── ShareButton.tsx
│   │   └── ThemeToggle.tsx
│   ├── cv/
│   │   ├── ai/
│   │   │   ├── geminiHelpSteps.tsx
│   │   │   ├── generateWithAi.test.ts
│   │   │   ├── generateWithAi.ts
│   │   │   ├── parseCvFromText.test.ts
│   │   │   └── parseCvFromText.ts
│   │   ├── export/
│   │   │   ├── CvDocxDocument.ts
│   │   │   └── parseInlineSegments.test.ts
│   │   ├── form/
│   │   │   ├── AiSettingsFields.tsx
│   │   │   ├── BackupReminder.tsx
│   │   │   ├── CoverLetterFields.tsx
│   │   │   ├── DownloadDialog.tsx
│   │   │   ├── EducationFields.tsx
│   │   │   ├── ExperienceEntryFields.tsx
│   │   │   ├── FormActions.tsx
│   │   │   ├── HighlightsAiEnhance.tsx
│   │   │   ├── HighlightsInput.test.tsx
│   │   │   ├── HighlightsInput.tsx
│   │   │   ├── ImportDialog.test.tsx
│   │   │   ├── ImportDialog.tsx
│   │   │   ├── JobDescriptionFields.tsx
│   │   │   ├── MarkdownHint.tsx
│   │   │   ├── PersonalInfoFields.tsx
│   │   │   ├── SectionToolbar.tsx
│   │   │   ├── TagsInput.test.tsx
│   │   │   └── TagsInput.tsx
│   │   ├── preview/
│   │   │   ├── CvPreview.css
│   │   │   ├── CvPreview.tsx
│   │   │   ├── CvPreviewPanel.tsx
│   │   │   ├── Markdown.tsx
│   │   │   ├── parseMarkdown.test.ts
│   │   │   └── parseMarkdown.ts
│   │   ├── cvConstants.ts
│   │   ├── cvFormatters.test.ts
│   │   ├── cvFormatters.ts
│   │   ├── cvFormSchema.test.ts
│   │   ├── cvFormSchema.ts
│   │   ├── downloadBlob.ts
│   │   ├── loadDefaultValues.test.ts
│   │   ├── loadDefaultValues.ts
│   │   ├── starterCv.json
│   │   ├── useAiGeneration.ts
│   │   └── useCvExport.ts
│   ├── lib/
│   │   ├── pwa.ts
│   │   ├── share.ts
│   │   ├── useInstallPwa.ts
│   │   ├── useIsInView.ts
│   │   ├── useIsKeyboardOpen.ts
│   │   ├── useIsScrolledPast.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useTheme.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── CvEditorPage.tsx
│   │   └── LandingPage.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── test-setup.ts
│   └── vite-env.d.ts
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierrc
├── components.json
├── eslint.config.js
├── index.html
├── OVERVIEW.md
├── package-lock.json
├── package.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

### Source files (65 source, 10 test, 1 e2e)

#### `src/` layout

| Directory            | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `src/components/`    | Shared app-shell components (AppHeader, ErrorBoundary, icons, PWA, theme, share)    |
| `src/components/ui/` | shadcn-style primitives (button, card, field, input, textarea, etc.)                |
| `src/cv/`            | CV domain: schema, hooks, constants, formatters, export logic                       |
| `src/cv/form/`       | Form section components (PersonalInfo, Experience, Education, AI settings, dialogs) |
| `src/cv/preview/`    | Live preview panel, markdown rendering, preview CSS                                 |
| `src/cv/ai/`         | AI generation helpers (Gemini calls, CV text parsing)                               |
| `src/cv/export/`     | DOCX document builder                                                               |
| `src/lib/`           | Utilities, custom hooks (theme, PWA install, media queries, viewport)               |
| `src/pages/`         | Route-level page components (LandingPage, CvEditorPage)                             |

#### Key entry points

| File                          | Role                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| `src/main.tsx`                | App bootstrap: HashRouter, loadDefaultValues(), service worker registration |
| `src/App.tsx`                 | Route definitions (landing page + editor)                                   |
| `src/pages/CvEditorPage.tsx`  | Main CV editor UI (form, preview, dialogs, AI wiring)                       |
| `src/index.css`               | Global Tailwind imports, CSS variables, theme tokens (OKLCH)                |
| `src/cv/cvFormSchema.ts`      | Zod schema and TypeScript types for the entire CV form                      |
| `src/cv/loadDefaultValues.ts` | Merges starter data with schema defaults                                    |

---

## Architecture and patterns

### Routing

- **HashRouter** — serves from GitHub Pages subpath (`/cv-builder/`), so URLs look like `/#/app`.
- **Routes:**
  - `/` → `LandingPage` (lazy-loaded, marketing/info page)
  - `/app` → `CvEditorPage` (the full editor with form + live preview)

### State management

- **No global state library.** No Redux, Zustand, or Context-based stores.
- **react-hook-form** owns the entire CV form state (useForm, useFieldArray, useWatch, zodResolver).
- **Local state** via `useState` / `useRef` / `useCallback` for UI concerns (dialogs, preview toggle, collapsibles).
- **Custom hooks** encapsulate side effects: `useAiGeneration`, `useCvExport`, `useTheme`, `useInstallPwa`.
- **Persistence:** CV data lives in memory only. Theme preference persists in `localStorage` (`"theme"` key). Nothing else is stored.

### Styling

- **Utility-first** with Tailwind CSS v4 (via `@tailwindcss/vite` plugin).
- **shadcn base-nova** style for UI primitives, with OKLCH CSS variables for theming.
- **Always use CSS variables** for handling light/dark theme related styles everywhere. No handcoding colors or manual class toggles.
- **Colocated CSS** only where Tailwind is insufficient (e.g. `CvPreview.css` for print-specific layout).
- **No CSS Modules** in the broader app.
- **Dark mode** via `.dark` class on `<html>`, toggled by `useTheme` hook.

### Data flow

1. `loadDefaultValues()` merges AI field defaults with `starterCv.json`, validates with `cvFormSchema`.
2. `App` passes defaults to `CvEditorPage`, which owns the form via `useForm<CvFormData>`.
3. `CvPreviewPanel` uses `useWatch` to reactively render the live preview from form state.
4. AI generation and export are handled by `useAiGeneration` and `useCvExport` hooks.

### Import path alias

All source uses `@/` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

---

## Strict rules and coding philosophy

These rules are non-negotiable. Violating them will be flagged during review.

### TypeScript strictness

- **`strict: true`** in tsconfig with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- **No type assertions.** ESLint enforces `@typescript-eslint/consistent-type-assertions: ["error", { assertionStyle: "never" }]`. No `as X`, no `<X>` casts, no `@ts-ignore`, no `eslint-disable`. If the types don't work, fix the types.
- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports.

### Code quality

- **No forced casting or suppression.** Prefer `as const`, `satisfies`, or proper typing over `as` hacks.
- **Imports sorted** by `perfectionist/sort-imports` (natural, ascending). This is enforced by ESLint.
- **Prettier enforced** on every commit via lint-staged: single quotes, trailing commas, 100 char print width.
- **a11y** is linted as warnings via `eslint-plugin-jsx-a11y` on all `.tsx` files.

### File naming

- **PascalCase** for component files, matching the exported component name: `AppHeader.tsx` exports `AppHeader`.
- **camelCase** for non-component files: `useTheme.ts`, `cvFormSchema.ts`, `loadDefaultValues.ts`.
- **No `index.tsx`** barrel files. Every file has a descriptive name.
- **One CSS file per component** when CSS is needed, filename matches component: `CvPreview.css` for `CvPreview.tsx`.
- **Colocate by feature**, not by type. CV form components live in `src/cv/form/`, not a generic `src/components/forms/`.

### Component design

- **Extract components as dumb as possible** — UI-only, receive data via props, no internal data fetching.
- **Avoid unnecessary abstractions.** Don't create a wrapper unless it provides clear value.
- **Minimal diff on refactors.** Preserve existing code structure, comments, and sequence. Keep changes reviewable.
- **Do not remove comments** during refactoring without asking. Comments provide context that may not be obvious.

### Testing philosophy

- **Meaningful coverage, not coverage for its own sake.** Every test should justify its existence.
- **Unit tests** (`*.test.ts`, Node/Vitest) for pure logic: schema validation, formatters, parsers, AI helpers.
- **Component tests** (`*.test.tsx`, happy-dom + Testing Library) for interactive UI behavior.
- **E2E tests** (Playwright) for critical user flows: form editing, import/export, navigation.
- **No low-value tests.** Don't test that React renders a div.

### UI/UX principles

- **Uniform spacing and typography.** Consistent gaps, margins, paddings, font sizes across editor, landing page, mobile, and desktop.
- **Semantic HTML.** Use proper heading hierarchy, landmarks (`<main>`, `<aside>`, `<nav>`), ARIA labels on icon buttons.
- **Bold for impact only.** Don't overdo bold text, but don't strip it entirely — use it where it guides the eye.
- **Clear labels.** "Load data" not "Import", "Download" not ambiguous verbs. Every action label should be self-explanatory.
- **Mobile-first responsive.** Editor and preview panels swap on mobile (toggle via FAB), side-by-side on desktop.

### Dependencies

- **Minimize dependencies.** Don't add a library for something that can be done in a few lines.
- **No backend.** Everything runs client-side. Gemini API calls go directly from the browser.
- **No cookies, no analytics, no tracking.** The only `localStorage` usage is theme preference.

### Git and CI

- **Pre-commit hook** runs lint-staged (ESLint --fix + Prettier) on all staged `.ts` / `.tsx` files.
- **CI pipeline** (GitHub Actions): `npm ci` → `lint` → `typecheck` → `test` → `build` → Playwright e2e.
- **All checks must pass** before merge. No skipping CI.
- **Build command** includes `tsc --noEmit` — type errors break the build.

---

## Configuration reference

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "resolveJsonModule": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

### Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

### shadcn (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

### Vite

- Base path: `/cv-builder/` (GitHub Pages subpath)
- Plugins: `@tailwindcss/vite`, `@vitejs/plugin-react`, custom `stampServiceWorker` (injects git SHA into `sw.js`)
- Alias: `@` → `./src`

### ESLint highlights

- Flat config (ESLint 9), no `.eslintrc`.
- `@typescript-eslint/consistent-type-assertions: ["error", { assertionStyle: "never" }]` — **zero tolerance for type assertions**.
- `perfectionist/sort-imports` — natural ascending order.
- `jsx-a11y` rules as warnings on all `.tsx` files.
- Ignores: `dist`, `node_modules`, `coverage`, `scripts`.

---

## NPM scripts

| Script              | Command                              | Purpose                          |
| ------------------- | ------------------------------------ | -------------------------------- |
| `dev`               | `vite`                               | Local dev server                 |
| `build`             | `tsc --noEmit && vite build`         | Type-check + production build    |
| `preview`           | `vite preview`                       | Serve production build locally   |
| `lint`              | `eslint .`                           | Run ESLint                       |
| `typecheck`         | `tsc --noEmit`                       | TypeScript compiler checks       |
| `test`              | `vitest run`                         | Run unit + component tests       |
| `test:e2e`          | `playwright test`                    | Run Playwright e2e tests         |
| `generate:icons`    | `node scripts/generate-icons.mjs`    | Regenerate PWA icons and favicon |
| `generate:og`       | `node scripts/generate-og-image.mjs` | Regenerate OG image              |
| `generate:overview` | `node scripts/generate-overview.mjs` | Regenerate this document         |

---

## Visual assets and regeneration

The app has several generated image assets that depend on branding or UI. When the logo, color palette, or main editor UI changes, the related assets must be regenerated. AI agents should flag this automatically when relevant source files are modified.

### Logo / icon

The app logo is a document-robot SVG defined inline in `src/components/RobotIcon.tsx`. The PWA/favicon icons are **canvas-drawn replicas** of the same design in `scripts/generate-icons.mjs`.

| Asset                    | Generated by             | Output path(s)                 | Consumed in                                                     |
| ------------------------ | ------------------------ | ------------------------------ | --------------------------------------------------------------- |
| `RobotIcon` (inline SVG) | Hand-coded component     | `src/components/RobotIcon.tsx` | `AppLogo.tsx`, `LandingPage.tsx`                                |
| `favicon-32.png`         | `npm run generate:icons` | `public/favicon-32.png`        | `index.html` (`<link rel="icon">`)                              |
| `icon-192.png`           | `npm run generate:icons` | `public/icon-192.png`          | `index.html` (`<link rel="apple-touch-icon">`), `manifest.json` |
| `icon-512.png`           | `npm run generate:icons` | `public/icon-512.png`          | `manifest.json`                                                 |
| `icon-maskable.png`      | `npm run generate:icons` | `public/icon-maskable.png`     | `manifest.json`                                                 |

**If you change `RobotIcon.tsx`:** you must also update the canvas replica in `scripts/generate-icons.mjs` and re-run `npm run generate:icons` to keep favicons in sync.

### OG image (social sharing)

| Asset          | Generated by          | Output path           | Consumed in                                                                |
| -------------- | --------------------- | --------------------- | -------------------------------------------------------------------------- |
| `og-image.png` | `npm run generate:og` | `public/og-image.png` | `index.html` (`<meta property="og:image">`, `<meta name="twitter:image">`) |

The OG image is a 1200×630 composite built by `scripts/generate-og-image.mjs`. It launches a Playwright browser against the built app, takes screenshots of the editor form + preview, and composites them onto a branded canvas using the app's light-mode palette (`#ffffff`, `#557c62`, etc.) and Geist font.

**If you change:** the color palette (`src/index.css` theme tokens), the editor layout (`CvEditorPage.tsx`), or the preview styling (`CvPreview.css`) — re-run `npm run generate:og` to update the social image.

### External avatar

`LandingPage.tsx` loads the developer's GitHub avatar from `https://github.com/batbrain9392.png`. This is not a generated asset — it's fetched at runtime.

### Regeneration cheat sheet

| Trigger                          | Command                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| Logo/icon design changed         | Update `RobotIcon.tsx` + `scripts/generate-icons.mjs`, then `npm run generate:icons` |
| Color palette or theme changed   | `npm run generate:icons` + `npm run generate:og`                                     |
| Editor/preview UI layout changed | `npm run generate:og`                                                                |
| Project structure changed        | `npm run generate:overview`                                                          |

---

## File inventory

### Source files (65)

- `src/components/menuItemClass.ts` (3 lines)
- `src/cv/ai/generateWithAi.ts` (168 lines)
- `src/cv/ai/parseCvFromText.ts` (209 lines)
- `src/cv/cvConstants.ts` (70 lines)
- `src/cv/cvFormSchema.ts` (67 lines)
- `src/cv/cvFormatters.ts` (22 lines)
- `src/cv/downloadBlob.ts` (9 lines)
- `src/cv/export/CvDocxDocument.ts` (347 lines)
- `src/cv/loadDefaultValues.ts` (70 lines)
- `src/cv/preview/parseMarkdown.ts` (34 lines)
- `src/cv/useAiGeneration.ts` (214 lines)
- `src/cv/useCvExport.ts` (99 lines)
- `src/lib/pwa.ts` (5 lines)
- `src/lib/share.ts` (22 lines)
- `src/lib/useInstallPwa.ts` (74 lines)
- `src/lib/useIsInView.ts` (24 lines)
- `src/lib/useIsKeyboardOpen.ts` (45 lines)
- `src/lib/useIsScrolledPast.ts` (13 lines)
- `src/lib/useMediaQuery.ts` (17 lines)
- `src/lib/useTheme.ts` (29 lines)
- `src/lib/utils.ts` (7 lines)
- `src/test-setup.ts` (2 lines)
- `src/vite-env.d.ts` (10 lines)
- `src/App.tsx` (31 lines)
- `src/components/AppHeader.tsx` (97 lines)
- `src/components/AppLogo.tsx` (13 lines)
- `src/components/EmojiIcon.tsx` (13 lines)
- `src/components/ErrorBoundary.tsx` (33 lines)
- `src/components/GeminiIcon.tsx` (18 lines)
- `src/components/InstallPwa.tsx` (116 lines)
- `src/components/RobotIcon.tsx` (81 lines)
- `src/components/ShareButton.tsx` (23 lines)
- `src/components/ThemeToggle.tsx` (25 lines)
- `src/components/ui/badge.tsx` (50 lines)
- `src/components/ui/button.tsx` (62 lines)
- `src/components/ui/card.tsx` (64 lines)
- `src/components/ui/collapsible.tsx` (16 lines)
- `src/components/ui/field.tsx` (112 lines)
- `src/components/ui/input.tsx` (22 lines)
- `src/components/ui/label.tsx` (20 lines)
- `src/components/ui/sonner.tsx` (42 lines)
- `src/components/ui/textarea.tsx` (19 lines)
- `src/components/ui/tooltip.tsx` (24 lines)
- `src/cv/ai/geminiHelpSteps.tsx` (62 lines)
- `src/cv/form/AiSettingsFields.tsx` (93 lines)
- `src/cv/form/BackupReminder.tsx` (26 lines)
- `src/cv/form/CoverLetterFields.tsx` (216 lines)
- `src/cv/form/DownloadDialog.tsx` (84 lines)
- `src/cv/form/EducationFields.tsx` (270 lines)
- `src/cv/form/ExperienceEntryFields.tsx` (263 lines)
- `src/cv/form/FormActions.tsx` (28 lines)
- `src/cv/form/HighlightsAiEnhance.tsx` (143 lines)
- `src/cv/form/HighlightsInput.tsx` (55 lines)
- `src/cv/form/ImportDialog.tsx` (382 lines)
- `src/cv/form/JobDescriptionFields.tsx` (78 lines)
- `src/cv/form/MarkdownHint.tsx` (18 lines)
- `src/cv/form/PersonalInfoFields.tsx` (153 lines)
- `src/cv/form/SectionToolbar.tsx` (69 lines)
- `src/cv/form/TagsInput.tsx` (94 lines)
- `src/cv/preview/CvPreview.tsx` (158 lines)
- `src/cv/preview/CvPreviewPanel.tsx` (79 lines)
- `src/cv/preview/Markdown.tsx` (21 lines)
- `src/main.tsx` (57 lines)
- `src/pages/CvEditorPage.tsx` (678 lines)
- `src/pages/LandingPage.tsx` (846 lines)

### Test files (10)

- `src/cv/ai/generateWithAi.test.ts` (199 lines)
- `src/cv/ai/parseCvFromText.test.ts` (133 lines)
- `src/cv/cvFormSchema.test.ts` (183 lines)
- `src/cv/cvFormatters.test.ts` (64 lines)
- `src/cv/export/parseInlineSegments.test.ts` (50 lines)
- `src/cv/loadDefaultValues.test.ts` (60 lines)
- `src/cv/preview/parseMarkdown.test.ts` (76 lines)
- `src/cv/form/HighlightsInput.test.tsx` (65 lines)
- `src/cv/form/ImportDialog.test.tsx` (146 lines)
- `src/cv/form/TagsInput.test.tsx` (98 lines)

### E2E files (1)

- `e2e/cv-editor.spec.ts` (83 lines)

---

## Dependencies

### Runtime (19)

- `@base-ui/react`: ^1.3.0
- `@fontsource-variable/geist`: ^5.2.8
- `@google/genai`: ^1.48.0
- `@hookform/resolvers`: ^5.2.2
- `@tailwindcss/vite`: ^4.2.2
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `docx`: ^9.6.1
- `lucide-react`: ^1.7.0
- `marked`: ^17.0.5
- `react`: ^19.0.0
- `react-dom`: ^19.0.0
- `react-hook-form`: ^7.72.0
- `react-router`: ^7.14.0
- `sonner`: ^2.0.7
- `tailwind-merge`: ^3.5.0
- `tailwindcss`: ^4.2.2
- `tw-animate-css`: ^1.4.0
- `zod`: ^4.3.6

### Dev (24)

- `@eslint/js`: ^9.18.0
- `@playwright/test`: ^1.59.1
- `@testing-library/jest-dom`: ^6.9.1
- `@testing-library/react`: ^16.3.2
- `@testing-library/user-event`: ^14.6.1
- `@types/node`: ^22.10.5
- `@types/react`: ^19.0.2
- `@types/react-dom`: ^19.0.2
- `@vitejs/plugin-react`: ^4.3.4
- `eslint`: ^9.18.0
- `eslint-plugin-jsx-a11y`: ^6.10.2
- `eslint-plugin-perfectionist`: ^5.8.0
- `eslint-plugin-react-hooks`: ^5.1.0
- `eslint-plugin-react-refresh`: ^0.4.16
- `globals`: ^15.14.0
- `happy-dom`: ^20.8.9
- `husky`: ^9.1.7
- `lint-staged`: ^16.4.0
- `prettier`: ^3.8.1
- `shadcn`: ^4.1.2
- `typescript`: ~5.7.2
- `typescript-eslint`: ^8.20.0
- `vite`: ^6.0.7
- `vitest`: ^3.0.5

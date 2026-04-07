/**
 * Generates OVERVIEW.md — a machine-readable project overview for AI coding agents.
 *
 * Run: npm run generate:overview
 *
 * The output is deterministic: same repo state → same output.
 * Re-run whenever the project structure, dependencies, or conventions change.
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (rel) => readFileSync(path.resolve(ROOT, rel), 'utf-8');
const jsonRead = (rel) => JSON.parse(read(rel));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tree(dir, prefix = '', depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return '';
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter(
      (e) =>
        !['node_modules', 'dist', '.git', 'coverage', '.husky', 'data', 'test-results'].includes(
          e.name,
        ) && !e.name.startsWith('.DS_Store'),
    )
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  let out = '';
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out += `${prefix}${connector}${entry.name}/\n`;
      out += tree(full, prefix + childPrefix, depth + 1, maxDepth);
    } else {
      out += `${prefix}${connector}${entry.name}\n`;
    }
  });
  return out;
}

function collectFiles(dir, ext, result = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
      collectFiles(full, ext, result);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      result.push(path.relative(ROOT, full));
    }
  }
  return result.sort();
}

function countLines(relPath) {
  try {
    return read(relPath).split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Renders a Markdown table with columns padded to equal width.
 * @param {string[]} headers
 * @param {string[][]} rows - each row is an array of cell strings
 */
function markdownTable(headers, rows) {
  const cols = headers.length;
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
  );
  const pad = (str, w) => str + ' '.repeat(w - str.length);
  const line = (cells) =>
    '| ' + cells.map((c, i) => pad(c, widths[i])).join(' | ') + ' |';
  const sep =
    '| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |';
  return [line(headers), sep, ...rows.map((r) => line(r))].join('\n');
}

function gitInfo() {
  try {
    const branch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf-8' }).trim();
    const sha = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
    return { branch, sha };
  } catch {
    return { branch: 'unknown', sha: 'unknown' };
  }
}

// ---------------------------------------------------------------------------
// Data collection
// ---------------------------------------------------------------------------

const pkg = jsonRead('package.json');
const tsconfig = jsonRead('tsconfig.json');
const prettierrc = jsonRead('.prettierrc');
const componentsJson = jsonRead('components.json');

const srcTs = collectFiles(path.join(ROOT, 'src'), '.ts');
const srcTsx = collectFiles(path.join(ROOT, 'src'), '.tsx');
const allSrc = [...srcTs, ...srcTsx];
const testFiles = allSrc.filter((f) => f.includes('.test.'));
const sourceFiles = allSrc.filter((f) => !f.includes('.test.'));
const e2eFiles = collectFiles(path.join(ROOT, 'e2e'), '.ts');

const eslintConfig = read('eslint.config.js');
const git = gitInfo();
const generatedAt = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Compose document
// ---------------------------------------------------------------------------

const doc = `# BioBot — Project Overview for AI Agents

> **Auto-generated** by \`scripts/generate-overview.mjs\` on ${generatedAt} (${git.branch}@${git.sha}).
> Re-run with \`npm run generate:overview\` after structural changes.

---

## What is this app?

BioBot is an **AI-powered CV and cover letter builder** that runs entirely in the browser. Users load their career data, paste a job description, let Google Gemini reshape their experience highlights and summary to match the role, then export a polished DOCX. There is **no backend** — all data stays in browser memory unless explicitly exported.

### Core product goals

- **ATS-compatible output is the #1 priority** — every feature, AI prompt, and export format must preserve clean, structured, plain-text formatting that applicant tracking systems parse correctly. Nothing in the app should alter the CV's structure, reorder sections, or inject content unless the user explicitly requests and confirms it.
- **Per-job tailoring** — load data once, paste a JD, generate AI suggestions, tweak, export. Repeat for each application.
- **Privacy-first, local-first** — no app backend for CV data; no ad/marketing cookies. Optional Gemini from the browser with the user's API key; production Sentry for scrubbed errors/traces (no Session Replay).
- **Simple English, honest content** — no fake metrics, no company-specific acronyms in exported CVs. AI must not invent claims or data not present in the source.

---

## Tech stack

${markdownTable(
  ['Layer', 'Technology', 'Version'],
  [
    ['UI framework', 'React + TypeScript', `${pkg.dependencies.react}, TS ${pkg.devDependencies.typescript}`],
    ['Build tool', 'Vite', `${pkg.dependencies.vite || pkg.devDependencies.vite}`],
    ['Styling', 'Tailwind CSS v4 + shadcn (base-nova)', `${pkg.dependencies.tailwindcss}`],
    ['Form state', 'react-hook-form + Zod v4', `RHF ${pkg.dependencies['react-hook-form']}, Zod ${pkg.dependencies.zod}`],
    ['Routing', 'react-router (BrowserRouter, basename /cv-builder)', `${pkg.dependencies['react-router']}`],
    ['AI', '@google/genai (Gemini, client-side)', `${pkg.dependencies['@google/genai']}`],
    ['DOCX export', 'docx.js', `${pkg.dependencies.docx}`],
    ['DOCX import', 'mammoth', `${pkg.dependencies.mammoth}`],
    ['Markdown', 'marked', `${pkg.dependencies.marked}`],
    ['Icons', 'lucide-react', `${pkg.dependencies['lucide-react']}`],
    ['Toasts', 'sonner', `${pkg.dependencies.sonner}`],
    ['Error monitoring', '@sentry/react', `${pkg.dependencies['@sentry/react']}`],
    ['Font', 'Geist Variable', '@fontsource-variable/geist'],
  ],
)}

### Dev tooling

${markdownTable(
  ['Tool', 'Purpose'],
  [
    ['ESLint 9 (flat config)', 'Linting with TS, React hooks, import sorting, a11y, **no type assertions**'],
    ['Prettier', 'Formatting (single quotes, trailing commas, 100 print width)'],
    ['Vitest', 'Unit tests (Node) + component tests (happy-dom + Testing Library)'],
    ['Playwright', 'E2E tests (Chromium, against preview build)'],
    ['Husky + lint-staged', 'Pre-commit: ESLint --fix + Prettier on staged files'],
    ['GitHub Actions', 'CI: lint → typecheck → test → build → Playwright'],
  ],
)}

---

## Project structure

\`\`\`
${tree(ROOT).trimEnd()}
\`\`\`

### Source files (${sourceFiles.length} source, ${testFiles.length} test, ${e2eFiles.length} e2e)

#### \`src/\` layout

${markdownTable(
  ['Directory', 'Purpose'],
  [
    ['\`src/components/\`', 'Shared app-shell components (AppHeader, ErrorBoundary, icons, theme, share)'],
    ['\`src/components/ui/\`', 'shadcn-style primitives (button, card, field, input, textarea, etc.)'],
    ['\`src/cv/\`', 'CV domain: schema, hooks, constants, formatters, export logic'],
    ['\`src/cv/form/\`', 'Form section components (PersonalInfo, Experience, Education, AI settings, dialogs)'],
    ['\`src/cv/preview/\`', 'Live preview panel, markdown rendering, preview CSS'],
    ['\`src/cv/ai/\`', 'AI generation helpers (Gemini calls, CV text parsing)'],
    ['\`src/cv/export/\`', 'DOCX document builder'],
    ['\`src/guide/\`', 'User guide UI components (path picker, phases, sections, TOC)'],
    ['\`src/lib/\`', 'Utilities, custom hooks (theme, media queries, viewport)'],
    ['\`src/pages/\`', 'Route-level page components (LandingPage, GuidePage, CvEditorPage)'],
  ],
)}

#### Key entry points

${markdownTable(
  ['File', 'Role'],
  [
    ['\`src/main.tsx\`', 'App bootstrap: BrowserRouter (basename /cv-builder), hydrateRoot when #root is prerendered else createRoot, loadDefaultValues(), analytics (env-gated), legacy service worker cleanup in production'],
    ['\`src/prerender.tsx\`', 'Build-time prerender entry: renders / and /guide to static HTML via renderToString (used by scripts/prerender.ts)'],
    ['\`src/App.tsx\`', 'Route definitions (landing, guide, and editor)'],
    ['\`src/pages/CvEditorPage.tsx\`', 'Main CV editor UI (form, preview, dialogs, AI wiring)'],
    ['\`src/pages/GuidePage.tsx\`', 'Step-by-step user guide with collapsible phases and TOC'],
    ['\`src/index.css\`', 'Global Tailwind imports, CSS variables, theme tokens (OKLCH)'],
    ['\`src/cv/cvFormSchema.ts\`', 'Zod schema and TypeScript types for the entire CV form'],
    ['\`src/cv/loadDefaultValues.ts\`', 'Merges starter data with schema defaults'],
  ],
)}

---

## Architecture and patterns

### Routing

- **BrowserRouter** — \`basename="/cv-builder"\`. Routes: \`/\` (landing), \`/guide\`, \`/app\`. \`scripts/copy-github-pages-404.ts\` writes \`dist/404.html\` with the same assets as \`index.html\` but an **empty** \`#root\` (so \`/app\` deep links do not ship prerendered landing markup). See \`docs/github-pages-spa-routing.md\`.
- **Build-time prerender** — \`scripts/prerender.ts\` injects \`/\` and \`/guide\` HTML via \`replaceRootInner\` (\`scripts/html-root.ts\`). SSR bundle: \`vite build --ssr\` + \`vite.config.ssr.ts\`, then deleted. \`dist/guide/index.html\` gets guide-specific \`<head>\` patches (canonical, OG, Twitter, meta description).
- **Routes:**
  - \`/\` → \`LandingPage\` (lazy-loaded, marketing/info page)
  - \`/guide\` → \`GuidePage\` (lazy-loaded, step-by-step user guide)
  - \`/app\` → \`CvEditorPage\` (the full editor with form + live preview)

### State management

- **No global state library.** No Redux, Zustand, or Context-based stores.
- **react-hook-form** owns the entire CV form state (useForm, useFieldArray, useWatch, zodResolver).
- **Local state** via \`useState\` / \`useRef\` / \`useCallback\` for UI concerns (dialogs, preview toggle, collapsibles).
- **Custom hooks** encapsulate side effects: \`useAiGeneration\`, \`useCvExport\`, \`useTheme\`.
- **Persistence:** CV data, Gemini API key, and theme preference persist in \`localStorage\` (via \`src/lib/cvStorage.ts\` and \`useTheme\`). Not uploaded to an app server; optional Gemini to Google; production Sentry receives scrubbed errors/traces.

### Styling

- **Utility-first** with Tailwind CSS v4 (via \`@tailwindcss/vite\` plugin).
- **shadcn base-nova** style for UI primitives, with OKLCH CSS variables for theming.
- **Always use CSS variables** for handling light/dark theme related styles everywhere. No handcoding colors or manual class toggles.
- **Colocated CSS** only where Tailwind is insufficient (e.g. \`CvPreview.css\` for print-specific layout).
- **No CSS Modules** in the broader app.
- **Dark mode** via \`.dark\` class on \`<html>\`, toggled by \`useTheme\` hook.

### Data flow

1. \`loadDefaultValues()\` merges AI field defaults with \`starterCv.json\`, validates with \`cvFormSchema\`.
2. \`App\` passes defaults to \`CvEditorPage\`, which owns the form via \`useForm<CvFormData>\`.
3. \`CvPreviewPanel\` uses \`useWatch\` to reactively render the live preview from form state.
4. AI generation and export are handled by \`useAiGeneration\` and \`useCvExport\` hooks.

### Import path alias

All source uses \`@/\` → \`src/\` (configured in both \`tsconfig.json\` and \`vite.config.ts\`).

---

## Strict rules and coding philosophy

These rules are non-negotiable. Violating them will be flagged during review.

### TypeScript strictness

- **\`strict: true\`** in tsconfig with \`noUnusedLocals\`, \`noUnusedParameters\`, \`noFallthroughCasesInSwitch\`.
- **No type assertions.** ESLint enforces \`@typescript-eslint/consistent-type-assertions: ["error", { assertionStyle: "never" }]\`. No \`as X\`, no \`<X>\` casts, no \`@ts-ignore\`, no \`eslint-disable\`. If the types don't work, fix the types.
- **\`verbatimModuleSyntax: true\`** — use \`import type\` for type-only imports.

### Code quality

- **No forced casting or suppression.** Prefer \`as const\`, \`satisfies\`, or proper typing over \`as\` hacks.
- **Imports sorted** by \`perfectionist/sort-imports\` (natural, ascending). This is enforced by ESLint.
- **Prettier enforced** on every commit via lint-staged: single quotes, trailing commas, 100 char print width.
- **a11y** is linted as warnings via \`eslint-plugin-jsx-a11y\` on all \`.tsx\` files.

### File naming

- **PascalCase** for component files, matching the exported component name: \`AppHeader.tsx\` exports \`AppHeader\`.
- **camelCase** for non-component files: \`useTheme.ts\`, \`cvFormSchema.ts\`, \`loadDefaultValues.ts\`.
- **No \`index.tsx\`** barrel files. Every file has a descriptive name.
- **One CSS file per component** when CSS is needed, filename matches component: \`CvPreview.css\` for \`CvPreview.tsx\`.
- **Colocate by feature**, not by type. CV form components live in \`src/cv/form/\`, not a generic \`src/components/forms/\`.

### Component design

- **Extract components as dumb as possible** — UI-only, receive data via props, no internal data fetching.
- **Avoid unnecessary abstractions.** Don't create a wrapper unless it provides clear value.
- **Minimal diff on refactors.** Preserve existing code structure, comments, and sequence. Keep changes reviewable.
- **Do not remove comments** during refactoring without asking. Comments provide context that may not be obvious.

### Testing philosophy

- **Meaningful coverage, not coverage for its own sake.** Every test should justify its existence.
- **Unit tests** (\`*.test.ts\`, Node/Vitest) for pure logic: schema validation, formatters, parsers, AI helpers.
- **Component tests** (\`*.test.tsx\`, happy-dom + Testing Library) for interactive UI behavior.
- **E2E tests** (Playwright) for critical user flows: form editing, import/export, navigation.
- **No low-value tests.** Don't test that React renders a div.

### UI/UX principles

- **Uniform spacing and typography.** Consistent gaps, margins, paddings, font sizes across editor, landing page, mobile, and desktop.
- **Semantic HTML.** Use proper heading hierarchy, landmarks (\`<main>\`, \`<aside>\`, \`<nav>\`), ARIA labels on icon buttons.
- **Bold for impact only.** Don't overdo bold text, but don't strip it entirely — use it where it guides the eye.
- **Clear labels.** "Load data" not "Import", "Download" not ambiguous verbs. Every action label should be self-explanatory.
- **Mobile-first responsive.** Editor and preview panels swap on mobile (toggle via FAB), side-by-side on desktop.

### AI guardrails

- **ATS compatibility is paramount.** All AI-generated content (summaries, highlights, cover letters) must produce plain-text output that ATS systems can parse. No tables, columns, icons, graphics, or exotic formatting.
- **Reverse chronological order.** Items within each section (experience, education, others) must default to most-recent-first ordering. AI-parsed imports and generated output must respect this. The user can manually reorder in the form.
- **No unsolicited CV modifications.** AI must not restructure, reorder, add, or remove CV sections unless the user explicitly requests and confirms the change. The AI improves wording within the existing structure — it does not redesign the CV.
- **No fabrication.** AI must not invent metrics, claims, company-specific acronyms, or information absent from the user's source data.
- **User confirmation required for destructive changes.** Any operation that would overwrite or delete user-entered CV content must require explicit confirmation before proceeding.
- **Prompts are transparent and editable.** Default prompts live in \`cvFormSchema.ts\` and are visible/editable in the UI. System-level ATS constraints are enforced in \`generateWithAi.ts\` regardless of what the user puts in the prompt field.

### Dependencies

- **Minimize dependencies.** Don't add a library for something that can be done in a few lines.
- **No backend.** Everything runs client-side. Gemini API calls go directly from the browser.
- **No ad cookies or marketing cookies.** \`localStorage\` stores CV data, Gemini API key, and theme preference locally. Production builds may include **Cloudflare Web Analytics** (cookieless aggregate traffic) when \`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN\` is set in CI; otherwise \`VITE_ANALYTICS_SCRIPT_URL\` (e.g. Plausible-style) if used. Production Sentry is error/performance monitoring only (scrubbed, no Session Replay).

### Git and CI

- **Pre-commit hook** runs lint-staged (ESLint --fix + Prettier) on all staged \`.ts\` / \`.tsx\` files.
- **CI pipeline** (GitHub Actions): \`npm ci\` → \`lint\` → \`typecheck\` → \`test\` → \`build\` → Playwright e2e.
- **All checks must pass** before merge. No skipping CI.
- **Build command** includes \`tsc --noEmit\` — type errors break the build.

---

## Configuration reference

### TypeScript (\`tsconfig.json\`)

\`\`\`json
${JSON.stringify(tsconfig, null, 2)}
\`\`\`

### Prettier (\`.prettierrc\`)

\`\`\`json
${JSON.stringify(prettierrc, null, 2)}
\`\`\`

### shadcn (\`components.json\`)

\`\`\`json
${JSON.stringify(componentsJson, null, 2)}
\`\`\`

### Vite

- Base path: \`/cv-builder/\` (GitHub Pages subpath)
- Plugins: \`@tailwindcss/vite\`, \`@vitejs/plugin-react\`, \`@sentry/vite-plugin\` (when \`SENTRY_AUTH_TOKEN\` is set)
- Alias: \`@\` → \`./src\`

### ESLint highlights

- Flat config (ESLint 9), no \`.eslintrc\`.
- \`@typescript-eslint/consistent-type-assertions: ["error", { assertionStyle: "never" }]\` — **zero tolerance for type assertions**.
- \`perfectionist/sort-imports\` — natural ascending order.
- \`jsx-a11y\` rules as warnings on all \`.tsx\` files.
- Ignores: \`dist\`, \`node_modules\`, \`coverage\`, \`scripts\`.

---

## NPM scripts

${markdownTable(
  ['Script', 'Command', 'Purpose'],
  [
    ['\`dev\`', '\`vite\`', 'Local dev server'],
    ['\`build\`', '\`tsc --noEmit && vite build\`', 'Type-check + production build'],
    ['\`preview\`', '\`vite preview\`', 'Serve production build locally'],
    ['\`lint\`', '\`eslint .\`', 'Run ESLint'],
    ['\`typecheck\`', '\`tsc --noEmit\`', 'TypeScript compiler checks'],
    ['\`test\`', '\`vitest run\`', 'Run unit + component tests'],
    ['\`test:e2e\`', '\`playwright test\`', 'Run Playwright e2e tests'],
    ['\`generate:icons\`', '\`node scripts/generate-icons.mjs\`', 'Regenerate favicon and touch icons'],
    ['\`generate:og\`', '\`node scripts/generate-og-image.mjs\`', 'Regenerate OG image'],
    ['\`generate:overview\`', '\`node scripts/generate-overview.mjs\`', 'Regenerate this document'],
  ],
)}

---

## Visual assets and regeneration

The app has several generated image assets that depend on branding or UI. When the logo, color palette, or main editor UI changes, the related assets must be regenerated. AI agents should flag this automatically when relevant source files are modified.

### Logo / icon

The app logo is a document-robot SVG defined inline in \`src/components/RobotIcon.tsx\`. Favicons and touch icons are **canvas-drawn replicas** of the same design in \`scripts/generate-icons.mjs\`.

${markdownTable(
  ['Asset', 'Generated by', 'Output path(s)', 'Consumed in'],
  [
    ['\`RobotIcon\` (inline SVG)', 'Hand-coded component', '\`src/components/RobotIcon.tsx\`', '\`AppLogo.tsx\`, \`LandingPage.tsx\`'],
    ['\`favicon-32.png\`', '\`npm run generate:icons\`', '\`public/favicon-32.png\`', '\`index.html\` (\`<link rel="icon">\`)'],
    ['\`icon-192.png\`', '\`npm run generate:icons\`', '\`public/icon-192.png\`', '\`index.html\` (\`<link rel="apple-touch-icon">\`)'],
    ['\`icon-512.png\`', '\`npm run generate:icons\`', '\`public/icon-512.png\`', 'Unused in HTML; kept for sharing or future use'],
    ['\`icon-maskable.png\`', '\`npm run generate:icons\`', '\`public/icon-maskable.png\`', 'Unused in HTML; kept for sharing or future use'],
  ],
)}

**If you change \`RobotIcon.tsx\`:** you must also update the canvas replica in \`scripts/generate-icons.mjs\` and re-run \`npm run generate:icons\` to keep favicons in sync.

### OG image (social sharing)

${markdownTable(
  ['Asset', 'Generated by', 'Output path', 'Consumed in'],
  [
    ['\`og-image.png\`', '\`npm run generate:og\`', '\`public/og-image.png\`', '\`index.html\` (\`<meta property="og:image">\`, \`<meta name="twitter:image">\`)'],
  ],
)}

The OG image is a 1200×630 composite built by \`scripts/generate-og-image.mjs\`. It launches a Playwright browser against the built app, takes screenshots of the editor form + preview, and composites them onto a branded canvas using the app's light-mode palette (\`#ffffff\`, \`#557c62\`, etc.) and Geist font.

**If you change:** the color palette (\`src/index.css\` theme tokens), the editor layout (\`CvEditorPage.tsx\`), or the preview styling (\`CvPreview.css\`) — re-run \`npm run generate:og\` to update the social image.

### External avatar

\`LandingPage.tsx\` loads the developer's GitHub avatar from \`https://github.com/batbrain9392.png\`. This is not a generated asset — it's fetched at runtime.

### Regeneration cheat sheet

${markdownTable(
  ['Trigger', 'Command'],
  [
    ['Logo/icon design changed', 'Update \`RobotIcon.tsx\` + \`scripts/generate-icons.mjs\`, then \`npm run generate:icons\`'],
    ['Color palette or theme changed', '\`npm run generate:icons\` + \`npm run generate:og\`'],
    ['Editor/preview UI layout changed', '\`npm run generate:og\`'],
    ['Project structure changed', '\`npm run generate:overview\`'],
  ],
)}

---

## File inventory

### Source files (${sourceFiles.length})

${sourceFiles.map((f) => `- \`${f}\` (${countLines(f)} lines)`).join('\n')}

### Test files (${testFiles.length})

${testFiles.map((f) => `- \`${f}\` (${countLines(f)} lines)`).join('\n')}

### E2E files (${e2eFiles.length})

${e2eFiles.map((f) => `- \`${f}\` (${countLines(f)} lines)`).join('\n')}

---

## Dependencies

### Runtime (${Object.keys(pkg.dependencies).length})

${Object.entries(pkg.dependencies)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, version]) => `- \`${name}\`: ${version}`)
  .join('\n')}

### Dev (${Object.keys(pkg.devDependencies).length})

${Object.entries(pkg.devDependencies)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, version]) => `- \`${name}\`: ${version}`)
  .join('\n')}
`;

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const outPath = path.resolve(ROOT, 'OVERVIEW.md');
writeFileSync(outPath, doc.trimStart());
console.log(`✅ Written ${outPath} (${doc.split('\n').length} lines)`);

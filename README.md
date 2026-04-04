# Bot-ter Than You

AI-powered CV and cover letter builder that runs entirely in your browser.

[![Deploy](https://github.com/batbrain9392/cv-builder/actions/workflows/deploy.yml/badge.svg)](https://github.com/batbrain9392/cv-builder/actions/workflows/deploy.yml)

**[Live demo](https://batbrain9392.github.io/cv-builder/)**

## Features

- Build and edit a CV with a **live side-by-side preview**
- **AI-powered generation** of professional summary, cover letter, and experience bullet points using Google Gemini
- Export to **DOCX** or **JSON** — import from JSON to pick up where you left off
- **Markdown** support in text fields for rich formatting
- Installable **PWA** with offline caching

## Using the AI features

1. Paste a **job description** into the sidebar and add your free [Gemini API key](https://aistudio.google.com/apikey)
2. Fill in your personal info, experience, and education
3. Hit **Enhance with AI** to tailor bullet points, summary, and cover letter to the job
4. Export as DOCX for submission, or JSON to save progress
5. Need a PDF? Open the DOCX in Word, Google Docs, or LibreOffice and print to PDF

## Privacy

- **No cookies.** None.
- **No server.** Gemini API calls go directly from your browser to Google using your own API key.
- The only `localStorage` usage is for the light/dark theme preference.
- CV data lives entirely in browser memory during the session. Nothing is persisted unless you explicitly export.
- Your Gemini API key is never stored server-side. It only appears in exported JSON if you choose to include it.

## Tech stack

|     | Technology                                                                   |                           |
| --- | ---------------------------------------------------------------------------- | ------------------------- |
| ⚛️  | [React 19](https://react.dev) + TypeScript                                   | UI framework              |
| ⚡  | [Vite 6](https://vite.dev)                                                   | Build tool                |
| 🎨  | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn](https://ui.shadcn.com) | Styling and components    |
| 📋  | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev)      | Form state and validation |
| 📄  | [docx.js](https://docx.js.org)                                               | Word document generation  |
| 📝  | [marked](https://marked.js.org)                                              | Markdown rendering        |
| 🌐  | Fully client-side                                                            | No backend required       |

The app is a PWA with a service worker (`public/sw.js`) and web manifest (`public/manifest.json`) for offline support and home screen installation.

## Built with

Code written in **[Cursor](https://cursor.com)** with **[Claude Opus](https://anthropic.com/claude)** by Anthropic. Live AI features inside the app are powered by **[Google Gemini](https://gemini.google.com)** (gemini-2.5-flash).

## Deployment

Deployed automatically to **GitHub Pages** on every push to `main` via [GitHub Actions](.github/workflows/deploy.yml).

To enable on a fresh fork: go to **Settings > Pages** and set the source to **GitHub Actions**.

The app is served under a `/cv-builder/` subpath and uses `HashRouter` for client-side routing, so in-app URLs look like `/#/about`.

## Local development

Requires **Node 20+**.

```bash
npm ci
npm run dev
```

| Script              | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start local dev server          |
| `npm run build`     | Type-check and production build |
| `npm run preview`   | Preview the production build    |
| `npm run lint`      | Run ESLint                      |
| `npm run typecheck` | Run TypeScript compiler checks  |
| `npm run test`      | Run tests with Vitest           |

## Feedback

Found a bug or have a feature idea? [Open an issue](https://github.com/batbrain9392/cv-builder/issues) or send a message on [LinkedIn](https://www.linkedin.com/in/batbrain9392/).

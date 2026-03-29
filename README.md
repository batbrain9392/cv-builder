# cv-builder

Local **Vite + React + TypeScript** app to edit the canonical CV Markdown on disk, with live preview. **PDF export is not included** (deferred).

## Prerequisites

- Node.js 20+ (LTS recommended)

## Setup

```bash
npm install
```

## Run (dev)

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). **Save** issues a `PUT` to `/api/cv`, implemented only in the **dev server** middleware, and writes [`content/cv.md`](content/cv.md).

`npm run build` produces a static `dist/` bundle; **saving from the UI requires `npm run dev`** because production preview has no file-write API.

## Canonical CV path

- **Canonical CV (edited by the app):** [`content/cv.md`](content/cv.md)
- **Staff-level writing guide:** [`STAFF_CV_GUIDE.md`](STAFF_CV_GUIDE.md) (includes F-pattern and **ATS** notes)

The Markdown is structured for **ATS-friendly** plain text (standard section headings, plain contact lines, simple bullets). If you export to PDF for applications, use a simple single-column layout; see the guide.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Dev server + `/api/cv` read/write    |
| `npm run build`    | Typecheck + production bundle        |
| `npm run preview`  | Preview production build (no save)   |
| `npm run typecheck`| `tsc --noEmit`                       |
| `npm run lint`     | ESLint                               |
| `npm run test`     | Vitest (validation helpers)          |

## GitHub

Remote when ready: `https://github.com/batbrain9392/cv-builder`

```bash
git remote add origin https://github.com/batbrain9392/cv-builder.git
git push -u origin main
```

Do not commit secrets or `.env` files (see `.gitignore`).

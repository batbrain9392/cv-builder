# Staff-level CV guide

Use this when editing [`content/cv.md`](content/cv.md). It is a **writing bar**, not permission to invent facts.

## F-pattern scanning (recruiters’ first pass)

Eye-tracking studies describe an **F-shaped scan**: a horizontal pass across the **top** of the page, then **down the left** (section headers, job titles, bullet stems), with another shorter horizontal band mid-page. Initial reviews are often very short, so **placement and scannability** matter.

**Practical implications for this CV:**

- **Top band:** Name, target title, **contact on one line** (location, email, phone, links), then a **short** summary with **bold keywords** at the start of clauses.
- **Left rail:** Clear `###` job lines; bullets **front-loaded** with a bold label or strong verb so the left edge reads as a list of hooks.
- **Density:** Prefer short lines and bullets over long paragraphs; put **education and older sections** after experience (lower visual priority in a quick scan).
- **PDF/layout tools:** If you export to two columns later, keep the **strongest** content in the **top-left**; avoid burying key terms on the far right or in wall-of-text blocks.

This complements—not replaces—the Staff-level content checklist below.

## ATS compatibility (applicant tracking systems)

Many employers parse CVs with **ATS** software before a human reads them. Guidance from resume/ATS guides (layout, not magic keywords): use a **single-column**, top-to-bottom flow; **standard section titles** (e.g. Professional Summary, Professional Experience, Education, Technical Skills); **plain text** contact details with **full URLs** for LinkedIn and GitHub; **consistent date ranges** (e.g. `Jan 2020 - Present`); avoid relying on **tables, text boxes, headers/footers, images, or icons** in Word/PDF exports; prefer **simple bullets** over dense paragraphs.

**This repo’s Markdown source** is structured for that plain-text model: minimal special punctuation, spelled-out employer context where helpful (e.g. Willis Towers Watson (WTW)), and skills as a simple list. If you export to PDF, use a simple template (no multi-column body text) and test a plain-text extract. **Trade-off:** heavy bold and decorative punctuation help human F-pattern scans but can be reduced here for cleaner ATS parsing; you can tune emphasis when producing a human-only PDF.

## What “Staff” usually signals on a CV

Hiring teams look for **scope**, **impact**, and **influence**, not only a skills list.

- **Outcomes over duties** — Lead with what changed (product, users, reliability, velocity), using numbers **only when true and defensible**.
- **Scope** — Multi-team initiatives, ambiguous problems, platform or standards work, org-wide adoption.
- **Technical depth** — Architecture tradeoffs, systems behavior, operational concerns—not only framework names.
- **Leadership without authority** — Mentoring, aligning stakeholders, driving consensus, raising quality bars.
- **Clarity and density** — Short bullets; reverse-chronological experience; skills support the story.
- **Honesty** — Titles and “Staff-level” claims must match real scope; interviewers will probe.

## Checklist (per role block)

- [ ] At least one bullet ties to **user or business outcome** (or a verifiable engineering outcome: incidents down, latency improved) where you can support it.
- [ ] **Scope** is explicit: who else was involved, what boundary you owned.
- [ ] **Technical** content names real constraints (scale, failure modes, constraints)—not buzzwords.
- [ ] No **keyword stuffing**; skills section backs the narrative.
- [ ] **No broken image refs** or placeholder tokens in Markdown meant for PDF export later.

## Section template (experience)

Use a pattern like this per role (adapt headings to your file):

```markdown
### Title · Company

Link · _Dates, Location_

- Outcome / scope lead: what shipped, who it served, what made it hard.
- Deeper technical: architecture, reliability, performance, testing—what you actually did.
- Collaboration: product/design/backend/QA—only if it clarifies scope.
- Tech: **Stack** (short; avoid duplicating the same stack in every bullet).
```

## Reference posting (compass only)

One concrete role can calibrate **specificity** and **keywords**—not a script to copy if your experience differs.

**Role:** [Senior Software Engineer, Inference — Anthropic (Dublin)](https://job-boards.greenhouse.io/anthropic/jobs/4641822008)

**Themes often mentioned in that space:** large-scale distributed systems; routing/orchestration; compute efficiency; reliability; Kubernetes / AWS / GCP; Python or Rust; ML/inference systems; load balancing; observability; multi-region.

**Honesty boundary:** That posting is **inference / infra**-heavy. A strong **front-end Staff** story is valid for many roles. For Inference specifically, lead with **verifiable overlap** (e.g. distributed, latency-sensitive, high-scale client or platform work). Do **not** imply ML training, fleet orchestration, or cloud infra ownership unless you can defend it in interview.

Map your real work honestly—for example, **WebRTC / real-time media** → latency-sensitive, distributed client systems; **admin platforms** → complex workflows, reliability, cross-team delivery.

## Canonical file in this repo

- **`content/cv.md`** — single source of truth; edited by the local app (`GET`/`PUT` `/api/cv` in dev).

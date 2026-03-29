# Staff-level CV guide

Use this when editing [`content/cv.md`](content/cv.md). It is a **writing bar**, not permission to invent facts.

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

- Edited by the local app: **`content/cv.md`**
- Original export snapshot (if kept): `DebmallyaBhattacharya_CV.md` at repo root

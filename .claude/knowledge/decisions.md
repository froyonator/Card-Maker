# Decision Log

Running log of significant decisions. Newest first. Format: date, decision, why, revisit-when.

## 2026-06-11 — MVP: Pokémon editor on an SVG vector engine
**Why:** Proves the core product bet (code-drawn, recolorable frameworks) with the channel the owner uses. SVG gives resolution-independent export, free hit-testing, recolor-by-fill, and human-readable framework JSON. Full spec: `docs/superpowers/specs/2026-06-11-card-maker-mvp-design.md`.
**Revisit when:** Only if single-card SVG rendering hits a real performance/effects wall (none expected).

## 2026-06-11 — Frameworks are vector-first, image layers allowed
**Why:** Built-in packs are pure vectors (fully editable); image slots/layers remain so scanned templates can be a base when exactness beats editability.
**Revisit when:** Never expected.

## 2026-06-11 — No accounts; persistence = user-granted local project folder
**Why:** File System Access API folder for cards/frameworks/exports (Chromium), JSON download/upload fallback, IndexedDB crash autosave. Zero backend, free static hosting.
**Revisit when:** Community sharing features demand server-side anything (gallery is a future spec).

## 2026-06-11 — Editor: canvas-centered studio + Fill/Design toggle; "pro studio" art direction
**Why:** Card is the working surface (click-to-edit), rail adapts by mode; near-monochrome dark UI keeps the card the only colorful object (print color accuracy + non-generic look).
**Revisit when:** Framework-editor spec may deepen Design mode's layout needs.

## 2026-06-11 — Stack provisionally Vite + React + TypeScript
**Why:** Card maker is a client-side editor; lean SPA hosts anywhere free; large OSS contributor pool.
**Revisit when:** Full product idea is shared — sharing/galleries/accounts could justify Next.js.

## 2026-06-11 — Project-local `.claude/` committed to git; `state/` gitignored
**Why:** Open-source contributors and every Claude session share identical context; personal logs must not collide.
**Revisit when:** Never expected; structure may grow (skills/, scripts/) as workflows emerge.

## 2026-06-11 — Repo lives at `C:\dev\card-maker`, not OneDrive
**Why:** OneDrive sync conflicts with Node tooling (node_modules churn, file locks). Git + GitHub are the backup.
**Revisit when:** Never.

## 2026-06-11 — License: MIT
**Why:** Permissive default for an open-source tool; GitHub-initialized.
**Revisit when:** Before first public release announcement, if attribution/copyleft preferences change.

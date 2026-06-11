# Decision Log

Running log of significant decisions. Newest first. Format: date, decision, why, revisit-when.

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

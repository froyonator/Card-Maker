# Card Maker

Open-source web app for creating fully custom trading-card-style cards — inspired by
pokecardmaker.net, but more powerful and customizable. **Status: M1 engine foundation shipped (v0.2.0).** Core SVG engine, Pokémon
channel (S&V Basic v0), and raster export work end to end via the dev harness (`npm run dev`).
Stack: Vite + React + TypeScript, zod, Vitest. Next milestones: M2 editor UX, M3 persistence
and export polish — see `docs/superpowers/specs/2026-06-11-card-maker-mvp-design.md`.

## Rules (always honor these)

@.claude/rules/git-discipline.md
@.claude/rules/code-style.md
@.claude/rules/security.md

## Memory map (read on demand)

- `.claude/knowledge/architecture.md` — app architecture (stub until designed)
- `.claude/knowledge/decisions.md` — running decision log; check before re-litigating a choice
- `.claude/knowledge/research/` — reference notes
- `.claude/skills/`, `.claude/scripts/` — project workflows and hooks (empty by design for now)
- `.claude/state/` — YOUR personal session memory (gitignored): backlog, diary. Keep it current.
- `docs/superpowers/specs/` — approved design specs; `docs/superpowers/plans/` — implementation plans

## Working agreement

- Local-first: commit early and often on `main`; push to origin occasionally as backup.
- Significant decisions go in the decision log in the same commit as the change.
- Before designing app features, read the latest spec in `docs/superpowers/specs/`.

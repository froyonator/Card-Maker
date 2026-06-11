# Project Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Card Maker repository environment per the approved spec: project-local `.claude/` memory (knowledge/rules/skills/scripts/state), CLAUDE.md entry point, repo hygiene files, a pointer in the old OneDrive folder, and a first push to GitHub.

**Architecture:** Everything is plain markdown/config — no application code. The `.claude/` directory is committed to git except `state/`, which is gitignored personal memory. CLAUDE.md uses Claude Code `@path` imports so rules auto-load every session.

**Tech Stack:** Git, GitHub (`origin` = https://github.com/froyonator/Card-Maker.git), Markdown, EditorConfig.

**Context for the implementer:** Repo already exists at `C:\dev\card-maker` on branch `main` with 3 commits (spec, GitHub-initialized README/LICENSE, merge). Git identity is repo-local `froyonator <276264696+froyonator@users.noreply.github.com>`. gh CLI active account is `froyonator` with push access. The old project folder `C:\Users\srira\OneDrive\Desktop\Card Maker` is empty and outside this repo.

---

### Task 1: Repo hygiene files

**Files:**
- Create: `C:\dev\card-maker\.gitignore`
- Create: `C:\dev\card-maker\.editorconfig`

- [ ] **Step 1: Write `.gitignore`**

```gitignore
# Dependencies & build output (future app scaffold)
node_modules/
dist/
coverage/

# Environment & secrets
.env
.env.*

# Personal Claude memory — never committed (see .claude/ structure)
.claude/state/

# OS junk
Thumbs.db
Desktop.ini
.DS_Store

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
```

- [ ] **Step 2: Write `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 3: Commit**

```powershell
Set-Location C:\dev\card-maker
git add .gitignore .editorconfig
git commit -m @'
chore: add gitignore and editorconfig

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 2: Behavioral rules (`.claude/rules/`)

**Files:**
- Create: `C:\dev\card-maker\.claude\rules\git-discipline.md`
- Create: `C:\dev\card-maker\.claude\rules\code-style.md`
- Create: `C:\dev\card-maker\.claude\rules\security.md`

- [ ] **Step 1: Write `git-discipline.md`**

```markdown
# Git Discipline

- Work on `main` locally for now; switch to feature branches once the app scaffold lands.
- Small, atomic commits — one logical change per commit.
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Never force-push `main`. Never rewrite published history.
- Push to `origin` (https://github.com/froyonator/Card-Maker) occasionally — local-first workflow; the remote is backup + publication, not the workspace.
- Never commit secrets, tokens, or `.env` files. `.claude/state/` is personal memory and stays untracked.
- Record significant decisions in `.claude/knowledge/decisions.md` in the same commit as the change they explain.
```

- [ ] **Step 2: Write `code-style.md`**

```markdown
# Code Style

(App code does not exist yet — these rules take effect with the first scaffold. Update when the stack is finalized.)

- TypeScript everywhere, `strict: true`. No `any` unless annotated with a reason.
- Prefer small, focused files: one component/module responsibility per file.
- Components: PascalCase files and exports. Utilities/hooks: camelCase, hooks prefixed `use`.
- No premature abstraction — duplicate twice before extracting (rule of three).
- Comments explain constraints and "why", never "what" the next line does.
- Match the formatting config in `.editorconfig`; formatter/linter config will be added with the scaffold.
```

- [ ] **Step 3: Write `security.md`**

```markdown
# Security

- No secrets, API keys, or tokens in the repo — ever. Use `.env` locally (gitignored) and document required vars in README.
- This app will accept user-uploaded images and user-authored templates: treat all user content as untrusted. Validate file types/sizes; never `dangerouslySetInnerHTML` with user content; sanitize anything rendered or exported.
- Keep dependencies minimal and audited — every new package needs a reason; prefer zero-dependency solutions for small utilities.
- Open-source repo: assume everything committed is public the moment it lands. There is no "temporary" secret commit.
```

- [ ] **Step 4: Commit**

```powershell
Set-Location C:\dev\card-maker
git add .claude/rules
git commit -m @'
docs: add always-loaded behavioral rules

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: Knowledge base (`.claude/knowledge/`)

**Files:**
- Create: `C:\dev\card-maker\.claude\knowledge\architecture.md`
- Create: `C:\dev\card-maker\.claude\knowledge\decisions.md`
- Create: `C:\dev\card-maker\.claude\knowledge\research\README.md`

- [ ] **Step 1: Write `architecture.md`**

```markdown
# Architecture

> Status: NOT YET DESIGNED. The application has not been scaffolded. This file is filled in
> when the product brainstorm completes and the app design spec is written.

Provisional direction (subject to change after the full product idea is shared):
- Client-first SPA: Vite + React + TypeScript
- Core problem space: layered card editor (frames, art, text, symbols) with export

See `docs/superpowers/specs/2026-06-11-project-environment-design.md` for the environment design,
and `decisions.md` for the running decision log.
```

- [ ] **Step 2: Write `decisions.md`**

```markdown
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
```

- [ ] **Step 3: Write `research/README.md`**

```markdown
# Research Notes

Drop reference notes here as they accumulate: pokecardmaker.net feature analysis, rendering
approach comparisons (SVG vs Canvas vs Konva/Fabric), card template format studies, export
quality experiments. One topic per file, dated headers inside.
```

- [ ] **Step 4: Commit**

```powershell
Set-Location C:\dev\card-maker
git add .claude/knowledge
git commit -m @'
docs: seed knowledge base with architecture stub and decision log

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 4: Skills, scripts, and shared settings

**Files:**
- Create: `C:\dev\card-maker\.claude\skills\README.md`
- Create: `C:\dev\card-maker\.claude\scripts\README.md`
- Create: `C:\dev\card-maker\.claude\settings.json`

- [ ] **Step 1: Write `skills/README.md`**

```markdown
# Project Skills

Slash-command workflows for recurring project tasks live here, one directory per skill with a
`SKILL.md` inside (Claude Code project-skill convention).

Empty by design (YAGNI): add a skill only when a workflow has been done manually 2-3 times and
is worth standardizing. Likely future candidates: release checklist, template-format migration,
visual regression check.
```

- [ ] **Step 2: Write `scripts/README.md`**

```markdown
# Scripts & Hooks

Automation and guard hooks live here, wired up via `.claude/settings.json` (`hooks` key).

Empty by design (YAGNI): add a hook when there is a real risk to guard (e.g., blocking commits
containing secrets, or a pre-push test gate once tests exist).
```

- [ ] **Step 3: Write `settings.json`**

```json
{
  "$comment": "Shared project settings for Claude Code. Hook wiring (.claude/scripts/) is added here when hooks exist."
}
```

- [ ] **Step 4: Commit**

```powershell
Set-Location C:\dev\card-maker
git add .claude/skills .claude/scripts .claude/settings.json
git commit -m @'
chore: add skills/scripts placeholders and shared Claude settings

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: CLAUDE.md entry point

**Files:**
- Create: `C:\dev\card-maker\CLAUDE.md`

- [ ] **Step 1: Write `CLAUDE.md`**

```markdown
# Card Maker

Open-source web app for creating fully custom trading-card-style cards — inspired by
pokecardmaker.net, but more powerful and customizable. **Status: pre-scaffold.** The product
design brainstorm has not happened yet; no application code exists. Stack is provisionally
Vite + React + TypeScript (see decision log before assuming).

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
```

- [ ] **Step 2: Commit**

```powershell
Set-Location C:\dev\card-maker
git add CLAUDE.md
git commit -m @'
docs: add CLAUDE.md session entry point with rule imports

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: Personal state (untracked) + gitignore verification

**Files:**
- Create: `C:\dev\card-maker\.claude\state\backlog.md` (NOT committed)
- Create: `C:\dev\card-maker\.claude\state\diary\` (empty dir, NOT committed)

- [ ] **Step 1: Write `state/backlog.md`**

```markdown
# Backlog

## Next up
- [ ] User shares full product vision → run brainstorming skill → app design spec
- [ ] Confirm/revise stack (Vite+React+TS provisional) after vision is known
- [ ] Scaffold app per the resulting plan
- [ ] CONTRIBUTING.md + contributor docs before public announcement

## Someday
- [ ] CI pipeline (lint, test, build) once scaffold exists
- [ ] Hosting target decision (GitHub Pages / Netlify / Cloudflare)
```

- [ ] **Step 2: Create diary directory**

```powershell
New-Item -ItemType Directory -Force C:\dev\card-maker\.claude\state\diary | Out-Null
```

- [ ] **Step 3: Verify state/ is ignored**

```powershell
Set-Location C:\dev\card-maker
git status --porcelain
git check-ignore -v .claude/state/backlog.md
```

Expected: `git status --porcelain` output contains NO `.claude/state` lines; `check-ignore` prints the `.gitignore:` rule line `.claude/state/`. If state files appear in status, STOP — fix `.gitignore` before continuing.

---

### Task 7: README update

**Files:**
- Modify: `C:\dev\card-maker\README.md` (currently 2 lines from GitHub init: title + description)

- [ ] **Step 1: Replace README contents**

```markdown
# Card Maker

An open-source tool to create custom trading-card-style cards — inspired by
[pokecardmaker.net](https://pokecardmaker.net/create), built to be far more powerful and
customizable.

> **Status: early design.** No application code yet — the product design phase is in progress.
> Watch this space.

## Planned

- Fully custom card layouts: frames, art, text, symbols, stats — all editable
- High-quality export
- Runs entirely in the browser

## Repo layout

- `CLAUDE.md` + `.claude/` — shared project memory for AI-assisted development (rules,
  knowledge, decision log) — committed so every contributor and session shares context
- `docs/superpowers/specs/` — design specs · `docs/superpowers/plans/` — implementation plans

## License

[MIT](LICENSE)
```

- [ ] **Step 2: Commit**

```powershell
Set-Location C:\dev\card-maker
git add README.md
git commit -m @'
docs: expand README with project status and repo layout

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 8: Pointer in old OneDrive folder

**Files:**
- Create: `C:\Users\srira\OneDrive\Desktop\Card Maker\MOVED.md` (outside the repo — no commit)

- [ ] **Step 1: Write `MOVED.md`**

```markdown
# This project has moved

The Card Maker project lives at: **C:\dev\card-maker**
Remote: https://github.com/froyonator/Card-Maker

Moved 2026-06-11 because OneDrive sync conflicts with Node.js tooling (node_modules churn,
file locks). Nothing else in this folder is used.
```

---

### Task 9: Push and verify

- [ ] **Step 1: Push to origin**

```powershell
Set-Location C:\dev\card-maker
git push -u origin main
```

Expected: push succeeds, `main` tracks `origin/main`.

- [ ] **Step 2: Verify success criteria from the spec**

```powershell
Set-Location C:\dev\card-maker
git log --oneline
git status --porcelain
gh repo view froyonator/Card-Maker --json defaultBranchRef --jq .defaultBranchRef.name
```

Expected: log shows all environment commits; status is clean (no untracked except nothing — state/ ignored); remote default branch `main` now contains the pushed commits. Spec success criteria 1-4 all hold: committed history, CLAUDE.md entry point present, state/ ignored, zero app code.

# Project Environment Design — Card Maker

**Date:** 2026-06-11
**Status:** Approved
**Scope:** Repository and Claude memory environment only. The card maker application itself will be designed in a follow-up spec once the full product vision is shared.

## Context

Card Maker is a new open-source web application: a custom card creation tool inspired by [pokecardmaker.net](https://pokecardmaker.net/create), but substantially more powerful and customizable. Before designing the product, we are establishing a project environment that is **readable, trackable, mergeable, and modifiable** — for both human contributors and Claude sessions.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Project location | `C:\dev\card-maker` | Original folder was inside OneDrive, which conflicts with Node tooling (sync churn on `node_modules`, file locks, slow builds). Git + GitHub replace OneDrive as backup. |
| Claude memory home | Project-local `.claude/`, committed to git | Open-source contributors and every Claude session share the same context. Version-controlled, reviewable in PRs. |
| Personal state | `.claude/state/` — gitignored | Session logs, diary, and backlog are per-person/ephemeral; they must not collide across contributors. |
| Tech stack | Vite + React + TypeScript (provisional) | Lean client-first SPA suited to a canvas/SVG editor; hosts anywhere free; large contributor pool. **May be revised** after the full product idea is heard — which is why no app code is scaffolded in this phase. |
| License | MIT (stub) | Permissive default for open source; swappable before first public release. |
| GitHub repo | Deferred | Created via `gh repo create` when ready to publish. Local git from day one. |
| Git identity | `srinator22 <215377324+srinator22@users.noreply.github.com>` (repo-local) | GitHub noreply format keeps the real email out of public history. |

## Directory layout

```
card-maker/
├── CLAUDE.md                  # Entry point: project summary + pointers into .claude/
├── LICENSE                    # MIT stub
├── README.md                  # Vision placeholder + dev setup notes
├── .editorconfig              # Consistent formatting across contributors' editors
├── .gitignore                 # node_modules, dist, .env*, .claude/state/
├── .claude/
│   ├── settings.json          # Shared project settings (hook wiring lives here later)
│   ├── knowledge/             # Read-on-demand reference files
│   │   ├── architecture.md    #   Stub; filled when the app is designed
│   │   ├── decisions.md       #   Running ADR log: what we chose and why
│   │   └── research/          #   Notes on pokecardmaker, rendering approaches, etc.
│   ├── rules/                 # Always-loaded behavioral rules
│   │   ├── git-discipline.md  #   Small commits, conventional messages, no force-push to main
│   │   ├── code-style.md      #   TS strict, naming, component conventions
│   │   └── security.md        #   No secrets in repo, validate uploads, dependency hygiene
│   ├── skills/                # Project slash-command workflows (added as recurring tasks emerge)
│   ├── scripts/               # Hooks & automation (added when there is something to guard)
│   └── state/                 # GITIGNORED — personal session logs, diary, backlog
│       ├── backlog.md
│       └── diary/
└── docs/
    └── superpowers/specs/     # Design specs (this file)
```

### How the pieces load

- **CLAUDE.md** auto-loads every session. It stays short: one-paragraph project summary, the rule files to honor, and pointers into `knowledge/` for on-demand reading.
- **rules/** are written as directives and referenced from CLAUDE.md so they are always honored.
- **knowledge/** is reference material read only when relevant — keeps session context lean.
- **skills/** and **scripts/** start as empty directories with a README each explaining their purpose; populated only when a real recurring workflow or guard-worthy risk exists (YAGNI).
- **state/** is each person's private working memory. `.gitignore` covers `.claude/state/` entirely.

## Migration

The old OneDrive folder (`C:\Users\srira\OneDrive\Desktop\Card Maker`) receives a single `MOVED.md` pointing to `C:\dev\card-maker`. Nothing else lives there.

## Explicitly deferred (next spec, after the product idea)

- Application scaffold (Vite + React + TS, or revised stack)
- Rendering approach (SVG vs Canvas vs Konva/Fabric)
- Card template data model
- Hosting target and CI pipeline
- Contributor guide / CONTRIBUTING.md

## Success criteria

1. `git log` in `C:\dev\card-maker` shows the environment committed on `main`.
2. A fresh Claude session opened in the project reads CLAUDE.md and can locate rules, knowledge, and state without guidance.
3. `git status` is clean with `state/` files present but untracked (gitignore verified).
4. No application code exists yet — the stack decision remains cheap to change.

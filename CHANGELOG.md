# Changelog

All notable changes to Card Maker are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/) (0.x while pre-release - minor = features, patch = fixes/docs).

## [Unreleased]

## [0.3.0] - 2026-06-11

### Added
- Writing-style rules (professional tone, no em dashes, factual docs) applied across all code and docs; README rewritten.
- Engine: linear gradient fills and per-layer font roles (fontRole, letterSpacing, italic).
- Typography: per-section font role map for the Pokemon channel with bundled OFL substitutes (Cabin, Cabin Condensed, Jost, Inter, Tenor Sans); authentic-font research recorded in the knowledge base.
- S&V Basic framework v1: silver gradient border, type-colored gradient body with highlight sweep, stage badge, bezeled art window, divider tube, double-rule type bar, era typography. All colors remain palette-driven.
- tools/img2framework.py: traces any raster image into framework shape layers (vtracer), rescaled to the design space, with optional color-to-parameter mapping. Output of official templates stays local per the copyright rule in tools/README.md.

### Changed
- Type palettes now carry four colors per type (frameLight, frameDark, frameSheen, accentColor).

## [0.2.0] - 2026-06-11

### Added
- Vite + React + TypeScript app scaffold with Vitest (strict TS, jsdom test environment).
- Core engine: card/MPC geometry module (750×1050 design space, 36-unit bleed ring, export size math ported from `mpc_bleed.py` as contract tests), zod schemas for `Framework`/`CardDocument`, parameter resolution (default ← palette ← override), deterministic greedy text wrapping.
- SVG `CardRenderer` for shape/text/image/symbol/group layers with `visibleIf` toggles, image-slot placeholders, and `data-layer` hit-testing hooks.
- Channel registry plus the Pokémon channel: S&V Basic framework v0, 11 energy-type palettes, v0 energy symbol set, Fill-rail field sections.
- Raster export: live SVG → PNG at share/print/MPC sizes with true painted bleed; dev harness page with palette switcher and export buttons.

## [0.1.0] - 2026-06-11

### Added
- Project environment: `.claude/` shared memory (rules, knowledge, decision log), CLAUDE.md entry point, repo hygiene files, MIT license, GitHub remote.
- Design spec: project environment (`docs/superpowers/specs/2026-06-11-project-environment-design.md`).
- Design spec: Card Maker MVP - Pokémon editor on an SVG vector engine (`docs/superpowers/specs/2026-06-11-card-maker-mvp-design.md`).
- Changelog and session versioning discipline.

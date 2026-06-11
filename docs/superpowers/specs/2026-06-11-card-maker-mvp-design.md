# Card Maker MVP Design — Pokémon Editor on a Vector Engine

**Date:** 2026-06-11
**Status:** Approved
**Scope:** First shippable product slice. The framework editor (deep Design mode), channel landing wheel, MTG/custom channels, and community sharing are explicitly deferred to follow-up specs (§10).

## 1. Product summary

Card Maker is an open-source, hosted, static web app for creating fully custom trading-card-style cards — inspired by pokecardmaker.net but fundamentally more powerful: card frames are **code-drawn vector frameworks defined as data**, not baked PNG scans. Everything on the card is therefore recolorable, restylable, extensible, and community-contributable, and exports render at any resolution including print-ready MPC output with true painted bleed.

**v1 user story:** Open the site → the editor loads with a Scarlet & Violet Pokémon framework → fill in name, HP, moves, art image, type, weakness/resistance/retreat, illustrator, set info, flavor text → recolor the frame / shift hue & saturation as real vector color math → export as share PNG, 300-DPI print PNG, MPC-ready PNG, or card JSON — with a quality dropdown (1×/2×/4×/custom).

Feature parity target for the Fill experience: the pokecardmaker control set visible in the reference screenshots (Template, Basics, Images, Moves, Type Bar, Card Info sections; custom name symbols; custom energy types; rarity icons; regulation marks; set text; flavor text) — reproduced on the vector engine, plus the recoloring abilities pokecardmaker cannot offer.

## 2. Decisions made during brainstorm

| Decision | Choice |
|---|---|
| MVP focus | Engine + Pokémon channel + export. Proves the core bet with the channel the owner uses. |
| Framework DNA | **Vector-first, images allowed.** Built-in frameworks are pure code-drawn vectors; the engine also supports image layers so scanned template PNGs can serve as a base when exactness beats editability. |
| First framework set | Scarlet & Violet era, Pokémon supertype: Basic / Stage 1 / Stage 2, regular + Full Art variants, all 11 energy types via parameter presets (recolors). Trainer/Energy supertypes and other eras are future framework packs. |
| Rendering | **SVG.** Frameworks render as an SVG DOM tree. Resolution-independent export, free hit-testing for click-to-edit, recolor = fill change, frameworks stay human-readable/diffable JSON. |
| Editor layout | **Canvas-centered studio** (option B) with a **Fill / Design** top-bar toggle (option C's insight): card centered, right inspector rail; the toggle decides what the rail offers. |
| Design mode in v1 | Deliberately shallow: parameter colors, hue/sat shift, font choice, optional-layer toggles. The full framework-building toolbar is the next spec. |
| Art direction | **Pro studio:** quiet near-monochrome dark UI; the card is the only colorful thing on screen. Editor canvas surface stays neutral so card colors read true. |
| Persistence | **Local folder via File System Access API** (user grants a project folder; cards/frameworks/exports saved as real files). No accounts, ever. Fallback for non-Chromium browsers: JSON download/upload. IndexedDB autosave as crash net in all browsers. |
| Exports | Share PNG, print PNG (300 DPI), MPC-ready PNG, card JSON — all behind one export dialog with a quality dropdown (1×/2×/4×/custom resolution). |
| Stack | Vite + React + TypeScript (confirmed; the SPA/editor shape fits). Zod for schema validation. |

## 3. Architecture

Four modules with hard boundaries, as folders in one Vite app (`src/core`, `src/channels`, `src/editor`, `src/export`), splittable into packages later. Dependency direction: `editor` and `export` depend on `core` and `channels`; `channels` depends only on `core` types; `core` depends on nothing app-specific.

### 3.1 `core/` — the engine
- TypeScript types + zod schemas for `Framework`, `CardDocument`, `FrameworkLayer`, `Parameter`.
- Parameter resolution: merges framework defaults ← type-palette preset ← per-card overrides into concrete values.
- `<CardRenderer framework card />`: pure function of its props, renders the SVG tree. No Pokémon knowledge, no editor knowledge.
- Schema versioning + migration entry point (§8).

### 3.2 `channels/` — content packs
A channel implements a `ChannelDefinition` interface:
```ts
interface ChannelDefinition {
  id: string;                       // "pokemon"
  name: string;
  frameworks: Framework[];          // the S&V set in v1
  palettes: ParameterPreset[];      // 11 energy-type palettes
  symbols: SymbolDef[];             // energy/type icons, drawn as SVG
  fieldSections: FieldSection[];    // drives the Fill rail grouping
}
```
A registry maps id → definition. **Adding MTG later = adding a folder and registering it; zero core changes.** v1 registers only `pokemon`; the registry existing is what keeps the modularity promise.

### 3.3 `editor/` — the UI
React app shell, canvas-centered layout, selection state, inspector rail, Fill/Design toggle, theme. State management: Zustand (small, no boilerplate; document state + UI state in separate stores; undo/redo via a patch history on the document store).

### 3.4 `export/` — rasterization & files
Serializes the rendered SVG (fonts subsetted/inlined as data URIs, images inlined), draws it to an off-screen `<canvas>` at the requested scale, emits PNG blobs; also writes/reads card JSON. Owns the File System Access integration and fallbacks.

## 4. Data model

### 4.1 Framework
A `Framework` is a JSON document:
- **Identity:** `id`, `version` (semver), `channelId`, `name`, `variant` (e.g. "basic", "stage1", "full-art").
- **Geometry:** card trim size in mm (63×88), corner radius, and a **bleed extent** (3.05 mm per side, derived from the MPC 36px/300DPI spec).
- **Parameters:** named, typed inputs (`color`, `number`, `font`, `boolean`) with defaults — e.g. `frameColor`, `accentColor`, `textColor`. Palettes are parameter presets.
- **Layer tree (ordered, z-bottom→top).** Each layer is one of:
  - `shape` — SVG path/rect/ellipse data with fills/strokes that may reference parameters;
  - `text-slot` — a named, user-fillable text region (font, size, fit/wrap rules, alignment), e.g. `name`, `hp`, `move1.text`, `flavorText`;
  - `image-slot` — a named user image region (art, custom name symbol, custom set icon) with fit mode and optional mask;
  - `symbol` — instance of a channel symbol (energy icons in move costs, weakness, retreat);
  - `group` — children + optional `visibleIf` parameter binding (optional-layer toggles).
- **Bleed behavior per layer:** `extend` (outer borders paint past trim into the bleed ring) or `clip` (inner content clipped at trim). This single flag replaces the entire raster bleed pipeline in `mpc_bleed.py`.

### 4.2 CardDocument
- `channelId`, `frameworkId`, `frameworkVersion`;
- `fields`: values for text/image slots (move list is structured data: name, cost array, damage, text);
- `overrides`: parameter overrides (frame recolor, hue/sat adjustments, font swaps, layer toggles);
- `meta`: card name, created/modified timestamps, app version.

Both documents are human-readable JSON — diffable in PRs, shareable as files. Community frameworks are just framework JSON files (plus any image assets) loaded from the project folder.

### 4.3 Fonts
Pokémon's real card faces are proprietary. Frameworks reference fonts by role (`display`, `body`, `flavor`) mapped to bundled free lookalikes; per-card font swaps are parameter overrides. Font files ship with the app and are inlined at export so output never depends on viewer-installed fonts.

## 5. Editor UX

- **Layout:** card centered on a neutral zoom/pan surface; top bar (channel/framework picker, Fill|Design toggle, undo/redo, save status, Export button); right inspector rail.
- **Click-to-edit:** hovering highlights the element under the cursor; clicking selects it and focuses its controls in the rail. Selecting a text slot allows in-place typing on the card.
- **Fill mode rail:** all fields grouped in collapsible sections mirroring the reference tool (Basics, Images, Moves, Type Bar, Card Info) — pure form entry remains first-class; the canvas and the form are two views of the same document.
- **Design mode rail (v1 scope):** framework parameter controls — palette picker, individual parameter colors, hue/saturation shift, font roles, optional-layer toggles. A "reset to palette" affordance per parameter.
- **Theme:** pro studio — near-monochrome dark (#16-1c range), one neutral accent, restrained motion; the card is the most saturated object on every screen. Keyboard: undo/redo, zoom, arrow-nudge selection between slots. The visual identity must avoid generic-template feel ("non-slop"): custom typography scale, considered spacing, no default component-library look.

## 6. Persistence

1. **Project folder (primary, Chromium):** user clicks "Open project folder" → `showDirectoryPicker()` → app stores the handle (IndexedDB) and reuses it next visit (permission re-prompt as required). Layout inside the folder: `cards/*.card.json`, `frameworks/*.framework.json` (community/custom packs auto-loaded from here), `exports/` (PNG outputs land here by default).
2. **Fallback (Firefox/Safari):** identical JSON formats via download/upload buttons; export PNGs as normal downloads.
3. **Crash net (all browsers):** the working document autosaves to IndexedDB on every change (debounced); on load, offer recovery if newer than the last explicit save.

## 7. Export

One dialog: output type × quality.
- **Share PNG:** trim-size render at 1× (745×1040-class), 2×, 4×, or custom pixel width.
- **Print PNG:** 63×88 mm at 300 DPI (744×1039) without bleed, or higher multiples.
- **MPC-ready PNG:** render with viewBox = bleed rect so `extend` layers paint the ring. Geometry contract (validated by unit tests, matching `mpc_bleed.py`): aspect exactly 822:1122; bleed = 36/750 of cut width and 36/1050 of cut height per side; minimum output width 1644 px (2× MPC floor); RGB, no alpha.
- **Card JSON:** the document itself.

Pipeline: live SVG → clone → inline fonts (subset WOFF2 → data URI) and images → `drawImage` onto off-screen canvas at target scale → PNG blob → project folder or download. No `html2canvas`, no DOM screenshotting.

## 8. Error handling

- **Schema validation on every load** (zod). Older `schemaVersion` documents run through stepwise migrations; unknown/newer versions get a clear "made with a newer version" message. Never a white screen.
- **Image failures:** broken/missing art renders a labeled placeholder slot in-editor; export is blocked with a specific message rather than silently exporting a hole.
- **Folder permission loss:** detected on save; app falls back to download and offers to re-link the folder.
- **Font load failure:** falls back to system font in-editor with a warning badge; export blocked until fonts resolve (print output must be exact).

## 9. Testing

- **Unit (Vitest):** schema validation & migrations; parameter resolution (default ← palette ← override); export geometry math (5:7 padding, bleed ring fractions, minimum-size upscale — ported from `mpc_bleed.py` as fixtures); move-cost/symbol layout rules.
- **Component:** renderer output for a reference framework+document (stable SVG structure, parameter substitution).
- **Visual regression (after frameworks stabilize):** rendered PNG snapshots per framework × palette at fixed scale.
- **Manual print validation:** first MPC order against the owner's existing `MPC_ready` outputs is the acceptance test for the bleed pipeline.

## 10. Explicitly deferred (each a future spec)

1. **Framework editor** — the full "create custom framework from a blank card" toolbar: drawing shapes, defining slots, editing layer trees in-app. (v1's data model is its foundation; v1's Design mode is its shallow end.)
2. **Channel landing wheel** — big horizontal wheel choosing Pokémon / MTG / custom; v1 boots straight into the Pokémon editor.
3. **More channels & eras** — MTG, generic custom channel, Sword & Shield / HGSS framework packs, Trainer & Energy supertypes.
4. **Community sharing** — gallery/marketplace for framework packs beyond file-swapping.
5. **Card backs, batch/deck export, print sheets.**
6. **Accounts/cloud** — never, per owner decision.

## 11. Success criteria

1. A user with no instructions can produce a finished S&V-style Pokémon card (art, moves, all fields) and download a PNG in under 10 minutes.
2. The same card exports an MPC-ready PNG whose geometry matches the §7 contract (verified by tests + a real MPC order).
3. Recoloring a card to any of the 11 types requires one click; arbitrary frame colors require two.
4. Adding a hypothetical second channel requires no edits inside `core/` or `editor/` (verified in code review against the registry interface).
5. Refreshing mid-edit loses nothing in any supported browser.
6. All framework definitions are JSON reviewable in a PR — no card chrome is a raster image in the built-in S&V pack.

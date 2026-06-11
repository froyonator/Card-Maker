# Architecture

> Status: M1 engine foundation built. Authoritative design: `docs/superpowers/specs/2026-06-11-card-maker-mvp-design.md`.

Four modules, hard boundaries (dependency direction: editor/export → channels → core; core depends on nothing):

- **`src/core/`** — engine. `geometry.ts` (750×1050 design space = MPC cut; 36-unit bleed ring; export size math), `schema.ts` (zod: Framework, CardDocument, layer union, SymbolDef), `params.ts` (default ← palette ← override; `$ref` paint resolution, magenta fallback for unknown refs), `text.ts` (deterministic greedy wrap with injectable measurer), `render/CardRenderer.tsx` ((framework, card) → SVG; `data-layer`/`data-slot` attrs are the hit-testing contract).
- **`src/channels/`** — content packs. `registry.ts` (id → ChannelDefinition), `pokemon/` (S&V Basic framework v0, 11 type palettes, v0 symbols, Fill-rail field sections). Adding a channel = new folder + `registerChannel`, zero core edits.
- **`src/export/`** — `raster.ts`: serialize live SVG → Image → canvas at export size → PNG blob. MPC export uses the bleed-mode render (viewBox `-36 -36 822 1122`) so `extend` layers genuinely paint the ring.
- **`src/editor/`** — not built yet (M2): stores, Fill/Design rails, click-to-edit, pro-studio theme.

Key invariants:
- Framework coordinate space is 750×1050; bleed layers draw past it; trim-mode viewBox crops them.
- All card chrome in built-in frameworks is vector; image layers exist for user art and community raster bases.
- Text layout is deterministic (no foreignObject) so exports match the editor.
- M1 dev harness lives in `App.tsx`; M2 replaces it with the real editor.

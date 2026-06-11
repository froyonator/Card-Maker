# M1.5 - Template Fidelity and Asset Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the S&V Basic framework look like a real Scarlet & Violet card instead of a wireframe, wire authentic per-section typography with legally shippable fonts, and add a tool that converts template images into framework layer code.

**Architecture:** Three additions to the M1 engine. (1) Schema grows gradient paints and per-layer font roles, since the real frame is built from gradients and era-accurate type. (2) The Pokemon channel gets a font role map backed by free substitutes loaded via Fontsource. (3) A standalone Python tool (`tools/`) traces any raster image into framework `shape` layers using vtracer, for converting template scans and future community art into code.

**Tech Stack:** Existing M1 stack, plus @fontsource packages (OFL fonts) and Python 3 + vtracer for the tracer tool.

**Reference material:** `reference/pokecardmaker` (gitignored clone of karl/pokecardmaker.net) and the user-provided S&V template screenshots. Font roles extracted from that repo's source are recorded in `.claude/knowledge/research/pokemon-card-fonts.md`.

**Legal constraints (binding for this plan):**
- Official template scans and traced derivatives of them are never committed. They live under `reference/` (gitignored).
- Proprietary fonts (Gill Sans, Futura, Frutiger, Optima) are never committed. The app bundles OFL substitutes.
- Committed frameworks are hand-authored vector recreations of the card layout.

---

### Task 1: Font research notes

**Files:** Create: `.claude/knowledge/research/pokemon-card-fonts.md`

- [ ] **Step 1:** Write the role table (section, authentic font, shipped substitute, Fontsource package). Roles: name, hp number, hp prefix, attack/ability name, body text, damage number, illustrator, set number, flavor text, stage label, symbols (drawn as SVG, no font).
- [ ] **Step 2:** Commit: `docs: record Pokemon card font roles and substitutes`

### Task 2: Schema support for gradients and font roles

**Files:** Modify: `src/core/schema.ts`, `src/core/params.ts`, `src/core/render/CardRenderer.tsx`; Tests: `src/core/schema.test.ts`, `src/core/render/CardRenderer.test.tsx`

- [ ] **Step 1:** Failing tests: a shape layer accepts `fill: { type: "linear", angle: 90, stops: [{ offset: 0, color: "$frameColor" }, { offset: 1, color: "#ffffff" }] }`; renderer emits a `<linearGradient>` def and references it; text layer accepts `fontRole: "attackName"`, `letterSpacing`, `italic`; renderer sets `font-family` from a `fonts` prop mapping role to family string.
- [ ] **Step 2:** Implement: `PaintSchema = string | LinearGradient`; gradient ids derived from layer id; `resolveStops` runs each stop color through `resolvePaint`. `CardRendererProps` gains `fonts?: Record<string, string>`.
- [ ] **Step 3:** All tests green. Commit: `feat: gradient paints and font roles in the engine`

### Task 3: Shipped fonts

**Files:** Create: `src/channels/pokemon/fonts.ts`; Modify: `src/main.tsx` (font CSS imports), `package.json`

- [ ] **Step 1:** `npm install @fontsource/cabin @fontsource/cabin-condensed @fontsource/jost @fontsource/inter @fontsource/tenor-sans`
- [ ] **Step 2:** `fonts.ts` exports `POKEMON_FONTS: Record<string, string>` mapping every role from Task 1 to a CSS family string. Import the needed weights in `main.tsx`.
- [ ] **Step 3:** Harness passes `fonts={POKEMON_FONTS}` to the renderer. Visual check in preview. Commit: `feat: per-role typography with OFL substitute fonts`

### Task 4: Image-to-framework tracer tool

**Files:** Create: `tools/img2framework.py`, `tools/README.md`; Modify: `.gitignore` (`reference/` already ignored; add `tools/__pycache__/`)

- [ ] **Step 1:** `pip install vtracer`. Script CLI: `python tools/img2framework.py input.png -o out.json [--max-colors N] [--param frameColor=#f2cf45]`. Pipeline: vtracer traces PNG to SVG (color mode, layered); parse SVG paths + fills; scale coordinates into the 750x1050 design space; emit a JSON array of `shape` layers; colors matching a `--param` value (within tolerance) are replaced by the `$param` reference.
- [ ] **Step 2:** Run on a reference template into `reference/generated/` (gitignored). Sanity-check the JSON loads through `FrameworkSchema` (small Node check script or vitest temp test).
- [ ] **Step 3:** `tools/README.md`: what it does, usage, the rule that traced official templates stay local. Commit: `feat: image-to-framework tracer tool`

### Task 5: S&V Basic framework v1

**Files:** Modify: `src/channels/pokemon/frameworks/sv-basic.ts`, `src/channels/pokemon/palettes.ts`, `src/App.tsx` (sample card fields as needed); Tests: existing channel tests keep passing

- [ ] **Step 1:** Rebuild the layer list against the reference proportions: silver outer border (vertical gray gradient, rounded corners), inner frame in type color (yellow gradient for lightning), art window with thin silver bezel, name bar (stage chip top-left, name, HP right, type symbol disc top-right), move/ability area on the lower half, type bar with thin double rules and weakness/resistance/retreat labels, footer with illustrator, regulation/set marks, copyright line. All colors via parameters so palettes still recolor everything.
- [ ] **Step 2:** Palette pass: two-stop gradient colors per type (light + dark frame tones).
- [ ] **Step 3:** Verify in preview against the user's reference screenshots; iterate until the structure reads as an S&V card. Tests green. Commit: `feat: S&V Basic framework v1 visuals`

### Task 6: Wrap-up

- [ ] Roll CHANGELOG `[Unreleased]` into 0.3.0, bump `package.json`, push, verify clean status.

## Out of scope

- Pixel-perfect parity with official scans (iterative; the tracer tool covers exact local needs).
- Full Art variant, abilities as a separate block type, multi-move layouts: next framework iteration.
- The M2 editor (separate plan, unchanged).

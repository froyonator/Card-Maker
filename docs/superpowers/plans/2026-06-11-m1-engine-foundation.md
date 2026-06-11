# M1 — Engine Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Vite+React+TS app with the core SVG engine — schema, parameter resolution, text layout, renderer, MPC geometry — plus a first S&V Basic Pokémon framework and raster export, proven in a dev harness page.

**Architecture:** Four-module layout per the MVP spec (`src/core`, `src/channels`, `src/editor`, `src/export`). Framework coordinate space is **750×1050 user units = the MPC cut size** (2.5″×3.5″ @ 300 DPI); bleed extends 36 units per side (822×1122). Frameworks are typed TS objects validated by zod schemas (community packs later load the same shape as JSON). M1 ships no interactive editor — `App.tsx` is a dev harness rendering a sample card with export buttons. M2 (editor UX) and M3 (persistence/export polish) are separate plans.

**Tech Stack:** Vite, React 18, TypeScript (strict), zod, Vitest (+jsdom).

**Spec:** `docs/superpowers/specs/2026-06-11-card-maker-mvp-design.md`. **Repo:** `C:\dev\card-maker`, branch `main`, inline execution.

---

## File structure (end state of M1)

```
src/
├── core/
│   ├── geometry.ts          # canvas/bleed/export-size math (port of mpc_bleed.py constants)
│   ├── geometry.test.ts
│   ├── schema.ts            # zod schemas + inferred types: Framework, CardDocument, Layer
│   ├── schema.test.ts
│   ├── params.ts            # parameter resolution: defaults ← palette ← overrides; $ref lookup
│   ├── params.test.ts
│   ├── text.ts              # greedy line-wrap with injectable measurer
│   ├── text.test.ts
│   └── render/
│       ├── CardRenderer.tsx # (framework, card, params) → <svg>; one subcomponent per layer kind
│       └── CardRenderer.test.tsx
├── channels/
│   ├── types.ts             # ChannelDefinition, ParameterPreset, SymbolDef, FieldSection
│   ├── registry.ts          # registerChannel / getChannel / listChannels
│   ├── registry.test.ts
│   └── pokemon/
│       ├── index.ts         # the pokemon ChannelDefinition (registers palettes, frameworks, symbols)
│       ├── palettes.ts      # 11 energy-type parameter presets
│       ├── symbols.tsx      # energy symbols as SVG path data
│       ├── frameworks/sv-basic.ts        # first framework: S&V Basic Pokémon (v0 visuals)
│       └── pokemon.test.ts  # framework validates against schema; registry round-trip
├── export/
│   ├── raster.ts            # SVG element → PNG blob at export kind × scale
│   └── raster.test.ts       # pure geometry paths (blob path is browser-manual in M1)
├── App.tsx                  # dev harness: sample card + export buttons
└── main.tsx
```

---

### Task 1: Scaffold Vite + React + TS with Vitest

**Files:** Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `index.html` (via scaffolder, then trimmed)

- [ ] **Step 1: Scaffold in repo root**

```powershell
Set-Location C:\dev\card-maker
npm create vite@latest . -- --template react-ts
npm install
npm install zod
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

(Scaffolder may warn the directory is non-empty — choose "Ignore files and continue". If it refuses non-interactively, scaffold into `tmp-scaffold/`, move contents up, delete `tmp-scaffold/`.)

- [ ] **Step 2: Strip template noise**

Delete `src/App.css`, `src/assets/react.svg`, `public/vite.svg`; replace `src/App.tsx` with a placeholder and `src/index.css` with a minimal reset:

```tsx
// src/App.tsx
export default function App() {
  return <main style={{ padding: 32 }}>card maker — engine harness (M1)</main>;
}
```

```css
/* src/index.css */
* { box-sizing: border-box; margin: 0; }
body { background: #161618; color: #e8e8ea; font-family: system-ui, sans-serif; }
```

- [ ] **Step 3: Wire Vitest + strict TS**

Add to `vite.config.ts` (vitest config in the same file, with a triple-slash reference):

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true },
});
```

Confirm `tsconfig.app.json` has `"strict": true` (Vite template default — verify, don't assume). Add `"types": ["vitest/globals"]` to its compilerOptions.

Add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Smoke-verify**

Run: `npm run dev` (background) — expect Vite serving on localhost with the placeholder text. Then `npm run build` — expect clean TS build. Then `npm run test` — expect "no test files found" exit 0 (or add a trivial `expect(true).toBe(true)` spec and delete it in Task 2).

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript app with Vitest"
```

---

### Task 2: Geometry module (the mpc_bleed.py contract)

**Files:** Create: `src/core/geometry.ts`, Test: `src/core/geometry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/core/geometry.test.ts
import { describe, it, expect } from "vitest";
import {
  CUT_W, CUT_H, BLEED, TRIM_VIEWBOX, BLEED_VIEWBOX, MPC_MIN_WIDTH,
  exportPixelSize,
} from "./geometry";

describe("geometry constants", () => {
  it("matches the MPC poker spec from mpc_bleed.py", () => {
    expect(CUT_W).toBe(750);
    expect(CUT_H).toBe(1050);
    expect(BLEED).toBe(36);
    expect(CUT_W / CUT_H).toBeCloseTo(5 / 7, 10);
  });
  it("viewBoxes: trim is the cut, bleed extends 36 on every side", () => {
    expect(TRIM_VIEWBOX).toEqual({ x: 0, y: 0, w: 750, h: 1050 });
    expect(BLEED_VIEWBOX).toEqual({ x: -36, y: -36, w: 822, h: 1122 });
  });
});

describe("exportPixelSize", () => {
  it("share: cut size × scale", () => {
    expect(exportPixelSize({ kind: "share", scale: 1 })).toEqual({ width: 750, height: 1050 });
    expect(exportPixelSize({ kind: "share", scale: 4 })).toEqual({ width: 3000, height: 4200 });
  });
  it("share: custom width derives height on the 5:7 aspect", () => {
    expect(exportPixelSize({ kind: "share", customWidth: 1000 })).toEqual({ width: 1000, height: 1400 });
  });
  it("print: 300 DPI cut size (scale multiplies)", () => {
    expect(exportPixelSize({ kind: "print", scale: 1 })).toEqual({ width: 750, height: 1050 });
    expect(exportPixelSize({ kind: "print", scale: 2 })).toEqual({ width: 1500, height: 2100 });
  });
  it("mpc: 822:1122 aspect exactly", () => {
    const { width, height } = exportPixelSize({ kind: "mpc", scale: 2 });
    expect(width / height).toBeCloseTo(822 / 1122, 10);
  });
  it("mpc: enforces the 1644px minimum width (2× MPC floor)", () => {
    expect(exportPixelSize({ kind: "mpc", scale: 1 }).width).toBe(1644);
    expect(exportPixelSize({ kind: "mpc", scale: 2 })).toEqual({ width: 1644, height: 2244 });
    expect(exportPixelSize({ kind: "mpc", scale: 4 })).toEqual({ width: 3288, height: 4488 });
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm run test -- geometry` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/core/geometry.ts
/** Card design space: MPC poker cut, 2.5"x3.5" at 300 DPI. One user unit = one 300-DPI pixel. */
export const CUT_W = 750;
export const CUT_H = 1050;
/** Bleed per side, same units (3.05mm at 300 DPI). MPC trims this off. */
export const BLEED = 36;
/** MPC rejects uploads narrower than 822px; we floor at 2x for quality. */
export const MPC_MIN_WIDTH = 1644;

export interface ViewBox { x: number; y: number; w: number; h: number; }
export const TRIM_VIEWBOX: ViewBox = { x: 0, y: 0, w: CUT_W, h: CUT_H };
export const BLEED_VIEWBOX: ViewBox = { x: -BLEED, y: -BLEED, w: CUT_W + 2 * BLEED, h: CUT_H + 2 * BLEED };

export type ExportKind = "share" | "print" | "mpc";
export interface ExportRequest { kind: ExportKind; scale?: number; customWidth?: number; }
export interface PixelSize { width: number; height: number; }

export function exportPixelSize(req: ExportRequest): PixelSize {
  const aspectBox = req.kind === "mpc" ? BLEED_VIEWBOX : TRIM_VIEWBOX;
  let width: number;
  if (req.customWidth !== undefined) {
    width = Math.round(req.customWidth);
  } else {
    width = aspectBox.w * (req.scale ?? 1);
  }
  if (req.kind === "mpc" && width < MPC_MIN_WIDTH) width = MPC_MIN_WIDTH;
  const height = Math.round(width * (aspectBox.h / aspectBox.w));
  return { width, height };
}
```

- [ ] **Step 4: Verify pass** — `npm run test -- geometry` → all green.

- [ ] **Step 5: Commit** — `git add src/core; git commit -m "feat: card/MPC geometry module with mpc_bleed.py contract tests"`

---

### Task 3: Schema (Framework, CardDocument, layers)

**Files:** Create: `src/core/schema.ts`, Test: `src/core/schema.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/core/schema.test.ts
import { describe, it, expect } from "vitest";
import { FrameworkSchema, CardDocumentSchema, type Framework } from "./schema";

export const tinyFramework: Framework = {
  schemaVersion: 1,
  id: "test.tiny", version: "0.1.0", channelId: "test", name: "Tiny", variant: "basic",
  parameters: [
    { name: "frameColor", type: "color", default: "#c0c0c0" },
    { name: "showBadge", type: "boolean", default: true },
  ],
  layers: [
    { kind: "shape", id: "border", bleed: "extend", shape: { type: "rect", x: 0, y: 0, w: 750, h: 1050, rx: 28 }, fill: "$frameColor" },
    { kind: "image", id: "art", slot: "art", x: 60, y: 120, w: 630, h: 460, fit: "cover" },
    { kind: "text", id: "name", slot: "name", x: 70, y: 50, w: 480, size: 44, weight: 700, align: "start", color: "#1a1a1a", maxLines: 1 },
    {
      kind: "group", id: "badge", visibleIf: "showBadge",
      children: [{ kind: "shape", id: "badge-bg", bleed: "clip", shape: { type: "ellipse", cx: 690, cy: 60, rx: 30, ry: 30 }, fill: "#ffcc00" }],
    },
  ],
};

describe("FrameworkSchema", () => {
  it("accepts a valid framework", () => {
    expect(FrameworkSchema.parse(tinyFramework)).toBeTruthy();
  });
  it("rejects unknown layer kinds", () => {
    const bad = { ...tinyFramework, layers: [{ kind: "hologram", id: "x" }] };
    expect(FrameworkSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a missing required field (id)", () => {
    const bad = { ...tinyFramework, id: undefined };
    expect(FrameworkSchema.safeParse(bad).success).toBe(false);
  });
});

describe("CardDocumentSchema", () => {
  it("accepts a valid document", () => {
    const doc = {
      schemaVersion: 1,
      channelId: "test", frameworkId: "test.tiny", frameworkVersion: "0.1.0",
      fields: { name: "Dedenne", art: { src: "blob:fake", naturalW: 600, naturalH: 400 } },
      overrides: { paletteId: "lightning", parameters: { frameColor: "#f5d442" } },
      meta: { title: "My card", createdAt: "2026-06-11T00:00:00Z", modifiedAt: "2026-06-11T00:00:00Z" },
    };
    expect(CardDocumentSchema.parse(doc)).toBeTruthy();
  });
  it("rejects a field value of the wrong shape", () => {
    const bad = { schemaVersion: 1, channelId: "t", frameworkId: "t", frameworkVersion: "0.1.0",
      fields: { art: 42 }, overrides: {}, meta: { title: "", createdAt: "", modifiedAt: "" } };
    expect(CardDocumentSchema.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Verify failure** — `npm run test -- schema` → FAIL.

- [ ] **Step 3: Implement**

```ts
// src/core/schema.ts
import { z } from "zod";

/** Bump when the document shape changes; migrations key off this. */
export const SCHEMA_VERSION = 1;

const ParameterSchema = z.discriminatedUnion("type", [
  z.object({ name: z.string().min(1), type: z.literal("color"), default: z.string() }),
  z.object({ name: z.string().min(1), type: z.literal("number"), default: z.number() }),
  z.object({ name: z.string().min(1), type: z.literal("boolean"), default: z.boolean() }),
  z.object({ name: z.string().min(1), type: z.literal("font"), default: z.string() }),
]);

const ShapeGeom = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rect"), x: z.number(), y: z.number(), w: z.number(), h: z.number(), rx: z.number().optional() }),
  z.object({ type: z.literal("ellipse"), cx: z.number(), cy: z.number(), rx: z.number(), ry: z.number() }),
  z.object({ type: z.literal("path"), d: z.string() }),
]);

/** Paint value: literal color or "$parameterName" reference. */
const Paint = z.string();

const BaseLayer = { id: z.string().min(1) };

const ShapeLayer = z.object({
  ...BaseLayer, kind: z.literal("shape"),
  shape: ShapeGeom, fill: Paint.optional(), stroke: Paint.optional(), strokeWidth: z.number().optional(),
  bleed: z.enum(["extend", "clip"]),
});
const TextLayer = z.object({
  ...BaseLayer, kind: z.literal("text"),
  slot: z.string().min(1), x: z.number(), y: z.number(), w: z.number(),
  size: z.number(), weight: z.number().optional(), align: z.enum(["start", "middle", "end"]).optional(),
  color: Paint, maxLines: z.number().int().positive().optional(), lineHeight: z.number().optional(),
});
const ImageLayer = z.object({
  ...BaseLayer, kind: z.literal("image"),
  slot: z.string().min(1), x: z.number(), y: z.number(), w: z.number(), h: z.number(),
  fit: z.enum(["cover", "contain"]),
});
const SymbolLayer = z.object({
  ...BaseLayer, kind: z.literal("symbol"),
  symbolId: z.string().min(1), x: z.number(), y: z.number(), size: z.number(),
});

export type LayerInput =
  | z.infer<typeof ShapeLayer> | z.infer<typeof TextLayer>
  | z.infer<typeof ImageLayer> | z.infer<typeof SymbolLayer>
  | { kind: "group"; id: string; visibleIf?: string; children: LayerInput[] };

const LayerSchema: z.ZodType<LayerInput> = z.lazy(() =>
  z.union([
    ShapeLayer, TextLayer, ImageLayer, SymbolLayer,
    z.object({ ...BaseLayer, kind: z.literal("group"), visibleIf: z.string().optional(), children: z.array(LayerSchema) }),
  ]),
);

export const FrameworkSchema = z.object({
  schemaVersion: z.number().int(),
  id: z.string().min(1), version: z.string().min(1), channelId: z.string().min(1),
  name: z.string().min(1), variant: z.string().min(1),
  parameters: z.array(ParameterSchema),
  layers: z.array(LayerSchema),
});

const ImageValue = z.object({ src: z.string(), naturalW: z.number(), naturalH: z.number() });
const FieldValue = z.union([z.string(), ImageValue]);

export const CardDocumentSchema = z.object({
  schemaVersion: z.number().int(),
  channelId: z.string().min(1), frameworkId: z.string().min(1), frameworkVersion: z.string().min(1),
  fields: z.record(z.string(), FieldValue),
  overrides: z.object({
    paletteId: z.string().optional(),
    parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),
  meta: z.object({ title: z.string(), createdAt: z.string(), modifiedAt: z.string() }),
});

export type Framework = z.infer<typeof FrameworkSchema>;
export type Layer = LayerInput;
export type CardDocument = z.infer<typeof CardDocumentSchema>;
export type ImageFieldValue = z.infer<typeof ImageValue>;
```

- [ ] **Step 4: Verify pass** — `npm run test -- schema` → green.

- [ ] **Step 5: Commit** — `git commit -m "feat: zod schemas for Framework and CardDocument"`

---

### Task 4: Parameter resolution

**Files:** Create: `src/core/params.ts`, Test: `src/core/params.test.ts`

- [ ] **Step 1: Failing tests**

```ts
// src/core/params.test.ts
import { describe, it, expect } from "vitest";
import { resolveParams, resolvePaint } from "./params";
import { tinyFramework } from "./schema.test";

const palette = { id: "lightning", values: { frameColor: "#f5d442" } };

describe("resolveParams", () => {
  it("uses framework defaults when nothing else is given", () => {
    expect(resolveParams(tinyFramework)).toEqual({ frameColor: "#c0c0c0", showBadge: true });
  });
  it("palette beats default", () => {
    expect(resolveParams(tinyFramework, palette).frameColor).toBe("#f5d442");
  });
  it("card override beats palette", () => {
    expect(resolveParams(tinyFramework, palette, { frameColor: "#112233" }).frameColor).toBe("#112233");
  });
  it("override of an undeclared parameter is ignored", () => {
    expect(resolveParams(tinyFramework, undefined, { nope: "#fff" })).not.toHaveProperty("nope");
  });
});

describe("resolvePaint", () => {
  const params = resolveParams(tinyFramework, palette);
  it("passes literals through", () => expect(resolvePaint("#abcdef", params)).toBe("#abcdef"));
  it("resolves $refs", () => expect(resolvePaint("$frameColor", params)).toBe("#f5d442"));
  it("falls back to magenta for unknown refs (visible failure beats silent black)", () =>
    expect(resolvePaint("$missing", params)).toBe("#ff00ff"));
});
```

- [ ] **Step 2: Verify failure.** `npm run test -- params` → FAIL.

- [ ] **Step 3: Implement**

```ts
// src/core/params.ts
import type { Framework } from "./schema";

export type ParamValue = string | number | boolean;
export type ResolvedParams = Record<string, ParamValue>;
export interface ParameterPreset { id: string; values: Record<string, ParamValue>; }

/** Precedence: framework default ← palette preset ← per-card override. Unknown keys are dropped. */
export function resolveParams(
  framework: Framework,
  palette?: ParameterPreset,
  overrides?: Record<string, ParamValue>,
): ResolvedParams {
  const out: ResolvedParams = {};
  for (const p of framework.parameters) {
    out[p.name] = p.default;
    if (palette && p.name in palette.values) out[p.name] = palette.values[p.name];
    if (overrides && p.name in overrides) out[p.name] = overrides[p.name];
  }
  return out;
}

/** "$name" → parameter value; anything else is a literal. Unknown ref renders magenta so it's seen. */
export function resolvePaint(paint: string, params: ResolvedParams): string {
  if (!paint.startsWith("$")) return paint;
  const v = params[paint.slice(1)];
  return typeof v === "string" ? v : "#ff00ff";
}
```

- [ ] **Step 4: Verify pass.** **Step 5: Commit** — `git commit -m "feat: parameter resolution with default/palette/override precedence"`

---

### Task 5: Text wrapping

**Files:** Create: `src/core/text.ts`, Test: `src/core/text.test.ts`

- [ ] **Step 1: Failing tests**

```ts
// src/core/text.test.ts
import { describe, it, expect } from "vitest";
import { wrapText } from "./text";

/** Fake measurer: every char is 10 units wide. */
const measure = (s: string) => s.length * 10;

describe("wrapText", () => {
  it("keeps short text on one line", () => {
    expect(wrapText("hello", 100, measure)).toEqual(["hello"]);
  });
  it("wraps greedily at word boundaries", () => {
    expect(wrapText("draw any two energy", 100, measure)).toEqual(["draw any", "two", "energy"]);
  });
  it("respects maxLines with ellipsis on the last line", () => {
    // lines at width 30 are ["a b","c d","e f","g h"]; "c d…" measures 40 > 30, so it trims to "c…"
    expect(wrapText("a b c d e f g h", 30, measure, 2)).toEqual(["a b", "c…"]);
  });
  it("breaks a single over-long word by characters", () => {
    expect(wrapText("supercalifragilistic", 50, measure)).toEqual(["super", "calif", "ragil", "istic"]);
  });
  it("returns [] for empty text", () => {
    expect(wrapText("", 100, measure)).toEqual([]);
  });
});
```

- [ ] **Step 2: Verify failure.**

- [ ] **Step 3: Implement**

```ts
// src/core/text.ts
export type Measure = (s: string) => number;

/** Greedy word-wrap. Deterministic given a measurer, so it is export-safe (no foreignObject). */
export function wrapText(text: string, maxWidth: number, measure: Measure, maxLines?: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let line = "";

  const pushWord = (word: string) => {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= maxWidth) { line = candidate; return; }
    if (line) { lines.push(line); line = ""; }
    // single word wider than the box: hard-break by characters
    let chunk = "";
    for (const ch of word) {
      if (measure(chunk + ch) > maxWidth && chunk) { lines.push(chunk); chunk = ""; }
      chunk += ch;
    }
    line = chunk;
  };

  for (const word of text.split(/\s+/)) pushWord(word);
  if (line) lines.push(line);

  if (maxLines !== undefined && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(last.trimEnd() + "…") > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = last.trimEnd() + "…";
    return kept;
  }
  return lines;
}
```

- [ ] **Step 4: Verify pass.** **Step 5: Commit** — `git commit -m "feat: deterministic greedy text wrapping"`

---

### Task 6: CardRenderer

**Files:** Create: `src/core/render/CardRenderer.tsx`, Test: `src/core/render/CardRenderer.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
// src/core/render/CardRenderer.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CardRenderer } from "./CardRenderer";
import { tinyFramework } from "../schema.test";
import type { CardDocument } from "../schema";

const doc: CardDocument = {
  schemaVersion: 1, channelId: "test", frameworkId: "test.tiny", frameworkVersion: "0.1.0",
  fields: { name: "Dedenne" },
  overrides: { parameters: { frameColor: "#f5d442", showBadge: false } },
  meta: { title: "t", createdAt: "", modifiedAt: "" },
};

function svg(showBleed = false) {
  const { container } = render(<CardRenderer framework={tinyFramework} card={doc} mode={showBleed ? "bleed" : "trim"} />);
  return container.querySelector("svg")!;
}

describe("CardRenderer", () => {
  it("renders an svg with the trim viewBox by default", () => {
    expect(svg().getAttribute("viewBox")).toBe("0 0 750 1050");
  });
  it("bleed mode swaps the viewBox to the bleed rect", () => {
    expect(svg(true).getAttribute("viewBox")).toBe("-36 -36 822 1122");
  });
  it("substitutes parameters into fills", () => {
    expect(svg().querySelector('[data-layer="border"]')!.getAttribute("fill")).toBe("#f5d442");
  });
  it("renders text slot content from the document", () => {
    expect(svg().textContent).toContain("Dedenne");
  });
  it("hides groups whose visibleIf parameter is false", () => {
    expect(svg().querySelector('[data-layer="badge-bg"]')).toBeNull();
  });
  it("renders a placeholder for unfilled image slots", () => {
    expect(svg().querySelector('[data-slot="art"][data-placeholder="true"]')).not.toBeNull();
  });
  it("every layer carries data-layer for hit-testing", () => {
    expect(svg().querySelectorAll("[data-layer]").length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Verify failure.**

- [ ] **Step 3: Implement**

```tsx
// src/core/render/CardRenderer.tsx
import { TRIM_VIEWBOX, BLEED_VIEWBOX, type ViewBox } from "../geometry";
import { resolveParams, resolvePaint, type ResolvedParams, type ParameterPreset } from "../params";
import { wrapText } from "../text";
import type { CardDocument, Framework, Layer, ImageFieldValue } from "../schema";

export interface CardRendererProps {
  framework: Framework;
  card: CardDocument;
  palette?: ParameterPreset;
  /** trim = editing view; bleed = MPC export view (extend layers paint the ring). */
  mode?: "trim" | "bleed";
  /** Approximate character width factor for text measurement (canvas-accurate measurer arrives in M2). */
  onElementClick?: (layerId: string, slot?: string) => void;
}

const vbAttr = (v: ViewBox) => `${v.x} ${v.y} ${v.w} ${v.h}`;
/** jsdom/test-safe width approximation; replaced by canvas measureText injection in M2. */
const approxMeasure = (size: number) => (s: string) => s.length * size * 0.55;

export function CardRenderer({ framework, card, palette, mode = "trim", onElementClick }: CardRendererProps) {
  const params = resolveParams(framework, palette, card.overrides.parameters);
  const clip = mode === "trim";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vbAttr(mode === "bleed" ? BLEED_VIEWBOX : TRIM_VIEWBOX)}
      data-card-root="true"
    >
      {framework.layers.map((l) => (
        <LayerEl key={l.id} layer={l} params={params} card={card} clipExtend={clip} onClick={onElementClick} />
      ))}
    </svg>
  );
}

interface LayerElProps {
  layer: Layer; params: ResolvedParams; card: CardDocument;
  clipExtend: boolean; onClick?: (layerId: string, slot?: string) => void;
}

function LayerEl({ layer, params, card, clipExtend, onClick }: LayerElProps) {
  switch (layer.kind) {
    case "group": {
      if (layer.visibleIf !== undefined && params[layer.visibleIf] !== true) return null;
      return (
        <g data-layer={layer.id}>
          {layer.children.map((c) => (
            <LayerEl key={c.id} layer={c} params={params} card={card} clipExtend={clipExtend} onClick={onClick} />
          ))}
        </g>
      );
    }
    case "shape": {
      const common = {
        "data-layer": layer.id,
        fill: layer.fill ? resolvePaint(layer.fill, params) : "none",
        stroke: layer.stroke ? resolvePaint(layer.stroke, params) : undefined,
        strokeWidth: layer.strokeWidth,
        onClick: onClick ? () => onClick(layer.id) : undefined,
      };
      const s = layer.shape;
      if (s.type === "rect") return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
      if (s.type === "ellipse") return <ellipse {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
      return <path {...common} d={s.d} />;
    }
    case "text": {
      const raw = card.fields[layer.slot];
      const value = typeof raw === "string" ? raw : "";
      const lines = wrapText(value, layer.w, approxMeasure(layer.size), layer.maxLines);
      const lh = (layer.lineHeight ?? 1.15) * layer.size;
      const anchorX = layer.align === "middle" ? layer.x + layer.w / 2 : layer.align === "end" ? layer.x + layer.w : layer.x;
      return (
        <text
          data-layer={layer.id} data-slot={layer.slot}
          x={anchorX} y={layer.y} fontSize={layer.size} fontWeight={layer.weight}
          textAnchor={layer.align ?? "start"} fill={resolvePaint(layer.color, params)}
          onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
        >
          {lines.map((line, i) => (
            <tspan key={i} x={anchorX} dy={i === 0 ? 0 : lh}>{line}</tspan>
          ))}
        </text>
      );
    }
    case "image": {
      const v = card.fields[layer.slot];
      const img = typeof v === "object" && v !== null ? (v as ImageFieldValue) : undefined;
      if (!img) {
        return (
          <rect
            data-layer={layer.id} data-slot={layer.slot} data-placeholder="true"
            x={layer.x} y={layer.y} width={layer.w} height={layer.h}
            fill="#2a2a2e" stroke="#4a4a4e" strokeDasharray="8 6"
            onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
          />
        );
      }
      return (
        <image
          data-layer={layer.id} data-slot={layer.slot}
          href={img.src} x={layer.x} y={layer.y} width={layer.w} height={layer.h}
          preserveAspectRatio={layer.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
          onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
        />
      );
    }
    case "symbol":
      // Symbol rendering needs the channel's symbol table; wired in Task 7 via SymbolContext.
      return <g data-layer={layer.id} data-symbol={layer.symbolId} transform={`translate(${layer.x} ${layer.y}) scale(${layer.size / 100})`} />;
  }
}
```

Note: `clipExtend` is accepted but clipping `extend` layers at trim is achieved by the viewBox itself in trim mode (geometry outside `0 0 750 1050` simply isn't visible). The flag exists so M3's export path can assert behavior; no clipPath element is needed in M1.

- [ ] **Step 4: Verify pass** — `npm run test -- CardRenderer` → green. (jsdom renders SVG attributes; that is all these tests assert.)

- [ ] **Step 5: Commit** — `git commit -m "feat: SVG CardRenderer for shape/text/image/group layers"`

---

### Task 7: Channel registry + Pokémon channel with S&V Basic framework

**Files:** Create: `src/channels/types.ts`, `src/channels/registry.ts`, `src/channels/pokemon/palettes.ts`, `src/channels/pokemon/symbols.tsx`, `src/channels/pokemon/frameworks/sv-basic.ts`, `src/channels/pokemon/index.ts`, Tests: `src/channels/registry.test.ts`, `src/channels/pokemon/pokemon.test.ts`

- [ ] **Step 1: Failing tests**

```ts
// src/channels/registry.test.ts
import { describe, it, expect } from "vitest";
import { registerChannel, getChannel, listChannels } from "./registry";
import type { ChannelDefinition } from "./types";

const fake: ChannelDefinition = { id: "fake", name: "Fake", frameworks: [], palettes: [], symbols: [], fieldSections: [] };

describe("channel registry", () => {
  it("round-trips a registration", () => {
    registerChannel(fake);
    expect(getChannel("fake")).toBe(fake);
    expect(listChannels().some((c) => c.id === "fake")).toBe(true);
  });
  it("throws on unknown channel", () => {
    expect(() => getChannel("nope")).toThrow(/unknown channel/i);
  });
  it("rejects duplicate ids", () => {
    expect(() => registerChannel(fake)).toThrow(/already registered/i);
  });
});
```

```ts
// src/channels/pokemon/pokemon.test.ts
import { describe, it, expect } from "vitest";
import { FrameworkSchema } from "../../core/schema";
import { pokemonChannel } from "./index";
import { TYPE_PALETTES } from "./palettes";

describe("pokemon channel", () => {
  it("every framework validates against the schema", () => {
    for (const fw of pokemonChannel.frameworks) {
      const r = FrameworkSchema.safeParse(fw);
      expect(r.success, `framework ${fw.id}: ${!r.success ? r.error.message : ""}`).toBe(true);
    }
  });
  it("ships all 11 energy-type palettes", () => {
    const ids = TYPE_PALETTES.map((p) => p.id).sort();
    expect(ids).toEqual(["colorless", "darkness", "dragon", "fighting", "fire", "grass", "lightning", "metal", "psychic", "water", "fairy"].sort());
  });
  it("sv-basic declares the slots the Fill rail needs", () => {
    const fw = pokemonChannel.frameworks.find((f) => f.id === "pokemon.sv.basic")!;
    const slots = JSON.stringify(fw.layers);
    for (const s of ["name", "hp", "art", "move1.name", "move1.text", "flavorText", "illustrator"]) {
      expect(slots, `missing slot ${s}`).toContain(`"${s}"`);
    }
  });
  it("the outer border extends into bleed", () => {
    const fw = pokemonChannel.frameworks.find((f) => f.id === "pokemon.sv.basic")!;
    const border = fw.layers.find((l) => l.id === "outer-border");
    expect(border && "bleed" in border && border.bleed).toBe("extend");
  });
});
```

- [ ] **Step 2: Verify failure.**

- [ ] **Step 3: Implement the four channel files**

```ts
// src/channels/types.ts
import type { Framework } from "../core/schema";
import type { ParameterPreset } from "../core/params";

export interface SymbolDef { id: string; viewBox: string; paths: { d: string; fill: string }[]; }
export interface FieldDef { slot: string; label: string; input: "text" | "multiline" | "image" | "select"; }
export interface FieldSection { id: string; label: string; fields: FieldDef[]; }

export interface ChannelDefinition {
  id: string;
  name: string;
  frameworks: Framework[];
  palettes: ParameterPreset[];
  symbols: SymbolDef[];
  fieldSections: FieldSection[];
}
```

```ts
// src/channels/registry.ts
import type { ChannelDefinition } from "./types";

const channels = new Map<string, ChannelDefinition>();

export function registerChannel(def: ChannelDefinition): void {
  if (channels.has(def.id)) throw new Error(`channel "${def.id}" already registered`);
  channels.set(def.id, def);
}
export function getChannel(id: string): ChannelDefinition {
  const c = channels.get(id);
  if (!c) throw new Error(`unknown channel "${id}"`);
  return c;
}
export function listChannels(): ChannelDefinition[] {
  return [...channels.values()];
}
```

```ts
// src/channels/pokemon/palettes.ts
import type { ParameterPreset } from "../../core/params";

/** Energy-type palettes: frameColor = card body, accentColor = trims/badges. v0 values, tuned later. */
export const TYPE_PALETTES: ParameterPreset[] = [
  { id: "grass",     values: { frameColor: "#7db74f", accentColor: "#4c7a2e" } },
  { id: "fire",      values: { frameColor: "#e8643c", accentColor: "#a33214" } },
  { id: "water",     values: { frameColor: "#4f9fd8", accentColor: "#2a6ea6" } },
  { id: "lightning", values: { frameColor: "#f2cf45", accentColor: "#b8941f" } },
  { id: "psychic",   values: { frameColor: "#9c6bb3", accentColor: "#6a3f82" } },
  { id: "fighting",  values: { frameColor: "#c97f44", accentColor: "#8f5424" } },
  { id: "darkness",  values: { frameColor: "#3e4757", accentColor: "#1f2530" } },
  { id: "metal",     values: { frameColor: "#a8b0b8", accentColor: "#6f777f" } },
  { id: "dragon",    values: { frameColor: "#b09e54", accentColor: "#7a6c33" } },
  { id: "fairy",     values: { frameColor: "#d878a8", accentColor: "#a64a78" } },
  { id: "colorless", values: { frameColor: "#d8d4cc", accentColor: "#9a968e" } },
];
```

```ts
// src/channels/pokemon/symbols.tsx
import type { SymbolDef } from "../types";

/** v0 energy symbols: type-colored disc + simple glyph. Refined art replaces paths later; ids are stable. */
const disc = (fill: string) => ({ d: "M50 2a48 48 0 1 0 0 96a48 48 0 1 0 0-96z", fill });
export const POKEMON_SYMBOLS: SymbolDef[] = [
  { id: "energy.lightning", viewBox: "0 0 100 100", paths: [disc("#f2cf45"), { d: "M55 12L28 56h16l-8 32l34-48H52z", fill: "#3a3013" }] },
  { id: "energy.fire",      viewBox: "0 0 100 100", paths: [disc("#e8643c"), { d: "M50 14c8 14 22 20 22 38a22 22 0 1 1-44 0c0-10 6-14 8-24c6 6 8 10 8 16c4-8 6-18 6-30z", fill: "#5c1606" }] },
  { id: "energy.water",     viewBox: "0 0 100 100", paths: [disc("#4f9fd8"), { d: "M50 14C38 34 28 46 28 60a22 22 0 1 0 44 0c0-14-10-26-22-46z", fill: "#0e3d62" }] },
  { id: "energy.grass",     viewBox: "0 0 100 100", paths: [disc("#7db74f"), { d: "M50 12C30 28 24 44 28 62c12-2 20-8 24-18c2 10-2 22-12 30c26 0 36-22 30-44c-6 8-10 10-16 12c2-12 0-20-4-30z", fill: "#1d3d0c" }] },
  { id: "energy.psychic",   viewBox: "0 0 100 100", paths: [disc("#9c6bb3"), { d: "M50 18a30 30 0 1 0 14 56l-6-10a18 18 0 1 1 4-30c6 4 8 12 6 18h12c4-16-8-34-30-34z", fill: "#2c1438" }] },
  { id: "energy.fighting",  viewBox: "0 0 100 100", paths: [disc("#c97f44"), { d: "M34 30h10v18h4V26h10v22h4V30h10v34l-10 18H42L32 64z", fill: "#3d1f08" }] },
  { id: "energy.darkness",  viewBox: "0 0 100 100", paths: [disc("#3e4757"), { d: "M58 16a32 32 0 1 0 24 50A36 36 0 0 1 58 16z", fill: "#0b0e14" }] },
  { id: "energy.metal",     viewBox: "0 0 100 100", paths: [disc("#a8b0b8"), { d: "M50 16l30 22l-12 36H32L20 38z", fill: "#3a4046" }] },
  { id: "energy.dragon",    viewBox: "0 0 100 100", paths: [disc("#b09e54"), { d: "M30 60c0-22 18-38 40-38c-6 8-6 14-2 20c8-2 12 0 14 6c-10 16-24 8-30 22c-4-6-2-12 2-16c-10 2-16 2-24 6z", fill: "#3a3210" }] },
  { id: "energy.fairy",     viewBox: "0 0 100 100", paths: [disc("#d878a8"), { d: "M50 14l8 24l26 4l-20 16l6 26l-20-14l-20 14l6-26L16 42l26-4z", fill: "#56102e" }] },
  { id: "energy.colorless", viewBox: "0 0 100 100", paths: [disc("#d8d4cc"), { d: "M50 16l10 24l24 10l-24 10l-10 24l-10-24l-24-10l24-10z", fill: "#55524a" }] },
];
```

```ts
// src/channels/pokemon/frameworks/sv-basic.ts
import type { Framework } from "../../../core/schema";

/**
 * S&V Basic Pokémon, v0 visuals.
 * Geometry references: 750x1050 design space (Task 2). Proportions taken from S&V card scans:
 * art window ~86% width starting ~12% down; name bar across the top; two move blocks;
 * type bar (weakness/resistance/retreat) at ~78%; set/flavor strip at the bottom.
 * v0 is deliberately simple-but-complete; visual refinement iterates on this file only.
 */
export const svBasic: Framework = {
  schemaVersion: 1,
  id: "pokemon.sv.basic", version: "0.1.0", channelId: "pokemon",
  name: "Scarlet & Violet — Basic", variant: "basic",
  parameters: [
    { name: "frameColor", type: "color", default: "#f2cf45" },
    { name: "accentColor", type: "color", default: "#b8941f" },
    { name: "cardBg", type: "color", default: "#f7f4ea" },
    { name: "textColor", type: "color", default: "#1d1d1f" },
    { name: "showFlavorText", type: "boolean", default: true },
  ],
  layers: [
    // ——— chrome ———
    { kind: "shape", id: "outer-border", bleed: "extend",
      shape: { type: "rect", x: -36, y: -36, w: 822, h: 1122 }, fill: "$frameColor" },
    { kind: "shape", id: "card-face", bleed: "clip",
      shape: { type: "rect", x: 26, y: 26, w: 698, h: 998, rx: 18 }, fill: "$cardBg",
      stroke: "$accentColor", strokeWidth: 3 },
    // ——— header ———
    { kind: "text", id: "stage-label", slot: "stage", x: 40, y: 64, w: 120, size: 22, weight: 700, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "name", slot: "name", x: 56, y: 96, w: 420, size: 44, weight: 800, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "hp", slot: "hp", x: 470, y: 96, w: 160, size: 40, weight: 700, align: "end", color: "$textColor", maxLines: 1 },
    { kind: "symbol", id: "type-symbol", symbolId: "energy.lightning", x: 650, y: 52, size: 56 },
    // ——— art ———
    { kind: "image", id: "art", slot: "art", x: 56, y: 120, w: 638, h: 430, fit: "cover" },
    { kind: "shape", id: "art-frame", bleed: "clip",
      shape: { type: "rect", x: 56, y: 120, w: 638, h: 430 }, fill: "none", stroke: "$accentColor", strokeWidth: 4 },
    // ——— moves ———
    { kind: "symbol", id: "move1-cost", symbolId: "energy.colorless", x: 64, y: 600, size: 44 },
    { kind: "text", id: "move1-name", slot: "move1.name", x: 200, y: 632, w: 350, size: 36, weight: 800, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-damage", slot: "move1.damage", x: 560, y: 632, w: 130, size: 36, weight: 700, align: "end", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-text", slot: "move1.text", x: 64, y: 668, w: 622, size: 26, color: "$textColor", maxLines: 4 },
    // ——— type bar ———
    { kind: "shape", id: "typebar-rule", bleed: "clip",
      shape: { type: "rect", x: 40, y: 830, w: 670, h: 3 }, fill: "$accentColor" },
    { kind: "text", id: "weakness", slot: "weakness", x: 56, y: 868, w: 200, size: 24, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "resistance", slot: "resistance", x: 290, y: 868, w: 200, size: 24, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "retreat", slot: "retreat", x: 520, y: 868, w: 180, size: 24, align: "end", color: "$textColor", maxLines: 1 },
    // ——— footer ———
    { kind: "group", id: "flavor", visibleIf: "showFlavorText", children: [
      { kind: "text", id: "flavor-text", slot: "flavorText", x: 330, y: 910, w: 360, size: 20, align: "end", color: "$textColor", maxLines: 4 },
    ]},
    { kind: "text", id: "illustrator", slot: "illustrator", x: 56, y: 930, w: 260, size: 20, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "set-info", slot: "setInfo", x: 56, y: 980, w: 260, size: 20, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "copyright", slot: "copyright", x: 200, y: 1014, w: 350, size: 16, align: "middle", color: "$textColor", maxLines: 1 },
  ],
};
```

```ts
// src/channels/pokemon/index.ts
import type { ChannelDefinition } from "../types";
import { TYPE_PALETTES } from "./palettes";
import { POKEMON_SYMBOLS } from "./symbols";
import { svBasic } from "./frameworks/sv-basic";

export const pokemonChannel: ChannelDefinition = {
  id: "pokemon",
  name: "Pokémon",
  frameworks: [svBasic],
  palettes: TYPE_PALETTES,
  symbols: POKEMON_SYMBOLS,
  fieldSections: [
    { id: "basics", label: "Basics", fields: [
      { slot: "name", label: "Name", input: "text" },
      { slot: "hp", label: "Hitpoints", input: "text" },
      { slot: "stage", label: "Stage", input: "text" },
    ]},
    { id: "images", label: "Images", fields: [
      { slot: "art", label: "Card art", input: "image" },
    ]},
    { id: "moves", label: "Moves", fields: [
      { slot: "move1.name", label: "Move name", input: "text" },
      { slot: "move1.damage", label: "Damage", input: "text" },
      { slot: "move1.text", label: "Move text", input: "multiline" },
    ]},
    { id: "typebar", label: "Type Bar", fields: [
      { slot: "weakness", label: "Weakness", input: "text" },
      { slot: "resistance", label: "Resistance", input: "text" },
      { slot: "retreat", label: "Retreat", input: "text" },
    ]},
    { id: "cardinfo", label: "Card Info", fields: [
      { slot: "illustrator", label: "Illustrator", input: "text" },
      { slot: "setInfo", label: "Set text", input: "text" },
      { slot: "flavorText", label: "Flavor text", input: "multiline" },
      { slot: "copyright", label: "Copyright line", input: "text" },
    ]},
  ],
};
```

Also update `CardRenderer.tsx` symbol case to draw real symbols: add a `symbols` prop (`SymbolDef[]`, default `[]`) threaded through `LayerEl`, and render:

```tsx
case "symbol": {
  const sym = symbols.find((s) => s.id === layer.symbolId);
  if (!sym) return <circle data-layer={layer.id} cx={layer.x + layer.size / 2} cy={layer.y + layer.size / 2} r={layer.size / 2} fill="#ff00ff" />;
  return (
    <svg data-layer={layer.id} x={layer.x} y={layer.y} width={layer.size} height={layer.size} viewBox={sym.viewBox}>
      {sym.paths.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)}
    </svg>
  );
}
```

(`ChannelDefinition` import cycle note: `SymbolDef` lives in `channels/types.ts`; move it to `core/schema.ts` if the import direction complains — core must not import from channels. Simplest correct fix: define `SymbolDef` in `core/schema.ts` and re-export from `channels/types.ts`.)

- [ ] **Step 4: Verify pass** — `npm run test` → all suites green.

- [ ] **Step 5: Commit** — `git commit -m "feat: channel registry, Pokémon channel with S&V Basic framework v0"`

---

### Task 8: Raster export + dev harness

**Files:** Create: `src/export/raster.ts`, Test: `src/export/raster.test.ts`, Modify: `src/App.tsx`

- [ ] **Step 1: Failing test (pure parts)**

```ts
// src/export/raster.test.ts
import { describe, it, expect } from "vitest";
import { exportFilename } from "./raster";

describe("exportFilename", () => {
  it("slugifies the title and stamps kind + size", () => {
    expect(exportFilename("My Dedenne!", "mpc", { width: 1644, height: 2244 }))
      .toBe("my-dedenne-mpc-1644x2244.png");
  });
  it("falls back to 'card' for empty titles", () => {
    expect(exportFilename("", "share", { width: 750, height: 1050 })).toBe("card-share-750x1050.png");
  });
});
```

- [ ] **Step 2: Verify failure.**

- [ ] **Step 3: Implement raster.ts**

```ts
// src/export/raster.ts
import { exportPixelSize, type ExportRequest, type PixelSize } from "../core/geometry";

export function exportFilename(title: string, kind: string, size: PixelSize): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "card";
  return `${slug}-${kind}-${size.width}x${size.height}.png`;
}

/**
 * Rasterize a live card SVG element to a PNG blob.
 * The caller passes the SVG rendered in the right mode (trim for share/print, bleed for mpc).
 * M1 limitation (lifted in M3): user images must be data/blob URLs; fonts are system fonts.
 */
export async function svgToPngBlob(svgEl: SVGSVGElement, req: ExportRequest): Promise<Blob> {
  const size = exportPixelSize(req);
  const xml = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("SVG rasterization failed to load"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d canvas context unavailable");
    // MPC requires opaque RGB: paint white under everything (extend layers cover it anyway).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(img, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!blob) throw new Error("PNG encoding failed");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

- [ ] **Step 4: Dev harness App.tsx**

```tsx
// src/App.tsx
import { useRef, useState } from "react";
import { CardRenderer } from "./core/render/CardRenderer";
import { registerChannel, getChannel } from "./channels/registry";
import { pokemonChannel } from "./channels/pokemon";
import type { CardDocument } from "./core/schema";
import type { ExportKind } from "./core/geometry";
import { svgToPngBlob, downloadBlob, exportFilename } from "./export/raster";
import { exportPixelSize } from "./core/geometry";

registerChannel(pokemonChannel);

const sampleCard: CardDocument = {
  schemaVersion: 1, channelId: "pokemon", frameworkId: "pokemon.sv.basic", frameworkVersion: "0.1.0",
  fields: {
    stage: "BASIC", name: "Dedenne", hp: "HP 70",
    "move1.name": "Forager", "move1.damage": "", "move1.text": "Draw any two Energy cards of your choice from the bank.",
    weakness: "weakness ×2", resistance: "resistance –", retreat: "retreat ●●●",
    flavorText: "Since Dedenne can't generate much electricity on its own, it steals electricity from outlets.",
    illustrator: "Illus. Yuu Nishida", setInfo: "SVP EN · J", copyright: "©2026 your-name — fan art, not official",
  },
  overrides: { paletteId: "lightning" },
  meta: { title: "Dedenne sample", createdAt: "", modifiedAt: "" },
};

export default function App() {
  const channel = getChannel("pokemon");
  const framework = channel.frameworks[0];
  const palette = channel.palettes.find((p) => p.id === sampleCard.overrides.paletteId);
  const [paletteId, setPaletteId] = useState("lightning");
  const trimRef = useRef<HTMLDivElement>(null);
  const bleedRef = useRef<HTMLDivElement>(null);

  async function doExport(kind: ExportKind, scale: number) {
    const host = kind === "mpc" ? bleedRef.current : trimRef.current;
    const svg = host?.querySelector("svg");
    if (!svg) return;
    const blob = await svgToPngBlob(svg as SVGSVGElement, { kind, scale });
    downloadBlob(blob, exportFilename(sampleCard.meta.title, kind, exportPixelSize({ kind, scale })));
  }

  const activePalette = channel.palettes.find((p) => p.id === paletteId) ?? palette;
  return (
    <main style={{ display: "flex", gap: 32, padding: 32, alignItems: "flex-start" }}>
      <div ref={trimRef} style={{ width: 375 }}>
        <CardRenderer framework={framework} card={sampleCard} palette={activePalette} symbols={channel.symbols} mode="trim" />
      </div>
      {/* hidden bleed-mode render used as the MPC export source */}
      <div ref={bleedRef} style={{ width: 0, height: 0, overflow: "hidden" }} aria-hidden>
        <CardRenderer framework={framework} card={sampleCard} palette={activePalette} symbols={channel.symbols} mode="bleed" />
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          palette:{" "}
          <select value={paletteId} onChange={(e) => setPaletteId(e.target.value)}>
            {channel.palettes.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>
        </label>
        <button onClick={() => doExport("share", 1)}>export share 1×</button>
        <button onClick={() => doExport("print", 2)}>export print 2×</button>
        <button onClick={() => doExport("mpc", 2)}>export MPC-ready</button>
      </div>
    </main>
  );
}
```

(`CardRenderer` gains the `symbols?: SymbolDef[]` prop in Task 7 — make sure the prop name matches.)

- [ ] **Step 5: Verify** — `npm run test` all green; `npm run build` clean; `npm run dev`, open the page: sample Dedenne card renders, palette dropdown recolors instantly, all three export buttons download PNGs. Check MPC PNG: 1644×2244, frame color fills the outer ring edge-to-edge.

- [ ] **Step 6: Commit** — `git commit -m "feat: raster export and dev harness with sample card"`

---

### Task 9: Wrap-up

- [ ] **Step 1:** Update `CHANGELOG.md` `[Unreleased]` → roll into `0.2.0` with the engine-foundation feature list. Set `package.json` version to `0.2.0`.
- [ ] **Step 2:** `git add -A; git commit -m "chore: release 0.2.0 — engine foundation"`
- [ ] **Step 3:** `git push origin main`
- [ ] **Step 4:** Verify success criteria of this plan: all tests green (`npm run test`), build clean, harness renders + recolors + exports (manual), MPC export dimensions verified.

---

## Out of scope for M1 (next plans)

- **M2 — Editor:** Zustand document/UI stores, undo/redo, click-to-select with inspector, Fill rail generated from `fieldSections`, Design rail (palette/parameters/hue-sat/layer toggles), pro-studio theme, canvas-accurate text measurement injection, bundled fonts, move-cost symbol editing, zoom/pan.
- **M3 — Persistence & export polish:** File System Access project folder + fallback + IndexedDB autosave, export dialog with quality dropdown UI, font/image inlining for export, error states, schema migrations, visual snapshot tests.

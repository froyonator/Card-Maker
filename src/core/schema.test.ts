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

describe("FrameworkSchema paint and typography extensions", () => {
  it("accepts a linear gradient fill on a shape layer", () => {
    const fw = {
      ...tinyFramework,
      layers: [{
        kind: "shape", id: "grad-bg", bleed: "clip",
        shape: { type: "rect", x: 0, y: 0, w: 750, h: 1050 },
        fill: { type: "linear", angle: 90, stops: [
          { offset: 0, color: "$frameColor" },
          { offset: 1, color: "#ffffff" },
        ]},
      }],
    };
    expect(FrameworkSchema.safeParse(fw).success).toBe(true);
  });
  it("rejects a gradient with out-of-range stop offsets", () => {
    const fw = {
      ...tinyFramework,
      layers: [{
        kind: "shape", id: "bad", bleed: "clip",
        shape: { type: "rect", x: 0, y: 0, w: 10, h: 10 },
        fill: { type: "linear", angle: 0, stops: [{ offset: 2, color: "#fff" }] },
      }],
    };
    expect(FrameworkSchema.safeParse(fw).success).toBe(false);
  });
  it("accepts fontRole, letterSpacing, and italic on text layers", () => {
    const fw = {
      ...tinyFramework,
      layers: [{
        kind: "text", id: "name", slot: "name", x: 0, y: 50, w: 400,
        size: 44, color: "#000", fontRole: "name", letterSpacing: -0.05, italic: true,
      }],
    };
    expect(FrameworkSchema.safeParse(fw).success).toBe(true);
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

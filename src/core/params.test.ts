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

import { describe, it, expect } from "vitest";
import {
  CUT_W, CUT_H, BLEED, TRIM_VIEWBOX, BLEED_VIEWBOX,
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

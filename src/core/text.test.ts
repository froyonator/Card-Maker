import { describe, it, expect } from "vitest";
import { wrapText } from "./text";

/** Fake measurer: every char is 10 units wide. */
const measure = (s: string) => s.length * 10;

describe("wrapText", () => {
  it("keeps short text on one line", () => {
    expect(wrapText("hello", 100, measure)).toEqual(["hello"]);
  });
  it("wraps greedily at word boundaries", () => {
    // "draw any" = 80 ≤ 100; adding " two" = 120 breaks; "two energy" = 100 fits exactly
    expect(wrapText("draw any two energy", 100, measure)).toEqual(["draw any", "two energy"]);
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

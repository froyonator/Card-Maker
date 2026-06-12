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
  const { container } = render(
    <CardRenderer framework={tinyFramework} card={doc} mode={showBleed ? "bleed" : "trim"} />,
  );
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

describe("CardRenderer gradients and fonts", () => {
  const gradFramework = {
    ...tinyFramework,
    layers: [
      {
        kind: "shape" as const, id: "sky", bleed: "clip" as const,
        shape: { type: "rect" as const, x: 0, y: 0, w: 750, h: 1050 },
        fill: { type: "linear" as const, angle: 90, stops: [
          { offset: 0, color: "$frameColor" },
          { offset: 1, color: "#ffffff" },
        ]},
      },
      {
        kind: "text" as const, id: "name", slot: "name", x: 0, y: 50, w: 400,
        size: 44, color: "#000", fontRole: "name", letterSpacing: -0.05, italic: true,
      },
    ],
  };

  function renderGrad() {
    const { container } = render(
      <CardRenderer framework={gradFramework} card={doc} fonts={{ name: "Cabin, sans-serif" }} />,
    );
    return container.querySelector("svg")!;
  }

  it("emits a linearGradient def and references it from the layer fill", () => {
    const s = renderGrad();
    const grad = s.querySelector("linearGradient");
    expect(grad).not.toBeNull();
    const id = grad!.getAttribute("id")!;
    expect(s.querySelector('[data-layer="sky"]')!.getAttribute("fill")).toBe(`url(#${id})`);
    const stops = grad!.querySelectorAll("stop");
    expect(stops[0].getAttribute("stop-color")).toBe("#f5d442");
    expect(stops[1].getAttribute("stop-color")).toBe("#ffffff");
  });
  it("angle 90 maps to a top-to-bottom gradient vector", () => {
    const grad = renderGrad().querySelector("linearGradient")!;
    expect(Number(grad.getAttribute("y1"))).toBeCloseTo(0, 5);
    expect(Number(grad.getAttribute("y2"))).toBeCloseTo(1, 5);
  });
  it("applies font family from the fonts prop, letter spacing, and italics", () => {
    const text = renderGrad().querySelector('[data-layer="name"]')!;
    expect(text.getAttribute("font-family")).toBe("Cabin, sans-serif");
    expect(text.getAttribute("letter-spacing")).toBe("-0.05em");
    expect(text.getAttribute("font-style")).toBe("italic");
  });
});

describe("CardRenderer hue-shift groups", () => {
  const hueFramework = {
    ...tinyFramework,
    parameters: [...tinyFramework.parameters, { name: "frameHue", type: "number" as const, default: 0 }],
    layers: [{
      kind: "group" as const, id: "chrome", hueShift: "frameHue",
      children: [{
        kind: "shape" as const, id: "bg", bleed: "clip" as const,
        shape: { type: "rect" as const, x: 0, y: 0, w: 750, h: 1050 }, fill: "#f2cf45",
      }],
    }],
  };

  function renderHue(hue?: number) {
    const parameters: Record<string, number> = hue === undefined ? {} : { frameHue: hue };
    const hueDoc = { ...doc, overrides: { parameters } };
    const { container } = render(<CardRenderer framework={hueFramework} card={hueDoc} />);
    return container.querySelector("svg")!;
  }

  it("applies a hueRotate filter when the bound parameter is nonzero", () => {
    const s = renderHue(120);
    const group = s.querySelector('[data-layer="chrome"]')!;
    expect(group.getAttribute("filter")).toBe("url(#hue-chrome)");
    expect(s.querySelector("#hue-chrome feColorMatrix")!.getAttribute("values")).toBe("120");
  });
  it("emits no filter when the hue is zero", () => {
    const group = renderHue().querySelector('[data-layer="chrome"]')!;
    expect(group.getAttribute("filter")).toBeNull();
  });
});

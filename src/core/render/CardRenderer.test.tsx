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

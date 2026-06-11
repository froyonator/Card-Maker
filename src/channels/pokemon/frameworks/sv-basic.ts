import type { Framework } from "../../../core/schema";

/**
 * S&V Basic Pokemon framework, v1 visuals.
 *
 * Hand-authored vector recreation of the Scarlet & Violet basic card layout.
 * Geometry is in the 750x1050 design space (see core/geometry.ts); proportions
 * were measured from reference renders at roughly 1444x2010 and scaled by 0.52.
 *
 * Structure, top to bottom: silver outer border (extends into bleed), type-colored
 * card body with a highlight sweep, stage badge + name + HP header, bezeled art
 * window, metallic divider tube, one move block, weakness/resistance/retreat bar
 * between thin double rules, then the footer (illustrator, set info, flavor text,
 * copyright).
 */
export const svBasic: Framework = {
  schemaVersion: 1,
  id: "pokemon.sv.basic", version: "0.2.0", channelId: "pokemon",
  name: "Scarlet & Violet Basic", variant: "basic",
  parameters: [
    { name: "borderLight", type: "color", default: "#f2f2f2" },
    { name: "borderDark", type: "color", default: "#8c8c8c" },
    { name: "frameLight", type: "color", default: "#f9d72f" },
    { name: "frameDark", type: "color", default: "#e0ad14" },
    { name: "frameSheen", type: "color", default: "#fbe66e" },
    { name: "accentColor", type: "color", default: "#8a6a0a" },
    { name: "artBg", type: "color", default: "#f7f4ee" },
    { name: "textColor", type: "color", default: "#141414" },
    { name: "showFlavorText", type: "boolean", default: true },
  ],
  layers: [
    // Silver border fills the whole canvas including the bleed ring; everything else sits on top.
    { kind: "shape", id: "outer-border", bleed: "extend",
      shape: { type: "rect", x: -36, y: -36, w: 822, h: 1122 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "$borderLight" }, { offset: 0.5, color: "#b9b9b9" }, { offset: 1, color: "$borderDark" },
      ]}},
    // Card body in the type color, slightly diagonal gradient like the print.
    { kind: "shape", id: "frame-bg", bleed: "clip",
      shape: { type: "rect", x: 30, y: 30, w: 690, h: 990, rx: 16 },
      fill: { type: "linear", angle: 105, stops: [
        { offset: 0, color: "$frameLight" }, { offset: 1, color: "$frameDark" },
      ]},
      stroke: "$accentColor", strokeWidth: 1.5 },
    // Lighter sweep across the top-right corner of the body.
    { kind: "shape", id: "frame-sheen", bleed: "clip",
      shape: { type: "path", d: "M430 30 H704 a16 16 0 0 1 16 16 V270 C600 215 505 95 430 30 Z" },
      fill: "$frameSheen" },

    // Header row.
    { kind: "shape", id: "stage-badge", bleed: "clip",
      shape: { type: "path", d: "M54 32 h130 l26 40 H54 a11 11 0 0 1 -11 -11 V43 a11 11 0 0 1 11 -11 Z" },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "#fdfdfd" }, { offset: 0.55, color: "#cfcfcf" }, { offset: 1, color: "#9a9a9a" },
      ]}},
    { kind: "text", id: "stage-label", slot: "stage", x: 62, y: 61, w: 110, size: 21, weight: 700,
      italic: true, fontRole: "stage", color: "#2b2b2b", maxLines: 1 },
    { kind: "text", id: "name", slot: "name", x: 224, y: 78, w: 340, size: 47, weight: 700,
      fontRole: "name", letterSpacing: -0.03, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "hp", slot: "hp", x: 470, y: 78, w: 160, size: 42, weight: 700, align: "end",
      fontRole: "hpNumber", color: "$textColor", maxLines: 1 },
    { kind: "symbol", id: "type-symbol", symbolId: "energy.lightning", x: 642, y: 34, size: 64 },

    // Art window: silver bezel, paper backing, then the user image.
    { kind: "shape", id: "art-bezel", bleed: "clip",
      shape: { type: "rect", x: 52, y: 104, w: 646, h: 478, rx: 10 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "$borderLight" }, { offset: 1, color: "$borderDark" },
      ]}},
    { kind: "shape", id: "art-backing", bleed: "clip",
      shape: { type: "rect", x: 60, y: 112, w: 630, h: 462, rx: 6 }, fill: "$artBg" },
    { kind: "image", id: "art", slot: "art", x: 62, y: 114, w: 626, h: 458, fit: "cover" },

    // Metallic tube divider between art and the move area.
    { kind: "shape", id: "divider", bleed: "clip",
      shape: { type: "rect", x: 44, y: 596, w: 662, h: 20, rx: 10 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "#fafafa" }, { offset: 0.45, color: "#d8d8d8" }, { offset: 1, color: "#8f8f8f" },
      ]}},
    { kind: "shape", id: "divider-highlight", bleed: "clip",
      shape: { type: "rect", x: 52, y: 599, w: 646, h: 5, rx: 2.5 }, fill: "#ffffff" },

    // Move block.
    { kind: "symbol", id: "move1-cost", symbolId: "energy.colorless", x: 62, y: 652, size: 50 },
    { kind: "text", id: "move1-name", slot: "move1.name", x: 150, y: 692, w: 450, size: 40, weight: 700,
      align: "middle", fontRole: "attackName", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-damage", slot: "move1.damage", x: 560, y: 692, w: 130, size: 40, weight: 800,
      align: "end", fontRole: "damage", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-text", slot: "move1.text", x: 62, y: 736, w: 626, size: 25, lineHeight: 1.3,
      fontRole: "body", color: "$textColor", maxLines: 4 },

    // Type bar between thin double rules.
    { kind: "shape", id: "typebar-rule-top-a", bleed: "clip", shape: { type: "rect", x: 40, y: 884, w: 670, h: 2.5 }, fill: "#4a4a4a" },
    { kind: "shape", id: "typebar-rule-top-b", bleed: "clip", shape: { type: "rect", x: 40, y: 890, w: 670, h: 1.5 }, fill: "#7a7a7a" },
    { kind: "text", id: "weakness", slot: "weakness", x: 56, y: 924, w: 210, size: 23, fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "resistance", slot: "resistance", x: 296, y: 924, w: 200, size: 23, fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "retreat", slot: "retreat", x: 516, y: 924, w: 178, size: 23, align: "end", fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "shape", id: "typebar-rule-bottom-a", bleed: "clip", shape: { type: "rect", x: 40, y: 938, w: 670, h: 2.5 }, fill: "#4a4a4a" },
    { kind: "shape", id: "typebar-rule-bottom-b", bleed: "clip", shape: { type: "rect", x: 40, y: 944, w: 670, h: 1.5 }, fill: "#7a7a7a" },

    // Footer.
    { kind: "text", id: "illustrator", slot: "illustrator", x: 56, y: 974, w: 270, size: 19, italic: true,
      fontRole: "illustrator", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "set-info", slot: "setInfo", x: 56, y: 1004, w: 270, size: 18, italic: true,
      fontRole: "setNumber", color: "$textColor", maxLines: 1 },
    { kind: "group", id: "flavor", visibleIf: "showFlavorText", children: [
      { kind: "text", id: "flavor-text", slot: "flavorText", x: 350, y: 968, w: 344, size: 19, align: "end",
        lineHeight: 1.25, fontRole: "flavor", color: "#222222", maxLines: 4 },
    ]},
    { kind: "text", id: "copyright", slot: "copyright", x: 150, y: 1038, w: 450, size: 14, align: "middle",
      fontRole: "copyright", color: "#3a3a3a", maxLines: 1 },
  ],
};

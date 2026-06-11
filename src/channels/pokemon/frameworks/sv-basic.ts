import type { Framework } from "../../../core/schema";

/**
 * S&V Basic Pokemon framework, v1.5 visuals.
 *
 * Hand-authored vector recreation of the Scarlet & Violet basic card layout,
 * iterated against reference renders and owner feedback. Geometry is in the
 * 750x1050 design space (see core/geometry.ts).
 *
 * Known simplifications, tracked for the M2 editor milestone:
 * - retreat cost is three static discs (count becomes data-driven later)
 * - one move block, single cost symbol
 * - weakness type symbol is fixed to fighting until type pickers exist
 */
export const svBasic: Framework = {
  schemaVersion: 1,
  id: "pokemon.sv.basic", version: "0.3.0", channelId: "pokemon",
  name: "Scarlet & Violet Basic", variant: "basic",
  parameters: [
    { name: "borderLight", type: "color", default: "#f2f2f2" },
    { name: "borderDark", type: "color", default: "#8c8c8c" },
    { name: "frameLight", type: "color", default: "#f7d949" },
    { name: "frameDark", type: "color", default: "#eec22e" },
    { name: "accentColor", type: "color", default: "#8a6a0a" },
    { name: "artBg", type: "color", default: "#f7f4ee" },
    { name: "textColor", type: "color", default: "#141414" },
    { name: "showFlavorText", type: "boolean", default: true },
  ],
  layers: [
    // Silver border fills the whole canvas including the bleed ring.
    { kind: "shape", id: "outer-border", bleed: "extend",
      shape: { type: "rect", x: -36, y: -36, w: 822, h: 1122 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "$borderLight" }, { offset: 0.5, color: "#b9b9b9" }, { offset: 1, color: "$borderDark" },
      ]}},
    // Card body: soft, low-contrast type color. Real cards are nearly flat here.
    { kind: "shape", id: "frame-bg", bleed: "clip",
      shape: { type: "rect", x: 30, y: 30, w: 690, h: 990, rx: 16 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "$frameLight" }, { offset: 1, color: "$frameDark" },
      ]}},

    // Header: metallic stage tab overlapping the border, name, HP, energy symbol.
    { kind: "shape", id: "stage-badge", bleed: "clip",
      shape: { type: "path", d: "M40 30 h152 l22 36 H52 a12 12 0 0 1 -12 -12 Z" },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "#ffffff" }, { offset: 0.5, color: "#d6d6d6" }, { offset: 1, color: "#8e8e8e" },
      ]},
      stroke: "#6e6e6e", strokeWidth: 1.5 },
    { kind: "text", id: "stage-label", slot: "stage", x: 58, y: 58, w: 120, size: 21, weight: 700,
      italic: true, fontRole: "stage", color: "#3c3c3c", maxLines: 1 },
    { kind: "text", id: "name", slot: "name", x: 220, y: 78, w: 230, size: 46, weight: 700,
      fontRole: "name", letterSpacing: -0.04, color: "$textColor", maxLines: 1 },
    { kind: "text", id: "hp", slot: "hp", x: 460, y: 78, w: 170, size: 40, weight: 700, align: "end",
      fontRole: "hpNumber", color: "$textColor", maxLines: 1 },
    { kind: "symbol", id: "type-symbol", symbolId: "energy.lightning", x: 642, y: 34, size: 64 },

    // Art window: silver bezel, paper backing, user art.
    { kind: "shape", id: "art-bezel", bleed: "clip",
      shape: { type: "rect", x: 52, y: 104, w: 646, h: 466, rx: 10 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "$borderLight" }, { offset: 1, color: "$borderDark" },
      ]}},
    { kind: "shape", id: "art-backing", bleed: "clip",
      shape: { type: "rect", x: 60, y: 112, w: 630, h: 450, rx: 6 }, fill: "$artBg" },
    { kind: "image", id: "art", slot: "art", x: 62, y: 114, w: 626, h: 446, fit: "cover" },

    // Metallic tube divider overlapping the art bezel's bottom edge.
    { kind: "shape", id: "divider-shadow", bleed: "clip",
      shape: { type: "rect", x: 42, y: 582, w: 666, h: 3, rx: 1.5 }, fill: "rgba(0,0,0,0.18)" },
    { kind: "shape", id: "divider", bleed: "clip",
      shape: { type: "rect", x: 40, y: 562, w: 670, h: 16, rx: 8 },
      fill: { type: "linear", angle: 90, stops: [
        { offset: 0, color: "#ffffff" }, { offset: 0.35, color: "#e8e8e8" },
        { offset: 0.8, color: "#9c9c9c" }, { offset: 1, color: "#6f6f6f" },
      ]}},
    { kind: "shape", id: "divider-highlight", bleed: "clip",
      shape: { type: "rect", x: 48, y: 564, w: 654, h: 4, rx: 2 }, fill: "#ffffff" },

    // Move block.
    { kind: "symbol", id: "move1-cost", symbolId: "energy.colorless", x: 62, y: 622, size: 46 },
    { kind: "text", id: "move1-name", slot: "move1.name", x: 150, y: 660, w: 450, size: 38, weight: 700,
      align: "middle", fontRole: "attackName", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-damage", slot: "move1.damage", x: 560, y: 660, w: 130, size: 38, weight: 800,
      align: "end", fontRole: "damage", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "move1-text", slot: "move1.text", x: 62, y: 702, w: 626, size: 24, lineHeight: 1.3,
      fontRole: "body", color: "$textColor", maxLines: 4 },

    // Type bar: embossed silver rules with the stepped notch, printed labels,
    // weakness symbol, and retreat cost discs.
    { kind: "shape", id: "rule-top-left", bleed: "clip",
      shape: { type: "rect", x: 40, y: 856, w: 400, h: 5, rx: 2.5 },
      fill: { type: "linear", angle: 90, stops: [{ offset: 0, color: "#fdfdfd" }, { offset: 1, color: "#8c8c8c" }] } },
    { kind: "shape", id: "rule-top-step", bleed: "clip",
      shape: { type: "path", d: "M440 861 L468 849 L468 853 L440 866 Z" }, fill: "#a8a8a8" },
    { kind: "shape", id: "rule-top-right", bleed: "clip",
      shape: { type: "rect", x: 468, y: 848, w: 242, h: 5, rx: 2.5 },
      fill: { type: "linear", angle: 90, stops: [{ offset: 0, color: "#fdfdfd" }, { offset: 1, color: "#8c8c8c" }] } },

    { kind: "text", id: "weakness-label", text: "weakness", x: 56, y: 906, w: 110, size: 20,
      fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "symbol", id: "weakness-symbol", symbolId: "energy.fighting", x: 168, y: 882, size: 30 },
    { kind: "text", id: "weakness", slot: "weakness", x: 204, y: 906, w: 70, size: 22, weight: 700,
      fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "shape", id: "typebar-divider", bleed: "clip",
      shape: { type: "rect", x: 290, y: 882, w: 2.5, h: 30 }, fill: "#4a4a4a" },
    { kind: "text", id: "resistance-label", text: "resistance", x: 312, y: 906, w: 120, size: 20,
      fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "resistance", slot: "resistance", x: 436, y: 906, w: 60, size: 22, weight: 700,
      fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "retreat-label", text: "retreat", x: 524, y: 906, w: 90, size: 20,
      fontRole: "typeBar", color: "$textColor", maxLines: 1 },
    { kind: "symbol", id: "retreat-1", symbolId: "energy.colorless", x: 612, y: 884, size: 28 },
    { kind: "symbol", id: "retreat-2", symbolId: "energy.colorless", x: 644, y: 884, size: 28 },
    { kind: "symbol", id: "retreat-3", symbolId: "energy.colorless", x: 676, y: 884, size: 28 },

    { kind: "shape", id: "rule-bottom-left", bleed: "clip",
      shape: { type: "rect", x: 40, y: 928, w: 400, h: 5, rx: 2.5 },
      fill: { type: "linear", angle: 90, stops: [{ offset: 0, color: "#fdfdfd" }, { offset: 1, color: "#8c8c8c" }] } },
    { kind: "shape", id: "rule-bottom-step", bleed: "clip",
      shape: { type: "path", d: "M440 933 L468 921 L468 925 L440 938 Z" }, fill: "#a8a8a8" },
    { kind: "shape", id: "rule-bottom-right", bleed: "clip",
      shape: { type: "rect", x: 468, y: 920, w: 242, h: 5, rx: 2.5 },
      fill: { type: "linear", angle: 90, stops: [{ offset: 0, color: "#fdfdfd" }, { offset: 1, color: "#8c8c8c" }] } },

    // Footer: illustrator and set info left, flavor text right. No watermark.
    { kind: "text", id: "illustrator", slot: "illustrator", x: 56, y: 968, w: 270, size: 19, italic: true,
      fontRole: "illustrator", color: "$textColor", maxLines: 1 },
    { kind: "text", id: "set-info", slot: "setInfo", x: 56, y: 998, w: 270, size: 18, italic: true,
      fontRole: "setNumber", color: "$textColor", maxLines: 1 },
    { kind: "group", id: "flavor", visibleIf: "showFlavorText", children: [
      { kind: "text", id: "flavor-text", slot: "flavorText", x: 350, y: 962, w: 344, size: 19, align: "end",
        lineHeight: 1.25, fontRole: "flavor", color: "#222222", maxLines: 4 },
    ]},
  ],
};

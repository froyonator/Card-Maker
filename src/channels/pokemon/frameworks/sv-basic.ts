import type { Framework } from "../../../core/schema";

/**
 * S&V Basic Pokémon, v0 visuals.
 * Geometry: 750x1050 design space (see core/geometry.ts). Proportions approximate S&V card scans:
 * art window ~86% width starting ~11% down; name bar across the top; one move block;
 * type bar (weakness/resistance/retreat) at ~79%; flavor/set strip at the bottom.
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

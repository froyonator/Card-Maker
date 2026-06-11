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

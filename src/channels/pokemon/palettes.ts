import type { ParameterPreset } from "../../core/params";

/** Energy-type palettes: frameColor = card body, accentColor = trims/badges. v0 values, tuned later. */
export const TYPE_PALETTES: ParameterPreset[] = [
  { id: "grass",     values: { frameColor: "#7db74f", accentColor: "#4c7a2e" } },
  { id: "fire",      values: { frameColor: "#e8643c", accentColor: "#a33214" } },
  { id: "water",     values: { frameColor: "#4f9fd8", accentColor: "#2a6ea6" } },
  { id: "lightning", values: { frameColor: "#f2cf45", accentColor: "#b8941f" } },
  { id: "psychic",   values: { frameColor: "#9c6bb3", accentColor: "#6a3f82" } },
  { id: "fighting",  values: { frameColor: "#c97f44", accentColor: "#8f5424" } },
  { id: "darkness",  values: { frameColor: "#3e4757", accentColor: "#1f2530" } },
  { id: "metal",     values: { frameColor: "#a8b0b8", accentColor: "#6f777f" } },
  { id: "dragon",    values: { frameColor: "#b09e54", accentColor: "#7a6c33" } },
  { id: "fairy",     values: { frameColor: "#d878a8", accentColor: "#a64a78" } },
  { id: "colorless", values: { frameColor: "#d8d4cc", accentColor: "#9a968e" } },
];

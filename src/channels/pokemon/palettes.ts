import type { ParameterPreset } from "../../core/params";

/**
 * Energy-type palettes for the S&V frameworks.
 * frameLight/frameDark form the card body gradient, frameSheen is the lighter
 * highlight sweep in the top corner, accentColor is for dark trims and rims.
 * Values sampled from reference template renders, then hand-tuned.
 */
export const TYPE_PALETTES: ParameterPreset[] = [
  { id: "grass",     values: { frameLight: "#8cc152", frameDark: "#5f9131", frameSheen: "#aed581", accentColor: "#2e5614" } },
  { id: "fire",      values: { frameLight: "#f0703f", frameDark: "#cc4717", frameSheen: "#f59d6d", accentColor: "#7a2807" } },
  { id: "water",     values: { frameLight: "#5fb1e8", frameDark: "#2f7fc1", frameSheen: "#8ecdf0", accentColor: "#174e7d" } },
  { id: "lightning", values: { frameLight: "#f7d949", frameDark: "#eec22e", frameSheen: "#fbe66e", accentColor: "#8a6a0a" } },
  { id: "psychic",   values: { frameLight: "#b07cc6", frameDark: "#7e4f98", frameSheen: "#c9a2d8", accentColor: "#4a2762" } },
  { id: "fighting",  values: { frameLight: "#d29054", frameDark: "#a45f23", frameSheen: "#e0b184", accentColor: "#5e3410" } },
  { id: "darkness",  values: { frameLight: "#4a5568", frameDark: "#272f3d", frameSheen: "#6b7689", accentColor: "#11161f" } },
  { id: "metal",     values: { frameLight: "#c4ccd4", frameDark: "#8a939c", frameSheen: "#dde2e7", accentColor: "#4d555e" } },
  { id: "dragon",    values: { frameLight: "#c2b264", frameDark: "#8f7f35", frameSheen: "#d6ca8e", accentColor: "#564a18" } },
  { id: "fairy",     values: { frameLight: "#e58fb8", frameDark: "#bb5687", frameSheen: "#f0b3cf", accentColor: "#6e2a4c" } },
  { id: "colorless", values: { frameLight: "#e8e4dc", frameDark: "#b5b1a8", frameSheen: "#f4f1ea", accentColor: "#6b675e" } },
];

import type { Framework } from "./schema";

export type ParamValue = string | number | boolean;
export type ResolvedParams = Record<string, ParamValue>;
export interface ParameterPreset { id: string; values: Record<string, ParamValue>; }

/** Precedence: framework default ← palette preset ← per-card override. Unknown keys are dropped. */
export function resolveParams(
  framework: Framework,
  palette?: ParameterPreset,
  overrides?: Record<string, ParamValue>,
): ResolvedParams {
  const out: ResolvedParams = {};
  for (const p of framework.parameters) {
    out[p.name] = p.default;
    if (palette && p.name in palette.values) out[p.name] = palette.values[p.name];
    if (overrides && p.name in overrides) out[p.name] = overrides[p.name];
  }
  return out;
}

/** "$name" → parameter value; anything else is a literal. Unknown ref renders magenta so it's seen. */
export function resolvePaint(paint: string, params: ResolvedParams): string {
  if (!paint.startsWith("$")) return paint;
  const v = params[paint.slice(1)];
  return typeof v === "string" ? v : "#ff00ff";
}

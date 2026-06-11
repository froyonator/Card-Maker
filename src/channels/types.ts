import type { Framework, SymbolDef } from "../core/schema";
import type { ParameterPreset } from "../core/params";

export type { SymbolDef };

export interface FieldDef { slot: string; label: string; input: "text" | "multiline" | "image" | "select"; }
export interface FieldSection { id: string; label: string; fields: FieldDef[]; }

export interface ChannelDefinition {
  id: string;
  name: string;
  frameworks: Framework[];
  palettes: ParameterPreset[];
  symbols: SymbolDef[];
  fieldSections: FieldSection[];
}

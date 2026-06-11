import { z } from "zod";

/** Bump when the document shape changes; migrations key off this. */
export const SCHEMA_VERSION = 1;

const ParameterSchema = z.discriminatedUnion("type", [
  z.object({ name: z.string().min(1), type: z.literal("color"), default: z.string() }),
  z.object({ name: z.string().min(1), type: z.literal("number"), default: z.number() }),
  z.object({ name: z.string().min(1), type: z.literal("boolean"), default: z.boolean() }),
  z.object({ name: z.string().min(1), type: z.literal("font"), default: z.string() }),
]);

const ShapeGeom = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rect"), x: z.number(), y: z.number(), w: z.number(), h: z.number(), rx: z.number().optional() }),
  z.object({ type: z.literal("ellipse"), cx: z.number(), cy: z.number(), rx: z.number(), ry: z.number() }),
  z.object({ type: z.literal("path"), d: z.string() }),
]);

/** Paint value: literal color or "$parameterName" reference. */
const Paint = z.string();

const BaseLayer = { id: z.string().min(1) };

const ShapeLayer = z.object({
  ...BaseLayer, kind: z.literal("shape"),
  shape: ShapeGeom, fill: Paint.optional(), stroke: Paint.optional(), strokeWidth: z.number().optional(),
  bleed: z.enum(["extend", "clip"]),
});
const TextLayer = z.object({
  ...BaseLayer, kind: z.literal("text"),
  slot: z.string().min(1), x: z.number(), y: z.number(), w: z.number(),
  size: z.number(), weight: z.number().optional(), align: z.enum(["start", "middle", "end"]).optional(),
  color: Paint, maxLines: z.number().int().positive().optional(), lineHeight: z.number().optional(),
});
const ImageLayer = z.object({
  ...BaseLayer, kind: z.literal("image"),
  slot: z.string().min(1), x: z.number(), y: z.number(), w: z.number(), h: z.number(),
  fit: z.enum(["cover", "contain"]),
});
const SymbolLayer = z.object({
  ...BaseLayer, kind: z.literal("symbol"),
  symbolId: z.string().min(1), x: z.number(), y: z.number(), size: z.number(),
});

export type LayerInput =
  | z.infer<typeof ShapeLayer> | z.infer<typeof TextLayer>
  | z.infer<typeof ImageLayer> | z.infer<typeof SymbolLayer>
  | { kind: "group"; id: string; visibleIf?: string; children: LayerInput[] };

const LayerSchema: z.ZodType<LayerInput> = z.lazy(() =>
  z.union([
    ShapeLayer, TextLayer, ImageLayer, SymbolLayer,
    z.object({ ...BaseLayer, kind: z.literal("group"), visibleIf: z.string().optional(), children: z.array(LayerSchema) }),
  ]),
);

export const FrameworkSchema = z.object({
  schemaVersion: z.number().int(),
  id: z.string().min(1), version: z.string().min(1), channelId: z.string().min(1),
  name: z.string().min(1), variant: z.string().min(1),
  parameters: z.array(ParameterSchema),
  layers: z.array(LayerSchema),
});

const ImageValue = z.object({ src: z.string(), naturalW: z.number(), naturalH: z.number() });
const FieldValue = z.union([z.string(), ImageValue]);

export const CardDocumentSchema = z.object({
  schemaVersion: z.number().int(),
  channelId: z.string().min(1), frameworkId: z.string().min(1), frameworkVersion: z.string().min(1),
  fields: z.record(z.string(), FieldValue),
  overrides: z.object({
    paletteId: z.string().optional(),
    parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),
  meta: z.object({ title: z.string(), createdAt: z.string(), modifiedAt: z.string() }),
});

export type Framework = z.infer<typeof FrameworkSchema>;
export type Layer = LayerInput;
export type CardDocument = z.infer<typeof CardDocumentSchema>;
export type ImageFieldValue = z.infer<typeof ImageValue>;

/** Vector symbol art (energy icons etc.). Lives in core so the renderer can draw it without importing channels. */
export interface SymbolDef { id: string; viewBox: string; paths: { d: string; fill: string }[]; }

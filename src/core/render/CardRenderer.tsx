import { TRIM_VIEWBOX, BLEED_VIEWBOX, type ViewBox } from "../geometry";
import { resolveParams, resolvePaint, type ResolvedParams, type ParameterPreset } from "../params";
import { wrapText } from "../text";
import type { CardDocument, Framework, Layer, ImageFieldValue, SymbolDef } from "../schema";

export interface CardRendererProps {
  framework: Framework;
  card: CardDocument;
  palette?: ParameterPreset;
  /** Symbol art table, supplied by the active channel. */
  symbols?: SymbolDef[];
  /** trim = editing view; bleed = MPC export view (extend layers paint the ring). */
  mode?: "trim" | "bleed";
  onElementClick?: (layerId: string, slot?: string) => void;
}

const vbAttr = (v: ViewBox) => `${v.x} ${v.y} ${v.w} ${v.h}`;
/** jsdom/test-safe width approximation; replaced by canvas measureText injection in M2. */
const approxMeasure = (size: number) => (s: string) => s.length * size * 0.55;

export function CardRenderer({ framework, card, palette, symbols = [], mode = "trim", onElementClick }: CardRendererProps) {
  const params = resolveParams(framework, palette, card.overrides.parameters);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vbAttr(mode === "bleed" ? BLEED_VIEWBOX : TRIM_VIEWBOX)}
      data-card-root="true"
    >
      {framework.layers.map((l) => (
        <LayerEl key={l.id} layer={l} params={params} card={card} symbols={symbols} onClick={onElementClick} />
      ))}
    </svg>
  );
}

interface LayerElProps {
  layer: Layer;
  params: ResolvedParams;
  card: CardDocument;
  symbols: SymbolDef[];
  onClick?: (layerId: string, slot?: string) => void;
}

function LayerEl({ layer, params, card, symbols, onClick }: LayerElProps) {
  switch (layer.kind) {
    case "group": {
      if (layer.visibleIf !== undefined && params[layer.visibleIf] !== true) return null;
      return (
        <g data-layer={layer.id}>
          {layer.children.map((c) => (
            <LayerEl key={c.id} layer={c} params={params} card={card} symbols={symbols} onClick={onClick} />
          ))}
        </g>
      );
    }
    case "shape": {
      const common = {
        "data-layer": layer.id,
        fill: layer.fill ? resolvePaint(layer.fill, params) : "none",
        stroke: layer.stroke ? resolvePaint(layer.stroke, params) : undefined,
        strokeWidth: layer.strokeWidth,
        onClick: onClick ? () => onClick(layer.id) : undefined,
      };
      const s = layer.shape;
      if (s.type === "rect") return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
      if (s.type === "ellipse") return <ellipse {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
      return <path {...common} d={s.d} />;
    }
    case "text": {
      const raw = card.fields[layer.slot];
      const value = typeof raw === "string" ? raw : "";
      const lines = wrapText(value, layer.w, approxMeasure(layer.size), layer.maxLines);
      const lh = (layer.lineHeight ?? 1.15) * layer.size;
      const anchorX = layer.align === "middle" ? layer.x + layer.w / 2 : layer.align === "end" ? layer.x + layer.w : layer.x;
      return (
        <text
          data-layer={layer.id} data-slot={layer.slot}
          x={anchorX} y={layer.y} fontSize={layer.size} fontWeight={layer.weight}
          textAnchor={layer.align ?? "start"} fill={resolvePaint(layer.color, params)}
          onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
        >
          {lines.map((line, i) => (
            <tspan key={i} x={anchorX} dy={i === 0 ? 0 : lh}>{line}</tspan>
          ))}
        </text>
      );
    }
    case "image": {
      const v = card.fields[layer.slot];
      const img = typeof v === "object" && v !== null ? (v as ImageFieldValue) : undefined;
      if (!img) {
        return (
          <rect
            data-layer={layer.id} data-slot={layer.slot} data-placeholder="true"
            x={layer.x} y={layer.y} width={layer.w} height={layer.h}
            fill="#2a2a2e" stroke="#4a4a4e" strokeDasharray="8 6"
            onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
          />
        );
      }
      return (
        <image
          data-layer={layer.id} data-slot={layer.slot}
          href={img.src} x={layer.x} y={layer.y} width={layer.w} height={layer.h}
          preserveAspectRatio={layer.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
          onClick={onClick ? () => onClick(layer.id, layer.slot) : undefined}
        />
      );
    }
    case "symbol": {
      const sym = symbols.find((s) => s.id === layer.symbolId);
      if (!sym) {
        // unknown symbol: magenta disc, same visible-failure policy as resolvePaint
        return (
          <circle
            data-layer={layer.id}
            cx={layer.x + layer.size / 2} cy={layer.y + layer.size / 2} r={layer.size / 2}
            fill="#ff00ff"
          />
        );
      }
      return (
        <svg
          data-layer={layer.id}
          x={layer.x} y={layer.y} width={layer.size} height={layer.size}
          viewBox={sym.viewBox}
          onClick={onClick ? () => onClick(layer.id) : undefined}
        >
          {sym.paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.fill} />
          ))}
        </svg>
      );
    }
  }
}

import { useEffect, useRef, useState } from "react";
import { CardRenderer } from "./core/render/CardRenderer";
import { registerChannel, getChannel } from "./channels/registry";
import { pokemonChannel } from "./channels/pokemon";
import { POKEMON_FONTS } from "./channels/pokemon/fonts";
import { FrameworkSchema, type CardDocument, type Framework } from "./core/schema";
import { exportPixelSize, type ExportKind } from "./core/geometry";
import { svgToPngBlob, downloadBlob, exportFilename } from "./export/raster";

registerChannel(pokemonChannel);

const sampleCard: CardDocument = {
  schemaVersion: 1, channelId: "pokemon", frameworkId: "pokemon.sv.basic", frameworkVersion: "0.1.0",
  fields: {
    stage: "BASIC", name: "Dedenne", hp: "HP 70",
    "move1.name": "Forager", "move1.damage": "", "move1.text": "Draw any two Energy cards of your choice from the bank.",
    weakness: "×2", resistance: "",
    flavorText: "Since Dedenne can't generate much electricity on its own, it steals electricity from outlets.",
    illustrator: "Illus. Yuu Nishida", setInfo: "SVP EN · J",
  },
  overrides: { paletteId: "lightning" },
  meta: { title: "Dedenne sample", createdAt: "", modifiedAt: "" },
};

/**
 * Dev harness page (replaced by the real editor in M2).
 * Renders the built-in framework, or a locally traced one when the user has
 * generated public/traced/local.json with tools/img2framework.py.
 */
export default function App() {
  const channel = getChannel("pokemon");
  const [traced, setTraced] = useState<Framework | null>(null);
  const [useTraced, setUseTraced] = useState(false);
  const [paletteId, setPaletteId] = useState("lightning");
  const [hue, setHue] = useState(0);
  const trimRef = useRef<HTMLDivElement>(null);
  const bleedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/traced/local.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const parsed = FrameworkSchema.safeParse(data);
        if (parsed.success) {
          setTraced(parsed.data);
          setUseTraced(true);
        } else {
          console.error("traced framework failed validation:", parsed.error.message);
        }
      })
      .catch(() => undefined);
  }, []);

  const framework = useTraced && traced ? traced : channel.frameworks[0];
  const activePalette = useTraced && traced ? undefined : channel.palettes.find((p) => p.id === paletteId);
  const card: CardDocument = useTraced && traced
    ? { ...sampleCard, overrides: { parameters: { frameHue: hue } } }
    : sampleCard;

  async function doExport(kind: ExportKind, scale: number) {
    const host = kind === "mpc" ? bleedRef.current : trimRef.current;
    const svg = host?.querySelector("svg");
    if (!svg) return;
    const blob = await svgToPngBlob(svg as SVGSVGElement, { kind, scale });
    downloadBlob(blob, exportFilename(sampleCard.meta.title, kind, exportPixelSize({ kind, scale })));
  }

  return (
    <main style={{ display: "flex", gap: 32, padding: 32, alignItems: "flex-start" }}>
      <div ref={trimRef} style={{ width: 450 }}>
        <CardRenderer framework={framework} card={card} palette={activePalette} symbols={channel.symbols} fonts={POKEMON_FONTS} mode="trim" />
      </div>
      {/* hidden bleed-mode render used as the MPC export source */}
      <div ref={bleedRef} style={{ width: 0, height: 0, overflow: "hidden" }} aria-hidden>
        <CardRenderer framework={framework} card={card} palette={activePalette} symbols={channel.symbols} fonts={POKEMON_FONTS} mode="bleed" />
      </div>
      <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
        {traced && (
          <label>
            framework:{" "}
            <select value={useTraced ? "traced" : "builtin"} onChange={(e) => setUseTraced(e.target.value === "traced")}>
              <option value="traced">traced (local)</option>
              <option value="builtin">built-in vector</option>
            </select>
          </label>
        )}
        {!useTraced && (
          <label>
            palette:{" "}
            <select value={paletteId} onChange={(e) => setPaletteId(e.target.value)}>
              {channel.palettes.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
            </select>
          </label>
        )}
        {useTraced && (
          <label>
            hue {hue}°{" "}
            <input type="range" min={-180} max={180} value={hue} onChange={(e) => setHue(Number(e.target.value))} />
          </label>
        )}
        <button onClick={() => doExport("share", 1)}>export share 1×</button>
        <button onClick={() => doExport("print", 2)}>export print 2×</button>
        <button onClick={() => doExport("mpc", 2)}>export MPC-ready</button>
      </div>
    </main>
  );
}

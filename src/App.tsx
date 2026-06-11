import { useRef, useState } from "react";
import { CardRenderer } from "./core/render/CardRenderer";
import { registerChannel, getChannel } from "./channels/registry";
import { pokemonChannel } from "./channels/pokemon";
import { POKEMON_FONTS } from "./channels/pokemon/fonts";
import type { CardDocument } from "./core/schema";
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

export default function App() {
  const channel = getChannel("pokemon");
  const framework = channel.frameworks[0];
  const [paletteId, setPaletteId] = useState("lightning");
  const trimRef = useRef<HTMLDivElement>(null);
  const bleedRef = useRef<HTMLDivElement>(null);

  async function doExport(kind: ExportKind, scale: number) {
    const host = kind === "mpc" ? bleedRef.current : trimRef.current;
    const svg = host?.querySelector("svg");
    if (!svg) return;
    const blob = await svgToPngBlob(svg as SVGSVGElement, { kind, scale });
    downloadBlob(blob, exportFilename(sampleCard.meta.title, kind, exportPixelSize({ kind, scale })));
  }

  const activePalette = channel.palettes.find((p) => p.id === paletteId);
  return (
    <main style={{ display: "flex", gap: 32, padding: 32, alignItems: "flex-start" }}>
      <div ref={trimRef} style={{ width: 450 }}>
        <CardRenderer framework={framework} card={sampleCard} palette={activePalette} symbols={channel.symbols} fonts={POKEMON_FONTS} mode="trim" />
      </div>
      {/* hidden bleed-mode render used as the MPC export source */}
      <div ref={bleedRef} style={{ width: 0, height: 0, overflow: "hidden" }} aria-hidden>
        <CardRenderer framework={framework} card={sampleCard} palette={activePalette} symbols={channel.symbols} fonts={POKEMON_FONTS} mode="bleed" />
      </div>
      <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
        <label>
          palette:{" "}
          <select value={paletteId} onChange={(e) => setPaletteId(e.target.value)}>
            {channel.palettes.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>
        </label>
        <button onClick={() => doExport("share", 1)}>export share 1×</button>
        <button onClick={() => doExport("print", 2)}>export print 2×</button>
        <button onClick={() => doExport("mpc", 2)}>export MPC-ready</button>
      </div>
    </main>
  );
}

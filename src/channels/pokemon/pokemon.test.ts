import { describe, it, expect } from "vitest";
import { FrameworkSchema } from "../../core/schema";
import { pokemonChannel } from "./index";
import { TYPE_PALETTES } from "./palettes";

describe("pokemon channel", () => {
  it("every framework validates against the schema", () => {
    for (const fw of pokemonChannel.frameworks) {
      const r = FrameworkSchema.safeParse(fw);
      expect(r.success, `framework ${fw.id}: ${!r.success ? r.error.message : ""}`).toBe(true);
    }
  });
  it("ships all 11 energy-type palettes", () => {
    const ids = TYPE_PALETTES.map((p) => p.id).sort();
    expect(ids).toEqual(["colorless", "darkness", "dragon", "fighting", "fire", "grass", "lightning", "metal", "psychic", "water", "fairy"].sort());
  });
  it("sv-basic declares the slots the Fill rail needs", () => {
    const fw = pokemonChannel.frameworks.find((f) => f.id === "pokemon.sv.basic")!;
    const slots = JSON.stringify(fw.layers);
    for (const s of ["name", "hp", "art", "move1.name", "move1.text", "flavorText", "illustrator"]) {
      expect(slots, `missing slot ${s}`).toContain(`"${s}"`);
    }
  });
  it("the outer border extends into bleed", () => {
    const fw = pokemonChannel.frameworks.find((f) => f.id === "pokemon.sv.basic")!;
    const border = fw.layers.find((l) => l.id === "outer-border");
    expect(border && "bleed" in border && border.bleed).toBe("extend");
  });
  it("every symbol referenced by a framework exists in the symbol table", () => {
    const symbolIds = new Set(pokemonChannel.symbols.map((s) => s.id));
    const referenced = JSON.stringify(pokemonChannel.frameworks).match(/"symbolId":"([^"]+)"/g) ?? [];
    for (const m of referenced) {
      const id = m.slice('"symbolId":"'.length, -1);
      expect(symbolIds.has(id), `missing symbol ${id}`).toBe(true);
    }
  });
});

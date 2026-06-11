import type { ChannelDefinition } from "../types";
import { TYPE_PALETTES } from "./palettes";
import { POKEMON_SYMBOLS } from "./symbols";
import { svBasic } from "./frameworks/sv-basic";

export const pokemonChannel: ChannelDefinition = {
  id: "pokemon",
  name: "Pokémon",
  frameworks: [svBasic],
  palettes: TYPE_PALETTES,
  symbols: POKEMON_SYMBOLS,
  fieldSections: [
    { id: "basics", label: "Basics", fields: [
      { slot: "name", label: "Name", input: "text" },
      { slot: "hp", label: "Hitpoints", input: "text" },
      { slot: "stage", label: "Stage", input: "text" },
    ]},
    { id: "images", label: "Images", fields: [
      { slot: "art", label: "Card art", input: "image" },
    ]},
    { id: "moves", label: "Moves", fields: [
      { slot: "move1.name", label: "Move name", input: "text" },
      { slot: "move1.damage", label: "Damage", input: "text" },
      { slot: "move1.text", label: "Move text", input: "multiline" },
    ]},
    { id: "typebar", label: "Type Bar", fields: [
      { slot: "weakness", label: "Weakness modifier", input: "text" },
      { slot: "resistance", label: "Resistance modifier", input: "text" },
    ]},
    { id: "cardinfo", label: "Card Info", fields: [
      { slot: "illustrator", label: "Illustrator", input: "text" },
      { slot: "setInfo", label: "Set text", input: "text" },
      { slot: "flavorText", label: "Flavor text", input: "multiline" },
    ]},
  ],
};

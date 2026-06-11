# Pokemon Card Typography (Sword & Shield / Scarlet & Violet era)

Source: font role assignments extracted from the pokecardmaker.net source code (local clone in `reference/pokecardmaker`, see `src/utils/fonts.ts` and the per-field style files). The authentic faces are commercial Monotype/Linotype fonts and cannot be redistributed in this repo. The app ships OFL-licensed substitutes via Fontsource; users who own the authentic fonts can swap them in locally (planned for M3).

## Role table

| Role id | Card section | Authentic font | Shipped substitute | Fontsource package |
| --- | --- | --- | --- | --- |
| `name` | Card name | Gill Sans Std Regular Bold (tight tracking) | Cabin 700 | `@fontsource/cabin` |
| `hpNumber` | HP value | Gill Sans Std Ultra Bold | Cabin 700 (larger size compensates) | `@fontsource/cabin` |
| `hpPrefix` | The small "HP" text | Futura LT Medium Bold | Jost 700 | `@fontsource/jost` |
| `stage` | Stage label (Basic/Stage 1/2) | Frutiger LT 66 Bold Italic | Inter 700 italic | `@fontsource/inter` |
| `attackName` | Attack and ability names | Gill Sans Std Bold Condensed | Cabin Condensed 700 | `@fontsource/cabin-condensed` |
| `body` | Attack and ability text | Gill Sans Std Regular | Cabin 400 | `@fontsource/cabin` |
| `damage` | Attack damage number | Futura Std Heavy | Jost 800 | `@fontsource/jost` |
| `typeBar` | Weakness / resistance / retreat labels | Futura LT Medium Bold | Jost 700 | `@fontsource/jost` |
| `illustrator` | Illustrator credit | Futura Std Bold Oblique | Jost 700 italic | `@fontsource/jost` |
| `setNumber` | Set numerals and regulation mark | Frutiger LT 66 Bold Italic | Inter 700 italic | `@fontsource/inter` |
| `flavor` | Flavor text / dex entry | Optima Medium | Tenor Sans | `@fontsource/tenor-sans` |
| `copyright` | Copyright line | Frutiger LT 55 Roman | Inter 400 | `@fontsource/inter` |
| (none) | Energy and TCG symbols | PKMN TCG symbol font | Drawn as SVG symbols, no font needed | n/a |

## Notes

- The name on real cards uses negative letter spacing (about -0.05em). The renderer supports `letterSpacing` per text layer for this.
- Substitute choice rationale: Cabin is the closest OFL humanist sans to Gill Sans with a matching condensed family; Jost is the standard OFL Futura analogue with heavy weights; Inter covers Frutiger's neutral humanist roles; Tenor Sans is the closest OFL face to Optima's flared letterforms.
- Substitutes are mapped per role, not per font file, so improving any single substitution later is a one-line change in `src/channels/pokemon/fonts.ts`.

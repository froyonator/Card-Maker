# Card Maker

An open-source web app for designing custom trading cards. Card frames are defined as data and drawn as vectors, so every part of a card (colors, shapes, text regions, symbols) can be edited, restyled, and extended. Exports render at any resolution, including print-ready output for makeplayingcards.com with real bleed.

## Status

Early development. The core rendering engine, a first Pokemon-style framework, and PNG/MPC export are working behind a development harness. The interactive editor is the current milestone. There is no public deployment yet.

## Why another card maker

Existing tools build cards from fixed template images. The template cannot be recolored, adjusted, or extended, and print preparation needs raster post-processing. Card Maker defines frames as layered vector documents instead:

- Any color or shape in the frame is editable.
- New card types, eras, and games plug in as data packs (channels), not code rewrites.
- Print bleed is drawn by the renderer, not faked by stretching pixel edges.
- Frameworks are JSON, so the community can build and share their own.

## Development

Requires Node 20 or newer.

```
npm install
npm run dev        # dev server
npm run test       # unit tests (Vitest)
npm run build      # type-check and production build
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/core/` | Rendering engine: schema, geometry, parameter resolution, SVG renderer |
| `src/channels/` | Card-game content packs (currently: Pokemon, Scarlet & Violet era) |
| `src/export/` | PNG and print-ready rasterization |
| `docs/superpowers/` | Design specs and implementation plans |
| `.claude/` | Shared project context for AI-assisted development (rules, decision log) |
| `CHANGELOG.md` | Versioned change history |

## Legal

This is an unofficial fan project. Pokemon and all related properties are trademarks of Nintendo, Creatures Inc., and GAME FREAK Inc. This tool ships no official card scans or artwork; built-in frames are original vector recreations for personal, non-commercial fan use. Do not sell cards made with this tool.

## License

[MIT](LICENSE)

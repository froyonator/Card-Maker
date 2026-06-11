# Tools

Standalone utilities. Not part of the app build.

## img2framework.py

Converts a raster image into Card Maker framework layers: vtracer traces the image into colored vector paths, the script rescales them into the 750x1050 card design space, and writes framework `shape` layers as JSON.

Requirements: Python 3.10+ and `pip install vtracer`.

```
python tools/img2framework.py input.png -o out.json
python tools/img2framework.py input.png -o out.json --framework --id my.framework
python tools/img2framework.py input.png -o out.json --param frameColor=#f2cf45 --tolerance 24
```

Options:

| Flag | Effect |
| --- | --- |
| `-o, --output` | Output JSON path (required) |
| `--framework` | Emit a complete Framework document instead of a bare layer array |
| `--id` | Framework id used with `--framework` |
| `--max-colors` | vtracer color precision, default 8. Higher = more faithful, more layers |
| `--filter-speckle` | Drop traced fragments smaller than this, default 8 |
| `--param NAME=#HEX` | Replace traced colors near #HEX with the `$NAME` parameter reference (repeatable) |
| `--tolerance` | Per-channel color distance for `--param` matching, default 16 |

`tools/traced-output.test.ts` validates any JSON in `reference/generated/` against the engine schema during `npm run test`.

### Copyright rule

Tracing an image produces a derivative work of that image. Output traced from official card templates or any third-party art must stay in the gitignored `reference/` folder and is for personal use only. Only hand-authored frameworks are committed to this repository.

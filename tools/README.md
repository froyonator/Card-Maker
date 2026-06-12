# Tools

Standalone utilities. Not part of the app build.

## img2framework.py

Converts a raster image into a complete, loadable Card Maker framework: vtracer traces the image into colored vector paths at a chosen quality, the script rescales them into the 750x1050 card design space, wraps the chrome in a recolorable group, and merges slot layers (text fields, art windows, symbols) into the document.

Requirements: Python 3.10+, `pip install vtracer pillow`.

```
python tools/img2framework.py template.png -o out.json --framework --id my.frame
python tools/img2framework.py template.png -o public/traced/local.json --framework \
    --quality high --key-transparent --hue-param frameHue \
    --slots tools/layouts/sv-basic.slots.json
```

The dev harness auto-loads `public/traced/local.json` when it exists and adds a framework dropdown plus a hue slider.

Options:

| Flag | Effect |
| --- | --- |
| `-o, --output` | Output JSON path (required) |
| `--framework` | Emit a complete Framework document instead of a bare layer array |
| `--id` | Framework id used with `--framework` |
| `--quality` | `low`, `medium`, `high` (default), `ultra`. Higher = more paths, larger file |
| `--key-transparent` | Flatten transparency onto a key color and drop those traced paths |
| `--hue-param NAME` | Wrap the chrome in a group recolorable by the NAME number parameter (degrees, rendered as a hue-rotate filter) |
| `--under FILE` | JSON array of layers rendered under the traced chrome |
| `--slots FILE` | JSON array of layers rendered over the chrome: art windows, text slots, symbols |
| `--param NAME=#HEX` | Replace traced colors near #HEX with the `$NAME` parameter reference (repeatable) |
| `--tolerance` | Per-channel color distance for `--param` matching, default 16 |

Layout files live in `tools/layouts/`. They are plain framework layer arrays; the slot coordinates for the S&V basic layout were measured from the template geometry and the reference editor's CSS.

Known behavior: traced chrome has no transparent hole where the source image was transparent (stacked tracing paints the bottom color region across it), so window content like card art goes in `--slots`, sized to the window. `tools/traced-output.test.ts` validates any JSON in `reference/generated/` against the engine schema during `npm run test`.

### Copyright rule

Tracing an image produces a derivative work of that image. Output traced from official card templates or any third-party art must stay in the gitignored folders (`reference/`, `public/traced/`) and is for personal use only. Only hand-authored frameworks and these generic tools are committed to this repository.

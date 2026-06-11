"""Convert a raster image into Card Maker framework layers.

Traces the image into colored vector paths with vtracer, rescales every path
into the 750x1050 card design space, and emits the result as framework `shape`
layers (JSON). Optionally maps traced colors onto named framework parameters so
the output recolors with palettes.

Usage:
  python tools/img2framework.py input.png -o out.json
  python tools/img2framework.py input.png -o out.json --framework --id pokemon.sv.traced
  python tools/img2framework.py input.png -o out.json --param frameColor=#f2cf45 --tolerance 24

Notes:
  Tracing a copyrighted template produces a derivative work. Outputs traced
  from official card scans must stay in the gitignored reference/ folder and
  are for personal use only. See tools/README.md.
"""
import argparse
import json
import os
import re
import sys
import tempfile

import vtracer

# Card design space (must match src/core/geometry.ts).
CUT_W = 750
CUT_H = 1050

PATH_RE = re.compile(r'<path[^>]*\bd="([^"]+)"[^>]*\bfill="([^"]+)"[^>]*/?>')
PATH_RE_SWAPPED = re.compile(r'<path[^>]*\bfill="([^"]+)"[^>]*\bd="([^"]+)"[^>]*/?>')
TRANSFORM_RE = re.compile(r'transform="translate\(([-\d.]+),([-\d.]+)\)"')
SIZE_RE = re.compile(r'<svg[^>]*\bwidth="([\d.]+)[^"]*"[^>]*\bheight="([\d.]+)', re.S)
NUM_RE = re.compile(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")


def scale_path(d, sx, sy, tx=0.0, ty=0.0):
    """Rescale an absolute-coordinate path string into the design space.

    vtracer emits absolute M/L/C/Z commands. Coordinates alternate x,y inside
    each command, so scaling is positional. Relative (lowercase) commands would
    scale incorrectly and abort the run.
    """
    out = []
    is_x = True
    for token in re.finditer(r"[A-Za-z]|" + NUM_RE.pattern, d):
        t = token.group(0)
        if t.isalpha():
            if t in ("Z", "z"):
                out.append("Z")
            elif t in "MLCQTSHV":
                out.append(t)
                is_x = t != "V"
            else:
                raise SystemExit(f"unsupported path command '{t}'; expected absolute commands only")
            continue
        v = float(t)
        if out and out[-1] == "H":
            out.append(f"{(v + tx) * sx:.2f}")
            continue
        if out and out[-1] == "V":
            out.append(f"{(v + ty) * sy:.2f}")
            continue
        out.append(f"{(v + tx) * sx:.2f}" if is_x else f"{(v + ty) * sy:.2f}")
        is_x = not is_x
    return " ".join(out)


def hex_to_rgb(value):
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def close_enough(a, b, tolerance):
    return all(abs(x - y) <= tolerance for x, y in zip(a, b))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="raster image (png/jpg)")
    ap.add_argument("-o", "--output", required=True, help="output JSON path")
    ap.add_argument("--max-colors", type=int, default=8, help="color precision passed to vtracer (default 8)")
    ap.add_argument("--filter-speckle", type=int, default=8, help="drop traced specks smaller than this (default 8)")
    ap.add_argument("--param", action="append", default=[], metavar="NAME=#HEX",
                    help="map traced colors near #HEX to the $NAME parameter (repeatable)")
    ap.add_argument("--tolerance", type=int, default=16, help="per-channel color match tolerance (default 16)")
    ap.add_argument("--framework", action="store_true", help="emit a full Framework document instead of a layer array")
    ap.add_argument("--id", default="traced.framework", help="framework id when using --framework")
    args = ap.parse_args()

    params = {}
    for spec in args.param:
        name, _, hexval = spec.partition("=")
        if not hexval.startswith("#"):
            ap.error(f"--param {spec}: expected NAME=#HEX")
        params[name] = hex_to_rgb(hexval)

    with tempfile.TemporaryDirectory() as tmp:
        svg_path = os.path.join(tmp, "traced.svg")
        vtracer.convert_image_to_svg_py(
            args.input, svg_path,
            colormode="color", hierarchical="stacked", mode="spline",
            filter_speckle=args.filter_speckle, color_precision=args.max_colors,
        )
        svg = open(svg_path, encoding="utf-8").read()

    size = SIZE_RE.search(svg)
    if not size:
        raise SystemExit("could not read traced SVG dimensions")
    sx = CUT_W / float(size.group(1))
    sy = CUT_H / float(size.group(2))

    layers = []
    matches = PATH_RE.findall(svg)
    swapped = False
    if not matches:
        matches = [(d, f) for f, d in PATH_RE_SWAPPED.findall(svg)]
        swapped = True
    # vtracer puts per-path offsets in transform attributes; capture them in document order.
    transforms = TRANSFORM_RE.findall(svg)
    for i, (d, fill) in enumerate(matches):
        tx, ty = (float(v) for v in transforms[i]) if i < len(transforms) else (0.0, 0.0)
        paint = fill
        if fill.startswith("#") and params:
            rgb = hex_to_rgb(fill)
            for name, target in params.items():
                if close_enough(rgb, target, args.tolerance):
                    paint = f"${name}"
                    break
        layers.append({
            "kind": "shape",
            "id": f"trace-{i:04d}",
            "bleed": "clip",
            "shape": {"type": "path", "d": scale_path(d, sx, sy, tx, ty)},
            "fill": paint,
        })

    if args.framework:
        result = {
            "schemaVersion": 1,
            "id": args.id, "version": "0.1.0", "channelId": "traced",
            "name": args.id, "variant": "traced",
            "parameters": [
                {"name": name, "type": "color", "default": "#%02x%02x%02x" % rgb}
                for name, rgb in params.items()
            ],
            "layers": layers,
        }
    else:
        result = layers

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    mapped = sum(1 for l in layers if str(l["fill"]).startswith("$"))
    print(f"traced {len(layers)} layers ({mapped} mapped to parameters, swapped-attrs={swapped}) -> {args.output}")


if __name__ == "__main__":
    main()

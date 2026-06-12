"""Convert a raster image into Card Maker framework layers.

Pipeline: optionally flatten transparency onto a key color, trace the image
into colored vector paths with vtracer at a chosen quality, rescale everything
into the 750x1050 card design space, drop the keyed (window) paths, wrap the
chrome in a recolorable group, and merge user-defined slot layers under and
over it. The output is a complete, loadable Framework document.

Usage:
  python tools/img2framework.py template.png -o out.json --framework --id my.frame
  python tools/img2framework.py template.png -o out.json --framework \
      --quality high --key-transparent --hue-param frameHue \
      --under tools/layouts/sv-basic.under.json \
      --slots tools/layouts/sv-basic.slots.json

Copyright rule: output traced from official card templates stays in gitignored
folders (reference/, public/traced/) and is for personal use only. See
tools/README.md.
"""
import argparse
import json
import os
import re
import sys
import tempfile

import numpy as np
import vtracer
from PIL import Image

# Card design space (must match src/core/geometry.ts).
CUT_W = 750
CUT_H = 1050

# Flatten color for transparent regions; dropped from the trace afterwards.
KEY_COLOR = (255, 0, 254)

# vtracer tuning per quality level: (color_precision, layer_difference, filter_speckle).
QUALITY = {
    "low": (6, 32, 16),
    "medium": (7, 16, 8),
    "high": (8, 8, 4),
    "ultra": (8, 4, 2),
}

PATH_RE = re.compile(r'<path[^>]*\bd="([^"]+)"[^>]*\bfill="([^"]+)"[^>]*/?>')
PATH_RE_SWAPPED = re.compile(r'<path[^>]*\bfill="([^"]+)"[^>]*\bd="([^"]+)"[^>]*/?>')
TRANSFORM_RE = re.compile(r'transform="translate\(([-\d.]+),([-\d.]+)\)"')
SIZE_RE = re.compile(r'<svg[^>]*\bwidth="([\d.]+)[^"]*"[^>]*\bheight="([\d.]+)', re.S)
NUM_RE = re.compile(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")


def scale_path(d, sx, sy, tx=0.0, ty=0.0):
    """Rescale an absolute-coordinate path string into the design space.

    vtracer emits absolute commands; coordinates alternate x,y inside each
    command, so scaling is positional. Relative (lowercase) commands would
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


def load_layer_file(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise SystemExit(f"{path}: expected a JSON array of layers")
    return data


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="raster image (png/jpg)")
    ap.add_argument("-o", "--output", required=True, help="output JSON path")
    ap.add_argument("--quality", choices=QUALITY, default="high", help="trace fidelity (default high)")
    ap.add_argument("--key-transparent", action="store_true",
                    help="flatten transparency onto a key color and drop those paths (cuts art windows out of the chrome)")
    ap.add_argument("--erase", action="append", default=[], metavar="X,Y,W,H",
                    help="blank a region (design units) before tracing, e.g. a watermark; "
                         "each row is filled with its left-neighbor pixel so gradients survive (repeatable)")
    ap.add_argument("--hue-param", metavar="NAME",
                    help="wrap the traced chrome in a group recolorable by the NAME number parameter (degrees)")
    ap.add_argument("--under", metavar="FILE", help="JSON array of layers rendered under the traced chrome (e.g. the art slot)")
    ap.add_argument("--slots", metavar="FILE", help="JSON array of layers rendered over the traced chrome (text slots, symbols)")
    ap.add_argument("--param", action="append", default=[], metavar="NAME=#HEX",
                    help="map traced colors near #HEX to the $NAME parameter (repeatable)")
    ap.add_argument("--tolerance", type=int, default=16, help="per-channel color match tolerance (default 16)")
    ap.add_argument("--framework", action="store_true", help="emit a full Framework document instead of a layer array")
    ap.add_argument("--id", default="traced.framework", help="framework id when using --framework")
    args = ap.parse_args()

    color_params = {}
    for spec in args.param:
        name, _, hexval = spec.partition("=")
        if not hexval.startswith("#"):
            ap.error(f"--param {spec}: expected NAME=#HEX")
        color_params[name] = hex_to_rgb(hexval)

    precision, layer_diff, speckle = QUALITY[args.quality]

    erase_rects = []
    for spec in args.erase:
        parts = spec.split(",")
        if len(parts) != 4:
            ap.error(f"--erase {spec}: expected X,Y,W,H in design units")
        erase_rects.append(tuple(float(p) for p in parts))

    with tempfile.TemporaryDirectory() as tmp:
        src = args.input
        if erase_rects:
            im = Image.open(src).convert("RGBA")
            a = np.array(im)
            ih, iw = a.shape[:2]
            for (ex, ey, ew, eh) in erase_rects:
                # Design units to source pixels.
                x0 = max(0, int(ex * iw / CUT_W))
                x1 = min(iw, int((ex + ew) * iw / CUT_W))
                y0 = max(0, int(ey * ih / CUT_H))
                y1 = min(ih, int((ey + eh) * ih / CUT_H))
                if x0 <= 0 or x1 <= x0 or y1 <= y0:
                    raise SystemExit(f"--erase {ex},{ey},{ew},{eh}: region empty or flush with the left edge")
                a[y0:y1, x0:x1] = a[y0:y1, x0 - 1:x0]
            src = os.path.join(tmp, "erased.png")
            Image.fromarray(a, "RGBA").save(src)
        if args.key_transparent:
            # Alpha-aware flatten. Blending semi-transparent edge pixels with the
            # magenta key leaves purple fringes in the trace, so instead: weak
            # alpha (soft shadows, holes) becomes pure key and drops out; solid
            # pixels composite onto white, which matches card stock.
            a = np.array(Image.open(src).convert("RGBA")).astype(np.float32)
            rgb, alpha = a[..., :3], a[..., 3:4] / 255.0
            flat = rgb * alpha + 255.0 * (1.0 - alpha)
            weak = a[..., 3] < 128
            flat[weak] = KEY_COLOR
            src = os.path.join(tmp, "keyed.png")
            Image.fromarray(flat.astype(np.uint8), "RGB").save(src)

        svg_path = os.path.join(tmp, "traced.svg")
        # Stacked mode gives the cleanest region rendering. The traced chrome has
        # no real hole where the source was transparent (the bottom color blob
        # spans it), so window slots like card art belong in --slots (above the
        # chrome), sized to the window. --key-transparent still drops the keyed
        # window path itself so it cannot tint the area.
        vtracer.convert_image_to_svg_py(
            src, svg_path,
            colormode="color", hierarchical="stacked", mode="spline",
            filter_speckle=speckle, color_precision=precision, layer_difference=layer_diff,
        )
        svg = open(svg_path, encoding="utf-8").read()

    size = SIZE_RE.search(svg)
    if not size:
        raise SystemExit("could not read traced SVG dimensions")
    sx = CUT_W / float(size.group(1))
    sy = CUT_H / float(size.group(2))

    matches = PATH_RE.findall(svg)
    if not matches:
        matches = [(d, f) for f, d in PATH_RE_SWAPPED.findall(svg)]
    transforms = TRANSFORM_RE.findall(svg)

    chrome = []
    dropped = 0
    for i, (d, fill) in enumerate(matches):
        tx, ty = (float(v) for v in transforms[i]) if i < len(transforms) else (0.0, 0.0)
        paint = fill
        if fill.startswith("#"):
            rgb = hex_to_rgb(fill)
            # The keyed window color is not chrome; dropping it opens the hole
            # the under-layers (user art) show through.
            if args.key_transparent and close_enough(rgb, KEY_COLOR, 60):
                dropped += 1
                continue
            for name, target in color_params.items():
                if close_enough(rgb, target, args.tolerance):
                    paint = f"${name}"
                    break
        chrome.append({
            "kind": "shape",
            "id": f"trace-{i:04d}",
            "bleed": "clip",
            "shape": {"type": "path", "d": scale_path(d, sx, sy, tx, ty)},
            "fill": paint,
        })

    chrome_group = {"kind": "group", "id": "traced-chrome", "children": chrome}
    if args.hue_param:
        chrome_group["hueShift"] = args.hue_param

    layers = []
    if args.under:
        layers += load_layer_file(args.under)
    layers.append(chrome_group)
    if args.slots:
        layers += load_layer_file(args.slots)

    if args.framework:
        parameters = [
            {"name": name, "type": "color", "default": "#%02x%02x%02x" % rgb}
            for name, rgb in color_params.items()
        ]
        if args.hue_param:
            parameters.append({"name": args.hue_param, "type": "number", "default": 0})
        result = {
            "schemaVersion": 1,
            "id": args.id, "version": "0.1.0", "channelId": "traced",
            "name": args.id, "variant": "traced",
            "parameters": parameters,
            "layers": layers,
        }
    else:
        result = layers

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=1)
    mapped = sum(1 for l in chrome if str(l["fill"]).startswith("$"))
    print(f"traced {len(chrome)} chrome paths ({mapped} color-mapped, {dropped} keyed-out), "
          f"quality={args.quality} -> {args.output} ({os.path.getsize(args.output) // 1024} KB)")


if __name__ == "__main__":
    main()

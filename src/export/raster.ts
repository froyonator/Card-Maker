import { exportPixelSize, type ExportRequest, type PixelSize } from "../core/geometry";

export function exportFilename(title: string, kind: string, size: PixelSize): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "card";
  return `${slug}-${kind}-${size.width}x${size.height}.png`;
}

/**
 * Rasterize a live card SVG element to a PNG blob.
 * The caller passes the SVG rendered in the right mode (trim for share/print, bleed for mpc).
 * M1 limitation (lifted in M3): user images must be data/blob URLs; fonts are system fonts.
 */
export async function svgToPngBlob(svgEl: SVGSVGElement, req: ExportRequest): Promise<Blob> {
  const size = exportPixelSize(req);
  const xml = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("SVG rasterization failed to load"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d canvas context unavailable");
    // MPC requires opaque RGB: paint white under everything (extend layers cover it anyway).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(img, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!blob) throw new Error("PNG encoding failed");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

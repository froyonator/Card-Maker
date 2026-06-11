/** Card design space: MPC poker cut, 2.5"x3.5" at 300 DPI. One user unit = one 300-DPI pixel. */
export const CUT_W = 750;
export const CUT_H = 1050;
/** Bleed per side, same units (3.05mm at 300 DPI). MPC trims this off. */
export const BLEED = 36;
/** MPC rejects uploads narrower than 822px; we floor at 2x for quality. */
export const MPC_MIN_WIDTH = 1644;

export interface ViewBox { x: number; y: number; w: number; h: number; }
export const TRIM_VIEWBOX: ViewBox = { x: 0, y: 0, w: CUT_W, h: CUT_H };
export const BLEED_VIEWBOX: ViewBox = { x: -BLEED, y: -BLEED, w: CUT_W + 2 * BLEED, h: CUT_H + 2 * BLEED };

export type ExportKind = "share" | "print" | "mpc";
export interface ExportRequest { kind: ExportKind; scale?: number; customWidth?: number; }
export interface PixelSize { width: number; height: number; }

export function exportPixelSize(req: ExportRequest): PixelSize {
  const aspectBox = req.kind === "mpc" ? BLEED_VIEWBOX : TRIM_VIEWBOX;
  let width: number;
  if (req.customWidth !== undefined) {
    width = Math.round(req.customWidth);
  } else {
    width = aspectBox.w * (req.scale ?? 1);
  }
  if (req.kind === "mpc" && width < MPC_MIN_WIDTH) width = MPC_MIN_WIDTH;
  const height = Math.round(width * (aspectBox.h / aspectBox.w));
  return { width, height };
}

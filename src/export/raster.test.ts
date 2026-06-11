import { describe, it, expect } from "vitest";
import { exportFilename } from "./raster";

describe("exportFilename", () => {
  it("slugifies the title and stamps kind + size", () => {
    expect(exportFilename("My Dedenne!", "mpc", { width: 1644, height: 2244 }))
      .toBe("my-dedenne-mpc-1644x2244.png");
  });
  it("falls back to 'card' for empty titles", () => {
    expect(exportFilename("", "share", { width: 750, height: 1050 })).toBe("card-share-750x1050.png");
  });
});

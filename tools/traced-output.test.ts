import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { FrameworkSchema } from "../src/core/schema";

/**
 * Validates locally generated tracer output against the engine schema.
 * reference/generated/ is gitignored (traced official templates stay local),
 * so this suite is a no-op on machines without local traces.
 */
const dir = join(__dirname, "..", "reference", "generated");
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];

describe("img2framework output", () => {
  it.skipIf(files.length === 0)("every traced file parses as a Framework or layer array", () => {
    for (const file of files) {
      const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
      const result = Array.isArray(data)
        ? FrameworkSchema.safeParse({
            schemaVersion: 1, id: "t", version: "0", channelId: "t", name: "t", variant: "t",
            parameters: [], layers: data,
          })
        : FrameworkSchema.safeParse(data);
      expect(result.success, `${file}: ${!result.success ? result.error.message.slice(0, 300) : ""}`).toBe(true);
    }
  });
});

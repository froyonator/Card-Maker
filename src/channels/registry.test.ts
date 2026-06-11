import { describe, it, expect } from "vitest";
import { registerChannel, getChannel, listChannels } from "./registry";
import type { ChannelDefinition } from "./types";

const fake: ChannelDefinition = { id: "fake", name: "Fake", frameworks: [], palettes: [], symbols: [], fieldSections: [] };

describe("channel registry", () => {
  it("round-trips a registration", () => {
    registerChannel(fake);
    expect(getChannel("fake")).toBe(fake);
    expect(listChannels().some((c) => c.id === "fake")).toBe(true);
  });
  it("throws on unknown channel", () => {
    expect(() => getChannel("nope")).toThrow(/unknown channel/i);
  });
  it("rejects duplicate ids", () => {
    expect(() => registerChannel(fake)).toThrow(/already registered/i);
  });
});

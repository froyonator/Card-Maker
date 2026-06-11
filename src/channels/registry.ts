import type { ChannelDefinition } from "./types";

const channels = new Map<string, ChannelDefinition>();

export function registerChannel(def: ChannelDefinition): void {
  if (channels.has(def.id)) throw new Error(`channel "${def.id}" already registered`);
  channels.set(def.id, def);
}
export function getChannel(id: string): ChannelDefinition {
  const c = channels.get(id);
  if (!c) throw new Error(`unknown channel "${id}"`);
  return c;
}
export function listChannels(): ChannelDefinition[] {
  return [...channels.values()];
}

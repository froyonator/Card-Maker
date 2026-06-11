export type Measure = (s: string) => number;

/** Greedy word-wrap. Deterministic given a measurer, so it is export-safe (no foreignObject). */
export function wrapText(text: string, maxWidth: number, measure: Measure, maxLines?: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let line = "";

  const pushWord = (word: string) => {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= maxWidth) { line = candidate; return; }
    if (line) { lines.push(line); line = ""; }
    // single word wider than the box: hard-break by characters
    let chunk = "";
    for (const ch of word) {
      if (measure(chunk + ch) > maxWidth && chunk) { lines.push(chunk); chunk = ""; }
      chunk += ch;
    }
    line = chunk;
  };

  for (const word of text.split(/\s+/)) pushWord(word);
  if (line) lines.push(line);

  if (maxLines !== undefined && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(last.trimEnd() + "…") > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = last.trimEnd() + "…";
    return kept;
  }
  return lines;
}

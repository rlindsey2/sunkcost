/**
 * Fitting text into a card, for every card the build draws.
 *
 * resvg cannot measure a string before it draws it, so the layout works from an
 * estimate: the sans faces these cards are drawn in average a little under
 * 0.6 em per character. Deliberately pessimistic, because a name that runs off
 * the edge of the card is worse than one that breaks a line early.
 */
export const EM = 0.58;
/** Bold and medium faces set wider, and a name that runs off the card is worse than one that breaks early. */
export const EM_BOLD = 0.66;

export function fitsIn(s: string, size: number, maxPx: number, em = EM): boolean {
  return s.length * size * em <= maxPx;
}

/** The string, or as much of it as fits with an ellipsis on the end. */
export function clampText(s: string, size: number, maxPx: number, em = EM): string {
  if (fitsIn(s, size, maxPx, em)) return s;
  const max = Math.max(1, Math.floor(maxPx / (size * em)) - 1);
  return `${s.slice(0, max).trimEnd()}…`;
}

/**
 * Up to `lines` lines, the last one clamped if it still runs long. Breaks at a
 * space, or at a hyphen where there is no space to use: several model names are
 * one hyphenated word ("DeepSeek-R1-Distill-Qwen-32B") and would otherwise have
 * to be cut short.
 */
export function wrapText(s: string, size: number, maxPx: number, lines = 2, em = EM): string[] {
  const out: string[] = [];
  let rest = s.trim();
  while (rest && out.length < lines) {
    if (fitsIn(rest, size, maxPx, em) || out.length === lines - 1) {
      out.push(clampText(rest, size, maxPx, em));
      return out;
    }
    const max = Math.floor(maxPx / (size * em));
    const space = rest.lastIndexOf(' ', max);
    const hyphen = rest.lastIndexOf('-', max - 1);
    if (space <= 0 && hyphen <= 0) {
      out.push(clampText(rest, size, maxPx, em));
      return out;
    }
    // the hyphen stays at the end of the line it broke, as it would in print
    const cut = space > 0 ? space : hyphen + 1;
    out.push(rest.slice(0, cut));
    rest = rest.slice(space > 0 ? cut + 1 : cut);
  }
  return out;
}

/**
 * The largest of `sizes` at which the whole string fits in `maxLines`, so a long
 * name comes out smaller rather than cut short. Falls back to the smallest size.
 */
export function fitLines(s: string, sizes: number[], maxPx: number, maxLines: number, em = EM): { size: number; lines: string[] } {
  for (const size of sizes) {
    const ls = wrapText(s, size, maxPx, maxLines, em);
    if (!ls.some((l) => l.endsWith('…'))) return { size, lines: ls };
  }
  const size = sizes[sizes.length - 1];
  return { size, lines: wrapText(s, size, maxPx, maxLines, em) };
}

/**
 * The largest of `sizes` at which the string fits on one line, or the smallest
 * when none of them do. For a line that must not wrap, like a card's headline.
 */
export function fitOneLine(s: string, sizes: number[], maxPx: number, em = EM): number {
  return sizes.find((size) => fitsIn(s, size, maxPx, em)) ?? sizes[sizes.length - 1];
}

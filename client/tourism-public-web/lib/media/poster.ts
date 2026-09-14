/**
 * Card artwork.
 *
 * Most tours and houses have no photo yet, and a grid of grey rectangles with a
 * stray initial in them is what made the old cards look broken. Until real
 * photos are uploaded through the dashboard, each record gets a stable duotone
 * poster instead: derived from its id, so a given tour keeps the same one on
 * every render and across deploys.
 *
 * The moment a photo exists, `imageUrl()` wins and none of this is used.
 */

const PALETTES: ReadonlyArray<readonly [string, string]> = [
  ["#0f4c5c", "#1b8a7a"], // sea
  ["#7a3e2f", "#c2603f"], // terracotta
  ["#2f3c57", "#5d7fa8"], // dusk
  ["#4a3a63", "#8d6fa8"], // plum
  ["#23503f", "#5f9e6a"], // pine
  ["#6b4b1f", "#c99342"], // sand
];

/** Hash of the id, so the choice is stable rather than random per render. */
function paletteFor(seed: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length];
}

/**
 * A CSS gradient plus a faint grain, returned as inline style props. Kept as a
 * gradient rather than an <img> so there is no request and nothing to fail.
 */
export function posterStyle(seed: string): React.CSSProperties {
  const [from, to] = paletteFor(seed);
  return {
    backgroundImage: `radial-gradient(120% 120% at 15% 0%, ${to} 0%, ${from} 70%)`,
  };
}

/** The initials shown on a poster: two words at most, never more than 2 chars. */
export function posterInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0)).join("");
}

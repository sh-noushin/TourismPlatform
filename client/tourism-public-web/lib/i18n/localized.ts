/**
 * Picks the field the reader can actually read.
 *
 * Records carry Persian text plus an optional English translation. A missing
 * or blank translation falls back to the Persian: an English visitor seeing a
 * Persian tour name is imperfect, but seeing an empty card is broken.
 */
export function localized(
  persian: string | null | undefined,
  english: string | null | undefined,
  locale: string,
): string {
  if (locale === "en" && english && english.trim()) {
    return english;
  }
  return persian ?? "";
}

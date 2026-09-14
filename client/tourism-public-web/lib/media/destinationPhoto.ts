/**
 * Destination photography for records that carry no uploaded photo.
 *
 * These are Wikimedia Commons files of the actual places -- freely licensed,
 * and matched to the record by the destination named in its title. It is a
 * demo-content stopgap with a deliberate order of preference:
 *
 *   1. a photo uploaded through the dashboard   (the real answer)
 *   2. a Commons photo of that destination      (here)
 *   3. the record's duotone poster              (poster.ts)
 *
 * Matching is on the Persian name because that is what the catalogue is
 * written in; the English keys alongside cover the English locale.
 */

interface DestinationPhoto {
  /** Any of these appearing in the title or location wins the match. */
  keywords: string[];
  url: string;
}

// Served from /public rather than hotlinked: Wikimedia rate-limits direct
// linking (HTTP 429), which left cards showing broken images on a cold cache.
// Provenance and licence for each file are in CREDITS.md beside them.
const PHOTOS: DestinationPhoto[] = [
  {
    keywords: ["تخت جمشید", "پاسارگاد", "persepolis"],
    url: "/images/destinations/persepolis.jpg",
  },
  {
    keywords: ["اصفهان", "نصف جهان", "چهارباغ", "isfahan"],
    url: "/images/destinations/isfahan.jpg",
  },
  {
    keywords: ["ماسوله", "گیلان", "masuleh"],
    url: "/images/destinations/masuleh.jpg",
  },
  {
    keywords: ["قشم", "هنگام", "qeshm"],
    url: "/images/destinations/qeshm.jpg",
  },
  {
    keywords: ["کیش", "kish"],
    url: "/images/destinations/kish.jpg",
  },
  {
    keywords: ["مشهد", "حرم", "زیارت", "mashhad"],
    url: "/images/destinations/mashhad.jpg",
  },
  {
    keywords: ["دماوند", "damavand"],
    url: "/images/destinations/damavand.jpg",
  },
  {
    keywords: ["لوت", "کویر", "شهداد", "desert"],
    url: "/images/destinations/lut.jpg",
  },
  {
    keywords: ["استانبول", "شیشلی", "istanbul"],
    url: "/images/destinations/istanbul.jpg",
  },
  {
    keywords: ["دبی", "مارینا", "امارات", "dubai"],
    url: "/images/destinations/dubai.jpg",
  },
  {
    keywords: ["رامسر", "مازندران", "ساحلی", "ramsar"],
    url: "/images/destinations/ramsar.jpg",
  },
  {
    keywords: ["شیراز", "وکیل", "shiraz"],
    url: "/images/destinations/shiraz.jpg",
  },
  {
    keywords: ["لواسان", "lavasan"],
    url: "/images/destinations/lavasan.jpg",
  },
  {
    // Last of the Iranian entries on purpose: "تهران" also appears in the
    // province of a Lavasan listing, and the more specific match should win.
    keywords: ["تهران", "الهیه", "زعفرانیه", "tehran"],
    url: "/images/destinations/tehran.jpg",
  },
];

/**
 * Picks a photo from whatever text describes the record -- its name, its city,
 * its category. Returns null when nothing matches, which is the poster's cue.
 */
export function destinationPhoto(...parts: Array<string | null | undefined>): string | null {
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  if (!haystack) return null;

  const match = PHOTOS.find((photo) =>
    photo.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())),
  );

  return match?.url ?? null;
}

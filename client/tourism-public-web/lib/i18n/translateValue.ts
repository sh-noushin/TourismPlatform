/**
 * Translation for catalogue vocabulary.
 *
 * The database stores one language per field, and it is Persian: a tour
 * category is the literal string "طبیعت‌گردی". In English the chrome was
 * translated but every value coming from the API stayed Persian.
 *
 * This covers the *controlled* vocabulary -- categories, house types, cities,
 * countries, regions. Those are a closed set that repeats across every record,
 * so a lookup is exact and needs no data entry.
 *
 * It deliberately does NOT cover names and descriptions: those are free text,
 * one of a kind per record, and the honest place for their English is a field
 * on the record itself.
 *
 * Anything unknown falls through unchanged, so a new category shows its
 * Persian name rather than a blank.
 */

const VALUES: Record<string, string> = {
  // ---- tour categories -----------------------------------------------------
  "طبیعت‌گردی": "Nature & outdoors",
  "تاریخی و فرهنگی": "History & culture",
  "ساحلی": "Beach & islands",
  "زیارتی": "Pilgrimage",
  "ماجراجویی": "Adventure",
  "تورهای خارجی": "International",

  // ---- house types ---------------------------------------------------------
  "آپارتمان": "Apartment",
  "ویلا": "Villa",
  "دفتر اداری": "Office",
  "مغازه": "Shop",
  "زمین": "Land",
  "سوئیت": "Suite",

  // ---- cities --------------------------------------------------------------
  "تهران": "Tehran",
  "اصفهان": "Isfahan",
  "شیراز": "Shiraz",
  "مشهد": "Mashhad",
  "کیش": "Kish",
  "قشم": "Qeshm",
  "رامسر": "Ramsar",
  "لواسان": "Lavasan",
  "ماسوله": "Masuleh",
  "استانبول": "Istanbul",
  "دبی": "Dubai",

  // ---- provinces -----------------------------------------------------------
  "مازندران": "Mazandaran",
  "فارس": "Fars",
  "هرمزگان": "Hormozgan",
  "خراسان رضوی": "Razavi Khorasan",
  "گیلان": "Gilan",
  "کرمان": "Kerman",
  "مرمره": "Marmara",

  // ---- countries -----------------------------------------------------------
  "ایران": "Iran",
  "ترکیه": "Türkiye",
  "امارات": "United Arab Emirates",
};

/**
 * Translates one stored value for display. In Persian, or for anything not in
 * the table, the original is returned untouched.
 */
export function translateValue(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  if (locale !== "en") return value;

  const exact = VALUES[value.trim()];
  if (exact) return exact;

  // "تهران، ایران" and the like: translate each part, keep the rest.
  if (/[،,]/.test(value)) {
    return value
      .split(/[،,]/)
      .map((part) => translateValue(part.trim(), locale))
      .filter(Boolean)
      .join(", ");
  }

  return value;
}

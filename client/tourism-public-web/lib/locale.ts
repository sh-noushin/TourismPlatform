import { cookies } from "next/headers";

export type Locale = "fa" | "en";

/**
 * The locale for a server-rendered page: the visitor's saved choice, otherwise
 * Persian.
 *
 * Persian rather than the browser's Accept-Language, because the catalogue
 * itself is written in Persian. Deferring to an English-preferring browser
 * produced the worst of both -- English chrome wrapped around Persian tour
 * names, which is what the mixed-language screenshot showed. A visitor who
 * wants English clicks EN, and that writes the cookie this reads first.
 */
export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("NEXT_LOCALE")?.value;
  return saved === "en" ? "en" : "fa";
}

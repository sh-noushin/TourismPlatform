import { getJson } from "./client";
import { apiEndpoints } from "./endpoints";

export type PublicSectionDto = {
  id: string;
  sectionType: number | string;
  header: string | null;
  content: string | null;
  /** Optional English text; falls back to the Persian when absent. */
  headerEn?: string | null;
  contentEn?: string | null;
};

export async function getPublicPageSections(): Promise<PublicSectionDto[]> {
  return getJson<PublicSectionDto[]>(apiEndpoints.publicPage.sections);
}

import { apiEndpoints } from "@/lib/api/endpoints";
import { getJson } from "@/lib/api/client";

export interface CategoryDto {
  id: string;
  name: string;
  /** Optional English name; null when nobody has translated the category yet. */
  nameEn?: string | null;
}

export function fetchHouseTypes() {
  return getJson<CategoryDto[]>(apiEndpoints.categories.houseTypes);
}

export function fetchTourCategories() {
  return getJson<CategoryDto[]>(apiEndpoints.categories.tourCategories);
}

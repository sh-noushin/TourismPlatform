import { apiEndpoints } from "@/lib/api/endpoints";
import { getJson } from "@/lib/api/client";

export interface CountryDto {
  id: string;
  code: string;
  name: string;
}

export async function fetchCountries(): Promise<CountryDto[]> {
  return getJson<CountryDto[]>(apiEndpoints.reference.countries);
}

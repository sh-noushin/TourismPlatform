import { cookies } from "next/headers";

import { Badge, Card } from "@/components/ui";
import { Gallery } from "@/components/shared/Gallery";
import { DetailProperties } from "@/components/shared/DetailProperties";

import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { i18n } from "@/lib/i18n";
import type { components } from "@/lib/openapi/types";

type HouseDetailDto = components["schemas"]["HouseDetailDto"];

const normalizeGuidParam = (value: string) => value.trim().replace(/^\{/, "").replace(/\}$/, "");

const isGuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const fetchHouseDetail = async (id: string): Promise<HouseDetailDto | null> => {
  let primaryError: unknown = null;

  try {
    return await getJson<HouseDetailDto>(apiEndpoints.houses.detail(id));
  } catch (error) {
    console.error("Failed to load house detail (primary)", error);
    primaryError = error;
  }

  const proxyBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proxyUrl = `${proxyBase.replace(/\/$/, "")}/api/proxy${apiEndpoints.houses.detail(id)}`;

  try {
    const response = await fetch(proxyUrl, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) {
      let proxyMessage = "";
      try {
        const payload = (await response.clone().json()) as { message?: string };
        proxyMessage = payload?.message ? `: ${payload.message}` : "";
      } catch {
        // ignore json parsing errors
      }
      throw new Error(`Proxy status ${response.status}${proxyMessage}`);
    }
    return (await response.json()) as HouseDetailDto;
  } catch (error) {
    console.error("Failed to load house detail (proxy fallback)", error);
    if (error instanceof Error) {
      throw error;
    }

    if (primaryError instanceof Error) {
      throw primaryError;
    }

    throw new Error("Failed to load house detail");
  }
};

const formatAddress = (data: HouseDetailDto, postalLabel: string, locationFallback: string) => {
  const lines = [data.line1, data.line2].filter((part): part is string => Boolean(part));
  const cityRegion = [data.city, data.region].filter((part): part is string => Boolean(part));
  const hasAny = lines.length > 0 || cityRegion.length > 0 || data.country || data.postalCode;

  if (!hasAny) {
    return <p className="text-sm text-muted">{locationFallback}</p>;
  }

  return (
    <div className="space-y-1 text-sm text-muted">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
      {cityRegion.length > 0 && <p>{cityRegion.join(", ")}</p>}
      {data.country && <p>{data.country}</p>}
      {data.postalCode && <p>{`${postalLabel}: ${data.postalCode}`}</p>}
    </div>
  );
};

type HouseDetailParams = { params: { id?: string | string[] } | Promise<{ id?: string | string[] }> };

export default async function HouseDetailPage({ params }: HouseDetailParams) {
  const resolvedParams = await Promise.resolve(params);
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const t = i18n(locale);

  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.at(0) ?? "" : resolvedParams.id ?? "";
  const requestedId = rawId ? normalizeGuidParam(rawId) : "";

  let house: HouseDetailDto | null = null;
  let loadError: string | null = null;

  if (!rawId) {
    loadError = "Missing house id.";
  } else if (!isGuid(requestedId)) {
    loadError = `Invalid house id: ${rawId}`;
  }

  try {
    if (!loadError) {
      house = await fetchHouseDetail(requestedId);
    }
  } catch (error) {
    console.error("Failed to load house detail", error);
    loadError = error instanceof Error ? error.message : String(error);
  }

  if (!house && !loadError) {
    loadError = "No house data returned.";
  }

  const isFallback = !house;
  const resolvedHouse: HouseDetailDto =
    house ?? {
      houseId: requestedId,
      name: t.detail.house.loadErrorTitle,
      description: t.detail.house.loadErrorCopy,
      houseTypeName: null,
      line1: null,
      line2: null,
      city: null,
      region: null,
      country: null,
      postalCode: null,
      photos: [],
    };

  const description = resolvedHouse.description?.trim() || t.detail.house.descriptionFallback;
  const location =
    [resolvedHouse.city, resolvedHouse.region, resolvedHouse.country].filter(Boolean).join(", ") ||
    t.detail.house.locationFallback;
  const photosLabel = t.cards.photos(resolvedHouse.photos.length);
  const propertyItems = [
    { label: t.detail.house.propertyLabels.houseId, value: resolvedHouse.houseId },
    { label: t.detail.house.propertyLabels.name, value: resolvedHouse.name },
    { label: t.detail.house.propertyLabels.description, value: description },
    { label: t.detail.house.propertyLabels.houseTypeName, value: resolvedHouse.houseTypeName },
    { label: t.detail.house.propertyLabels.line1, value: resolvedHouse.line1 },
    { label: t.detail.house.propertyLabels.line2, value: resolvedHouse.line2 },
    { label: t.detail.house.propertyLabels.city, value: resolvedHouse.city },
    { label: t.detail.house.propertyLabels.region, value: resolvedHouse.region },
    { label: t.detail.house.propertyLabels.country, value: resolvedHouse.country },
    { label: t.detail.house.propertyLabels.postalCode, value: resolvedHouse.postalCode },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden border border-white/10 bg-slate-950/50 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <Gallery photos={resolvedHouse.photos} alt={`${resolvedHouse.name} gallery`} />
      </Card>

      <div className="space-y-6">
        <DetailProperties title={t.detail.house.propertyListTitle} items={propertyItems} />
      </div>
    </div>
  );
}

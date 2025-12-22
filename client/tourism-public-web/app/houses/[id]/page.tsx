import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Card } from "@/components/ui";
import { Gallery } from "@/components/shared/Gallery";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { components } from "@/lib/openapi/types";

type HouseDetailDto = components["schemas"]["HouseDetailDto"];

const fetchHouseDetail = (id: string) => getJson<HouseDetailDto>(apiEndpoints.houses.detail(id));

const formatAddress = (data: HouseDetailDto) => {
  const lines = [data.line1, data.line2].filter((part): part is string => Boolean(part));
  const cityRegion = [data.city, data.region].filter((part): part is string => Boolean(part));

  return (
    <div className="space-y-1 text-sm text-muted">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
      {cityRegion.length > 0 && <p>{cityRegion.join(", ")}</p>}
      {data.country && <p>{data.country}</p>}
      {data.postalCode && <p>Postal code {data.postalCode}</p>}
    </div>
  );
};

export default async function HouseDetailPage({ params }: { params: { id: string } }) {
  let house: HouseDetailDto | null = null;

  try {
    house = await fetchHouseDetail(params.id);
  } catch (error) {
    console.error("Failed to load house detail", error);
  }

  if (!house) {
    notFound();
  }

  const description = house.description?.trim();
  const quickFacts = [
    { label: "House type", value: house.houseTypeName },
    { label: "City", value: house.city },
    { label: "Region", value: house.region },
    { label: "Country", value: house.country },
    { label: "Postal code", value: house.postalCode },
    { label: "Photos", value: String(house.photos.length) },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div className="space-y-6">
        <div className="space-y-3">
          <Link href="/houses" className="text-sm font-semibold text-primary hover:text-primary/80">
            ← Back to houses
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {house.houseTypeName && <Badge variant="solid">{house.houseTypeName}</Badge>}
            <h1 className="text-3xl font-bold text-text">{house.name}</h1>
          </div>
          <p className="text-sm text-muted">
            {description || "A curated home without a description yet."}
          </p>
        </div>

        <Card className="p-0">
          <Gallery photos={house.photos} alt={`${house.name} gallery`} />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-text">Address</h2>
          {formatAddress(house)}
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-text">Quick facts</h2>
          <dl className="space-y-3 text-sm text-muted">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4">
                <dt className="font-semibold text-text">{fact.label}</dt>
                <dd className="text-right font-medium text-text">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-text">Explore</h2>
          <p className="text-sm text-muted">
            Discover similar homes, save your favorites, and plan your visit — all from the public catalogue.
          </p>
          <Link
            href="/houses"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
          >
            Continue browsing
          </Link>
        </Card>
      </aside>
    </div>
  );
}
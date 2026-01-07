import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui";
import { imageUrl } from "@/lib/utils/imageUrl";
import { i18n } from "@/lib/i18n";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

export interface HouseCardProps {
  house: HouseSummaryDto;
  locale?: string;
}

export function HouseCard({ house, locale }: HouseCardProps) {
  const primaryPhoto = house.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const hasLocation = Boolean(house.city || house.country);
  const location = [house.city, house.country].filter(Boolean).join(", ");
  const description = house.description?.trim();
  const t = i18n(locale);
  const photosLabel = t.cards.photos(house.photos?.length ?? 0);
  const locationLabel = hasLocation ? location : t.detail.house.locationFallback;

  return (
    <Card className="overflow-hidden p-0 border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 shadow-[0_30px_80px_rgba(0,0,0,0.45)] group flex h-full flex-col">
      <div className="relative h-52 w-full bg-slate-900/30">
          {src ? (
            <Image
              src={src}
              alt={primaryPhoto?.label ?? house.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-border/20 px-4 text-center text-sm text-muted">
              {t.cards.noPhoto}
            </div>
          )}
          <div className="absolute left-0 top-0 flex gap-2 p-3">
            {house.houseTypeName && (
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase text-white">
                {house.houseTypeName}
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase text-white">
              {photosLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-text">{house.name}</p>
            {(description || t.detail.house.descriptionFallback) && (
              <p className="text-sm text-muted truncate">{description || t.detail.house.descriptionFallback}</p>
            )}
          </div>
            <div className="flex items-center justify-between text-xs uppercase text-muted">
              <span className="text-xs text-muted">{locationLabel}</span>
              <Link
                href={`/houses/${house.houseId}`}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
              >
                {t.seeDetails} ›
              </Link>
            </div>
          </div>
    </Card>
  );
}

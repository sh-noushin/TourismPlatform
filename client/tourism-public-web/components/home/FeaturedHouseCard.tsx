import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";
import { i18n } from "@/lib/i18n";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];
type ExtendedHouseSummaryDto = HouseSummaryDto & {
  price?: number;
  currency?: string;
  listingType?: string | number;
};

interface FeaturedHouseCardProps {
  house: HouseSummaryDto;
  imageSide?: "left" | "right";
  locale?: string;
}

export function FeaturedHouseCard({ house, imageSide = "left", locale }: FeaturedHouseCardProps) {
  const primaryPhoto = house.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const extended = house as ExtendedHouseSummaryDto;
  const name = house.name?.trim() || "Untitled stay";
  const type = house.houseTypeName?.trim() || "Featured house";
  const listingTypeLabel =
    extended.listingType === 1 || extended.listingType === "Rent"
      ? "For rent"
      : extended.listingType === 2 || extended.listingType === "Buy"
        ? "For sale"
        : "Featured listing";
  const location = [house.city?.trim(), house.country?.trim()].filter(Boolean).join(", ");
  const locationText = location || "Location coming soon";
  const contextCopy = location
    ? `${listingTypeLabel} in ${location}. Thoughtful comforts and a welcoming host.`
    : `${listingTypeLabel}. Thoughtful comforts and a welcoming host.`;
  const priceLabel = Number.isFinite(extended.price)
    ? `${new Intl.NumberFormat("en-US").format(Number(extended.price))} ${extended.currency ?? ""}`.trim()
    : "Pricing coming soon";
  const hasImage = Boolean(src);
  const initial = name.charAt(0).toUpperCase();
  const t = i18n(locale);

  return (
    <Link
      href={`/houses/${house.houseId}`}
      className="group lang-balanced-card flex min-h-[240px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_24px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.16)] sm:w-[calc(100%-20px)] sm:min-h-[240px]"
    >
      <div className="grid h-full grid-cols-1 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
        <div
          className={`relative h-32 bg-slate-200/60 sm:h-full ${
            imageSide === "right" ? "sm:order-2" : ""
          }`}
        >
          {hasImage ? (
            <Image
              src={src}
              alt={primaryPhoto?.label ?? name}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-semibold text-slate-400">
              {initial || "H"}
            </div>
          )}
        </div>

        <div
          className={`flex flex-1 flex-col justify-between bg-gradient-to-br from-white to-slate-50 p-4 text-left text-slate-900 ${
            imageSide === "right" ? "sm:order-1" : ""
          }`}
        >
          <div className="w-full space-y-2 sm:min-h-[110px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-800">
              {type}
            </p>
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900 md:text-lg">{name}</h3>
            <p className="line-clamp-1 text-xs text-slate-700 md:text-sm">{locationText}</p>
            <p className="line-clamp-2 text-xs text-slate-700 md:text-sm">{contextCopy}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-700 md:text-sm">
            <span className="font-semibold text-slate-900 text-sm md:text-base">{priceLabel}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-800/80 md:text-[11px]">
              {t.seeDetails}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

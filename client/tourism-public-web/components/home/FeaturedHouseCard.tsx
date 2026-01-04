import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];
type ExtendedHouseSummaryDto = HouseSummaryDto & {
  price?: number;
  currency?: string;
  listingType?: string | number;
};

interface FeaturedHouseCardProps {
  house: HouseSummaryDto;
  imageSide?: "left" | "right";
}

export function FeaturedHouseCard({ house, imageSide = "left" }: FeaturedHouseCardProps) {
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

  return (
    <Link
      href={`/houses/${house.houseId}`}
      className="group flex h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_35px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(15,23,42,0.16)] sm:min-h-[16rem]"
    >
      <div className="grid h-full grid-cols-1 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
        <div
          className={`relative h-36 bg-slate-200/60 sm:h-full ${
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
          <div className="w-full space-y-3 sm:min-h-[120px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-800">
              {type}
            </p>
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{name}</h3>
            <p className="line-clamp-1 text-sm text-slate-700">{locationText}</p>
            <p className="line-clamp-2 text-sm text-slate-700">{contextCopy}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{priceLabel}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/80">
              See more details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

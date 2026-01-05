import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";
import { i18n } from "@/lib/i18n";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

interface FeaturedTourCardProps {
  tour: TourSummaryDto;
  imageSide?: "left" | "right";
  locale?: string;
}

export function FeaturedTourCard({ tour, imageSide = "left", locale }: FeaturedTourCardProps) {
  const primaryPhoto = tour.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const name = tour.name?.trim() || "Untitled tour";
  const category = tour.tourCategoryName?.trim() || "Featured tour";
  const description = tour.description?.trim() || "Description coming soon.";
  const priceLabel = Number.isFinite(tour.price)
    ? `${new Intl.NumberFormat("en-US").format(Number(tour.price))} ${tour.currency}`
    : "Pricing coming soon";
  const hasImage = Boolean(src);
  const initial = name.charAt(0).toUpperCase();
  const t = i18n(locale);

  return (
    <Link
      href={`/tours/${tour.tourId}`}
      className="group lang-balanced-card flex min-h-[240px] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_24px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.16)]"
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
              {initial || "T"}
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
              {category}
            </p>
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900 md:text-lg">{name}</h3>
            <p className="line-clamp-3 text-xs text-slate-700 md:text-sm">{description}</p>
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

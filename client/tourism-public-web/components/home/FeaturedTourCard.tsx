import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import { i18n } from "@/lib/i18n";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

interface FeaturedTourCardProps {
  tour: TourSummaryDto;
  imageSide?: "left" | "right";
  locale?: string;
}

export function FeaturedTourCard({ tour, locale }: FeaturedTourCardProps) {
  const primaryPhoto = tour.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const name = tour.name?.trim() || "Untitled tour";
  const category = tour.tourCategoryName?.trim() || "Featured tour";
  const description = tour.description?.trim() || "Description coming soon.";
  const translations = i18n(locale);
  const priceLabel = Number.isFinite(tour.price)
    ? `${new Intl.NumberFormat("en-US").format(Number(tour.price))} ${tour.currency}`
    : "Pricing coming soon";
  const hasImage = Boolean(src);
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className="group lang-balanced-card flex min-h-[380px] w-[260px] flex-col overflow-hidden rounded-[18px] border border-yellow-300 bg-black text-white shadow-[0_18px_32px_rgba(0,0,0,0.65)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.75)]">
      <div className="relative h-48 w-full overflow-hidden rounded-t-[18px] bg-slate-900">
        {hasImage ? (
          <Image
            src={src}
            alt={primaryPhoto?.label ?? name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-4xl font-semibold text-white">
            {initial || "T"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold uppercase tracking-[0.35em] text-yellow-300">{category}</h3>
          <p className="text-2xl font-bold tracking-tight text-white">{name}</p>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase tracking-[0.18em] text-slate-400">{priceLabel}</span>
          <Link
            href={`/tours/${tour.tourId}`}
            className="rounded-full border border-white/40 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/10"
          >
            {translations.seeDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}

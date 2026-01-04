import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

interface FeaturedTourCardProps {
  tour: TourSummaryDto;
}

export function FeaturedTourCard({ tour }: FeaturedTourCardProps) {
  const primaryPhoto = tour.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const priceLabel = Number.isFinite(tour.price)
    ? `${new Intl.NumberFormat("en-US").format(Number(tour.price))} ${tour.currency}`
    : null;

  return (
    <Link
      href={`/tours/${tour.tourId}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-md ring-1 ring-sky-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
        <div className="relative h-40 bg-slate-200/60 sm:h-full">
          {src ? (
            <Image
              src={src}
              alt={tour.name}
              fill
              sizes="(min-width: 640px) 150px, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent" />
        </div>

        <div className="flex flex-col gap-3 p-5 text-left text-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-800">
            {tour.tourCategoryName}
          </p>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{tour.name}</h3>
          {tour.description ? (
            <p className="line-clamp-3 text-sm text-slate-700">{tour.description}</p>
          ) : null}
          <div className="mt-auto flex items-center justify-between text-sm text-slate-700">
            {priceLabel ? <span className="font-semibold text-slate-900">{priceLabel}</span> : <span />}
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/80">
              See details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

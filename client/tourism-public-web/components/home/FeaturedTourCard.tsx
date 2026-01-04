import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

interface FeaturedTourCardProps {
  tour: TourSummaryDto;
  imageSide?: "left" | "right";
}

export function FeaturedTourCard({ tour, imageSide = "left" }: FeaturedTourCardProps) {
  const primaryPhoto = tour.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const priceLabel = Number.isFinite(tour.price)
    ? `${new Intl.NumberFormat("en-US").format(Number(tour.price))} ${tour.currency}`
    : null;

  return (
    <Link
      href={`/tours/${tour.tourId}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_35px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(15,23,42,0.16)] sm:min-h-[16rem]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
        <div className={`relative h-36 bg-slate-200/60 sm:h-full ${
          imageSide === "right" ? "sm:order-2" : ""
        }`}>
          {src ? (
            <Image
              src={src}
              alt={tour.name}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover object-center"
              loading="lazy"
            />
          ) : null}
        </div>

        <div
          className={`flex flex-1 flex-col justify-between bg-gradient-to-br from-white to-slate-50 p-4 text-left text-slate-900 ${
            imageSide === "right" ? "sm:order-1" : ""
          }`}
        >
          <div className="space-y-3 w-full sm:min-h-[120px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-800">
              {tour.tourCategoryName}
            </p>
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{tour.name}</h3>
            {tour.description ? (
              <p className="line-clamp-3 text-sm text-slate-700">{tour.description}</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700">
            {priceLabel ? <span className="font-semibold text-slate-900">{priceLabel}</span> : <span />}
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/80">
              See more details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

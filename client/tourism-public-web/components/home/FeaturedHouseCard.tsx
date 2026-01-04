import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

interface FeaturedHouseCardProps {
  house: HouseSummaryDto;
  imageSide?: "left" | "right";
}

export function FeaturedHouseCard({ house, imageSide = "left" }: FeaturedHouseCardProps) {
  const primaryPhoto = house.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const location = [house.city, house.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/houses/${house.houseId}`}
      className="group flex h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_35px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(15,23,42,0.16)] sm:min-h-[16rem]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
        <div className={`relative h-36 bg-slate-200/60 sm:h-full ${
          imageSide === "right" ? "sm:order-2" : ""
        }`}>
          {src ? (
            <Image
              src={src}
              alt={house.name}
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
              {house.houseTypeName ?? "Featured house"}
            </p>
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{house.name}</h3>
            {location ? <p className="line-clamp-1 text-sm text-slate-700">{location}</p> : null}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/80">
            See more details
          </div>
        </div>
      </div>
    </Link>
  );
}

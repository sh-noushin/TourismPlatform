import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

interface FeaturedHouseCardProps {
  house: HouseSummaryDto;
}

export function FeaturedHouseCard({ house }: FeaturedHouseCardProps) {
  const primaryPhoto = house.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);
  const location = [house.city, house.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/houses/${house.houseId}`}
      className="group flex h-full overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-md ring-1 ring-sky-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
        <div className="relative h-40 bg-slate-200/60 sm:h-full">
          {src ? (
            <Image
              src={src}
              alt={house.name}
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
            {house.houseTypeName ?? "Featured house"}
          </p>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{house.name}</h3>
          {location ? <p className="line-clamp-1 text-sm text-slate-700">{location}</p> : null}
          <div className="mt-auto text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/80">
            See details
          </div>
        </div>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

interface FeaturedHouseCardProps {
  house: HouseSummaryDto;
  featured?: boolean;
}

export function FeaturedHouseCard({ house, featured = false }: FeaturedHouseCardProps) {
  const primaryPhoto = house.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);

  return (
    <Link
      href={`/houses/${house.houseId}`}
      className="group relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-80 w-full bg-border/10">
        {src ? (
          <Image
            src={src}
            alt={house.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-sm text-muted">
            No photo yet
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Badge */}
        {featured && (
          <div className="absolute left-4 top-4 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-bold uppercase text-white shadow-md">
            Featured
          </div>
        )}

        {/* Price Tag */}
        {house.price != null && (
          <div className="absolute right-4 top-4 rounded-lg bg-white/95 px-3 py-2 text-sm font-bold text-text shadow-md backdrop-blur-sm">
            ${house.price}/night
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-2 flex items-center gap-2 text-xs">
          {house.houseTypeName && (
            <>
              <span className="opacity-90">🏠 {house.houseTypeName}</span>
              <span className="opacity-60">•</span>
            </>
          )}
          <span className="opacity-90">📍 {house.countryCode || 'Location'}</span>
        </div>
        
        <h3 className="mb-3 text-2xl font-bold leading-tight">{house.name}</h3>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="opacity-90">👥</span>
            <span className="opacity-90">{house.capacity || 2} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★★★★★</span>
            <span className="font-semibold opacity-90">4.7/5</span>
          </div>
        </div>
      </div>

      {/* View Details Button - appears on hover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-primary/95 px-6 py-4 text-center font-semibold text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
        More Information →
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui";
import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

export interface TourCardProps {
  tour: TourSummaryDto;
}

export function TourCard({ tour }: TourCardProps) {
  const primaryPhoto = tour.photos?.[0];
  const src = imageUrl(primaryPhoto?.permanentRelativePath);

  return (
    <Card className="overflow-hidden p-0 bg-gradient-to-b from-slate-900/70 to-slate-950/40 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <Link href={`/tours/${tour.tourId}`} className="flex h-full flex-col">
        <div className="relative h-48 w-full bg-slate-900/30">
          {src ? (
            <Image
              src={src}
              alt={primaryPhoto?.label ?? tour.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-border/20 text-sm text-muted">No photo yet</div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-semibold text-text">{tour.name}</p>
            {tour.tourCategoryName && (
              <span className="rounded-full border border-border px-3 py-0.5 text-[11px] font-semibold uppercase text-muted">
                {tour.tourCategoryName}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase text-muted">
            <span>{tour.photos.length} photos</span>
            <span>View schedules</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

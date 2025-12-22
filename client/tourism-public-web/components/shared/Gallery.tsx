"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { imageUrl } from "@/lib/utils/imageUrl";

export interface GalleryPhoto {
  photoId: string;
  label?: string | null;
  permanentRelativePath: string;
}

export interface GalleryProps {
  photos?: GalleryPhoto[];
  className?: string;
  alt?: string;
}

export function Gallery({ photos = [], className, alt }: GalleryProps) {
  const validPhotos = useMemo(
    () => photos.filter((photo) => Boolean(photo.permanentRelativePath)),
    [photos]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (validPhotos.length === 0) {
    return (
      <div
        className={cn(
          "rounded-3xl border border-border bg-surface/70 p-8 text-center text-sm text-text/70",
          className
        )}
      >
        No photos available yet.
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, validPhotos.length - 1);
  const activePhoto = validPhotos[safeIndex];
  const activeSrc = imageUrl(activePhoto.permanentRelativePath);
  const activeAlt = alt ?? activePhoto.label ?? "Gallery image";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-border/10">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={activeSrc}
            alt={activeAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {validPhotos.map((photo, index) => {
          const thumbSrc = imageUrl(photo.permanentRelativePath);
          const isActive = index === activeIndex;
          const thumbAlt = photo.label ?? `Photo ${index + 1}`;

          return (
            <button
              key={photo.photoId}
              type="button"
              aria-pressed={isActive}
              className={cn(
                "group relative overflow-hidden rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface/80 hover:border-primary"
              )}
              onClick={() => setActiveIndex(index)}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={thumbSrc}
                  alt={thumbAlt}
                  fill
                  sizes="80px"
                  className="object-cover transition duration-150 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const activeAlt = alt ?? activePhoto.label ?? `Photo ${safeIndex + 1}`;

  const goToPrev = () => {
    setActiveIndex((value) => (value - 1 + validPhotos.length) % validPhotos.length);
  };

  const goToNext = () => {
    setActiveIndex((value) => (value + 1) % validPhotos.length);
  };

  const arrowButtonBase =
    "flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition hover:border-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-slate-950/90 to-slate-900/60 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      <div className="relative mx-auto max-w-[720px]">
        <div className="pointer-events-none absolute inset-3 rounded-[34px] border-[3px] border-white/70 opacity-50" />
        <div className="relative rounded-[30px] border border-white/10 bg-slate-950/70 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
          <div className="relative h-[260px] w-full overflow-hidden rounded-[26px] sm:h-[320px]">
            <Image
              src={activeSrc}
              alt={activeAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-300"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-between px-3">
        <button type="button" onClick={goToPrev} aria-label="Show previous photo" className={arrowButtonBase}>
          <span aria-hidden className="text-lg font-bold text-white">
            &lt;
          </span>
        </button>
        <button type="button" onClick={goToNext} aria-label="Show next photo" className={arrowButtonBase}>
          <span aria-hidden className="text-lg font-bold text-white">
            &gt;
          </span>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {validPhotos.map((photo, index) => (
          <button
            key={photo.photoId}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={safeIndex === index ? "true" : undefined}
            className={cn(
              "h-3 w-3 rounded-full border border-white/30 bg-white/20 transition duration-150",
              safeIndex === index
                ? "border-white bg-white"
                : "border-white/20 bg-white/20 hover:border-white/70"
            )}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

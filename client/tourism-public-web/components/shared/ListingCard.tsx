import Image from "next/image";
import Link from "next/link";

import { destinationPhoto } from "@/lib/media/destinationPhoto";
import { posterInitials, posterStyle } from "@/lib/media/poster";
import { imageUrl } from "@/lib/utils/imageUrl";

/**
 * One tour or house.
 *
 * Deliberately quiet: photo, one line of context, the name, the price. The
 * previous card carried a full-width saturated bar, a shadow-xl and an
 * uppercase category in tracked caps -- three things competing before the
 * reader reached the name.
 *
 * The whole card is the link, so there is no button drawing a second focus.
 */
export function ListingCard({
  href,
  id,
  name,
  context,
  description,
  image,
  price,
  meta,
}: {
  href: string;
  id: string;
  name: string;
  /** Category, or city and country -- whatever places the row. */
  context?: string | null;
  description?: string | null;
  image?: string | null;
  /** Pre-formatted, because number formatting is locale work the page owns. */
  price?: string | null;
  /** Short badge over the photo: duration, listing type. */
  meta?: string | null;
}) {
  // Uploaded photo first, then a Commons photo of the destination named in the
  // record, then its poster. Only the first is the record's own.
  const src = imageUrl(image ?? undefined) || destinationPhoto(name, context, description);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(28,26,23,0.45)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={posterStyle(id)}
            aria-hidden="true"
          >
            <span className="text-3xl font-semibold tracking-wide text-white/85">
              {posterInitials(name)}
            </span>
          </div>
        )}

        {meta && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {meta}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {context && (
          <span className="text-xs font-medium text-[color:var(--primary)]">{context}</span>
        )}
        <h3 className="text-lg font-semibold leading-snug text-[color:var(--text)]">{name}</h3>
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[color:var(--muted)]">
            {description}
          </p>
        )}
        {price && (
          <span className="mt-auto pt-2 text-base font-semibold text-[color:var(--text)]" dir="ltr">
            {price}
          </span>
        )}
      </div>
    </Link>
  );
}

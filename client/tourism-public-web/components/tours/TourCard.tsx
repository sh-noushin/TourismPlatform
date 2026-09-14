import { ListingCard } from "@/components/shared/ListingCard";
import { i18n } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";
import { translateValue } from "@/lib/i18n/translateValue";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

export interface TourCardProps {
  tour: TourSummaryDto;
  locale?: string;
}

/**
 * The list page's card is the home page's card. It used to be a second
 * implementation with its own dark gradient, its own badges and its own
 * details button, which is how the two pages drifted apart.
 */
export function TourCard({ tour, locale }: TourCardProps) {
  const t = i18n(locale);
  const isFarsi = locale === "fa";
  const price =
    typeof tour.price === "number"
      ? `${new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US", {
          maximumFractionDigits: 0,
        }).format(tour.price)} ${tour.currency ?? ""}`.trim()
      : null;

  return (
    <ListingCard
      id={tour.tourId}
      href={`/tours/${tour.tourId}`}
      name={localized(tour.name, tour.nameEn, locale ?? "fa")}
      context={localized(
        translateValue(tour.tourCategoryName, locale ?? "fa"),
        tour.tourCategoryNameEn,
        locale ?? "fa",
      )}
      description={localized(tour.description, tour.descriptionEn, locale ?? "fa")}
      image={tour.photos?.[0]?.permanentRelativePath}
      price={price}
      meta={tour.year ? String(tour.year) : t.cards.viewSchedules}
    />
  );
}

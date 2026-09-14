import { ListingCard } from "@/components/shared/ListingCard";
import { i18n } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";
import { translateValue } from "@/lib/i18n/translateValue";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

export interface HouseCardProps {
  house: HouseSummaryDto;
  locale?: string;
}

/** Same card as the tours list and the home page — see TourCard. */
export function HouseCard({ house, locale }: HouseCardProps) {
  const t = i18n(locale);
  const isFarsi = locale === "fa";
  const location = translateValue(
    [house.city, house.country].filter(Boolean).join("، "),
    locale ?? "fa",
  );
  const price =
    typeof house.price === "number"
      ? `${new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US", {
          maximumFractionDigits: 0,
        }).format(house.price)} ${house.currency ?? ""}`.trim()
      : null;

  return (
    <ListingCard
      id={house.houseId}
      href={`/houses/${house.houseId}`}
      name={localized(house.name, house.nameEn, locale ?? "fa")}
      context={location || t.detail.house.locationFallback}
      description={localized(house.description, house.descriptionEn, locale ?? "fa")}
      image={house.photos?.[0]?.permanentRelativePath}
      price={price}
      meta={localized(
        translateValue(house.houseTypeName, locale ?? "fa"),
        house.houseTypeNameEn,
        locale ?? "fa",
      )}
    />
  );
}

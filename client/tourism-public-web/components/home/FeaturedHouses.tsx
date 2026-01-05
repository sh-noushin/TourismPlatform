import { getFeaturedHouses } from "@/lib/api/featured";
import { FeaturedHouseCard } from "./FeaturedHouseCard";
import { i18n } from "@/lib/i18n";

export async function FeaturedHouses({ locale }: { locale?: string } = {}) {
  const houses = await getFeaturedHouses(4, locale).catch((error) => {
    console.error("Failed to load featured houses", error);
    return [];
  });

  const t = i18n(locale);

  if (!houses.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">{t.noHouses}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:auto-rows-fr">
      {houses.map((house, index) => {
        const rowIndex = Math.floor(index / 2);
        const imageSide = rowIndex % 2 === 0 ? "left" : "right";
        return <FeaturedHouseCard key={house.houseId} house={house} imageSide={imageSide} locale={locale} />;
      })}
    </div>
  );
}

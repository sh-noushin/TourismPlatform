import { getFeaturedHouses } from "@/lib/api/featured";
import { FeaturedHouseCard } from "./FeaturedHouseCard";

export async function FeaturedHouses() {
  const houses = await getFeaturedHouses(6).catch((error) => {
    console.error("Failed to load featured houses", error);
    return [];
  });

  if (!houses.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">No houses available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:auto-rows-fr">
      {houses.map((house, index) => {
        const rowIndex = Math.floor(index / 2);
        const imageSide = rowIndex % 2 === 0 ? "left" : "right";
        return <FeaturedHouseCard key={house.houseId} house={house} imageSide={imageSide} />;
      })}
    </div>
  );
}

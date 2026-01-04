import { getFeaturedHouses } from "@/lib/api/featured";
import { FeaturedHouseCard } from "./FeaturedHouseCard";

export async function FeaturedHouses() {
  const data = await getFeaturedHouses(6);
  const houses = data.items || [];

  if (!houses.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">No houses available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {houses.map((house, index) => (
        <FeaturedHouseCard 
          key={house.houseId} 
          house={house} 
          featured={index === 0} 
        />
      ))}
    </div>
  );
}

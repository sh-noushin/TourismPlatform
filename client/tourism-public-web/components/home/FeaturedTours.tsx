import { getFeaturedTours } from "@/lib/api/featured";
import { FeaturedTourCard } from "./FeaturedTourCard";

export async function FeaturedTours() {
  const data = await getFeaturedTours(6);
  const tours = data.items || [];

  if (!tours.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">No tours available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, index) => (
        <FeaturedTourCard 
          key={tour.tourId} 
          tour={tour} 
          featured={index === 0} 
        />
      ))}
    </div>
  );
}

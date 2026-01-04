import { Hero } from "@/components/home/Hero";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { FeaturedHouses } from "@/components/home/FeaturedHouses";

export default async function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Content Section with Tabs */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-4xl font-bold text-text">
            Explore Our Collection
          </h2>
          <p className="text-lg text-muted">
            Discover the newest tours and houses from 2026
          </p>
        </div>

        <FeaturedTabs
          toursContent={<FeaturedTours />}
          housesContent={<FeaturedHouses />}
        />
      </section>
    </main>
  );
}

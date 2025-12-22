import Link from "next/link";

import { Badge, Card } from "@/components/ui";

const highlights = [
  {
    title: "Browse Houses",
    description: "Filter by size, location, price, and room count with ImmoScout-inspired controls.",
  },
  {
    title: "Plan Tours",
    description: "Compare curated tours, calendars, and upcoming dates in one place.",
  },
  {
    title: "Stay Informed",
    description: "Shareable filter URLs and pagination keep every view ready to revisit.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16">
      <section className="space-y-6 rounded-3xl border border-border bg-surface p-10 shadow-sm shadow-black/5">
        <Badge variant="solid" className="w-fit">
          Public Experience
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-text">Discover houses and tours</h1>
          <p className="text-base text-muted">
            The Tourism Platform front-end reuses shared tokens, neutral surfaces and reusable UI primitives so every page feels consistent.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/houses"
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Explore Houses
          </Link>
          <Link
            href="/tours"
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            View Tours
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-text">{item.title}</h2>
            <p className="text-sm text-muted">{item.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

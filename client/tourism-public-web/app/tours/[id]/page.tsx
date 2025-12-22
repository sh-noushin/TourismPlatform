import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Card } from "@/components/ui";
import { Gallery } from "@/components/shared/Gallery";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { components } from "@/lib/openapi/types";

const formatUtc = (value: string) => new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

type TourDetailDto = components["schemas"]["TourDetailDto"];

const fetchTourDetail = (id: string) => getJson<TourDetailDto>(apiEndpoints.tours.detail(id));

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  let tour: TourDetailDto | null = null;

  try {
    tour = await fetchTourDetail(params.id);
  } catch (error) {
    console.error("Failed to load tour detail", error);
  }

  if (!tour) {
    notFound();
  }

  const description = tour.description?.trim();
  const schedules = [...tour.schedules].sort(
    (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()
  );
  const upcoming = schedules[0];

  const quickFacts = [
    { label: "Category", value: tour.tourCategoryName },
    { label: "Schedules", value: String(schedules.length) },
    { label: "Next start", value: upcoming ? formatUtc(upcoming.startAtUtc) : "TBD" },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div className="space-y-6">
        <div className="space-y-3">
          <Link href="/tours" className="text-sm font-semibold text-primary hover:text-primary/80">
            ← Back to tours
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {tour.tourCategoryName && (
              <Badge variant="solid">{tour.tourCategoryName}</Badge>
            )}
            <h1 className="text-3xl font-bold text-text">{tour.name}</h1>
          </div>
          <p className="text-sm text-muted">
            {description || "Explore a guided tour with curated itineraries and schedules."}
          </p>
        </div>

        <Card className="p-0">
          <Gallery photos={tour.photos} alt={`${tour.name} gallery`} />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-text">Details</h2>
          <p className="text-sm text-muted">
            {description || "No additional details yet."}
          </p>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Schedules</h3>
            {schedules.length === 0 ? (
              <p className="text-sm text-muted">No schedules published yet.</p>
            ) : (
              <div className="space-y-2 text-sm text-muted">
                {schedules.map((schedule) => (
                  <div key={schedule.tourScheduleId} className="rounded-md border border-border p-3">
                    <p className="font-semibold text-text">{formatUtc(schedule.startAtUtc)} → {formatUtc(schedule.endAtUtc)}</p>
                    <p>Capacity: {schedule.capacity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-text">Quick facts</h2>
          <dl className="space-y-3 text-sm text-muted">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4">
                <dt className="font-semibold text-text">{fact.label}</dt>
                <dd className="text-right font-medium text-text">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-text">Plan ahead</h2>
          <p className="text-sm text-muted">
            Save this experience, join the newsletter, or explore more journeys from our curated collection.
          </p>
          <Link
            href="/tours"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
          >
            Back to tours
          </Link>
        </Card>
      </aside>
    </div>
  );
}

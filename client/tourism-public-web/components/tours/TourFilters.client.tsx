"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button, Card, Drawer, Input, Select } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";

import { CategoryDto } from "@/lib/api/categories";
import type { TourFilters } from "@/lib/filters/tours";
import { tourSortOptions } from "@/lib/filters/tours";

interface TourFiltersProps {
  initialFilters: TourFilters;
  tourCategories: CategoryDto[];
}

interface FormState {
  destination: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  durationMin: string;
  durationMax: string;
  category: string;
  sort: TourFilters["sort"];
}

const createFormState = (filters: TourFilters): FormState => ({
  destination: filters.destination ?? "",
  dateFrom: filters.dateFrom ?? "",
  dateTo: filters.dateTo ?? "",
  priceMin: filters.priceMin?.toString() ?? "",
  priceMax: filters.priceMax?.toString() ?? "",
  durationMin: filters.durationMin?.toString() ?? "",
  durationMax: filters.durationMax?.toString() ?? "",
  category: filters.category ?? "",
  sort: filters.sort,
});

export function TourFilters({ initialFilters, tourCategories }: TourFiltersProps) {
  const [formState, setFormState] = useState<FormState>(() => createFormState(initialFilters));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const formFields = useMemo(
    () => (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">Destination</p>
          <p className="text-xs text-muted">City, region, or tour name</p>
          <Input
            placeholder="Anywhere"
            value={formState.destination}
            onChange={(event) => setFormState((prev) => ({ ...prev, destination: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">From</span>
            <Input
              type="date"
              value={formState.dateFrom}
              onChange={(event) => setFormState((prev) => ({ ...prev, dateFrom: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">To</span>
            <Input
              type="date"
              value={formState.dateTo}
              onChange={(event) => setFormState((prev) => ({ ...prev, dateTo: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Price min</span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={formState.priceMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, priceMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Price max</span>
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={formState.priceMax}
              onChange={(event) => setFormState((prev) => ({ ...prev, priceMax: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Duration min (days)</span>
            <Input
              type="number"
              min={0}
              placeholder="1"
              value={formState.durationMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, durationMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Duration max (days)</span>
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={formState.durationMax}
              onChange={(event) => setFormState((prev) => ({ ...prev, durationMax: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Tour category</span>
            <Select
              value={formState.category}
              onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">All categories</option>
              {tourCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Sort</span>
            <Select
              value={formState.sort}
              onChange={(event) => setFormState((prev) => ({ ...prev, sort: event.target.value as TourFilters["sort"] }))}
            >
              {tourSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>
    ),
    [formState, tourCategories]
  );

  const buildQuery = () => {
    const params = new URLSearchParams();

    if (formState.destination) params.set("destination", formState.destination);
    if (formState.dateFrom) params.set("dateFrom", formState.dateFrom);
    if (formState.dateTo) params.set("dateTo", formState.dateTo);
    if (formState.priceMin) params.set("priceMin", formState.priceMin);
    if (formState.priceMax) params.set("priceMax", formState.priceMax);
    if (formState.durationMin) params.set("durationMin", formState.durationMin);
    if (formState.durationMax) params.set("durationMax", formState.durationMax);
    if (formState.category) params.set("category", formState.category);
    params.set("sort", formState.sort);
    params.set("page", "1");
    params.set("pageSize", String(initialFilters.pageSize));

    return params;
  };

  const handleApply = () => {
    const params = buildQuery();
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    setIsDrawerOpen(false);
  };

  const handleReset = () => {
    setFormState(createFormState(initialFilters));
    router.push(pathname);
    setIsDrawerOpen(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleApply();
  };

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" variant="primary">
        Apply filters
      </Button>
      <Button type="button" variant="ghost" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );

  const form = (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {formFields}
      {actions}
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="hidden lg:block">
        <Card className="space-y-6 p-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/60 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Filters</p>
            <p className="text-lg font-semibold text-text">Refine your journey</p>
          </div>
          {form}
        </Card>
      </div>

      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
          Filters
        </Button>
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Filters">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">Filters</p>
              <p className="text-lg font-semibold text-text">Refine your journey</p>
            </div>
            {form}
          </div>
        </Drawer>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button, Card, Drawer, Input, Select } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";

import { CategoryDto } from "@/lib/api/categories";
import type { HouseFilters } from "@/lib/filters/houses";
import { houseSortOptions } from "@/lib/filters/houses";

interface HouseFiltersProps {
  initialFilters: HouseFilters;
  houseTypes: CategoryDto[];
}

interface FormState {
  location: string;
  type: string;
  sort: HouseFilters["sort"];
  priceMin: string;
  priceMax: string;
  roomsMin: string;
  areaMin: string;
}

const createFormState = (filters: HouseFilters): FormState => ({
  location: filters.location ?? "",
  type: filters.type ?? "",
  sort: filters.sort,
  priceMin: filters.priceMin?.toString() ?? "",
  priceMax: filters.priceMax?.toString() ?? "",
  roomsMin: filters.roomsMin?.toString() ?? "",
  areaMin: filters.areaMin?.toString() ?? "",
});

export function HouseFilters({ initialFilters, houseTypes }: HouseFiltersProps) {
  const [formState, setFormState] = useState<FormState>(() => createFormState(initialFilters));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const formFields = useMemo(
    () => (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">Location</p>
          <p className="text-xs text-muted">City, region, or country</p>
          <Input
            placeholder="Anywhere"
            value={formState.location}
            onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
          />
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
            <span className="text-sm font-semibold text-text">Rooms min</span>
            <Input
              type="number"
              min={0}
              placeholder="1"
              value={formState.roomsMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, roomsMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Area min (m²)</span>
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={formState.areaMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, areaMin: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">House type</span>
            <Select
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="">All types</option>
              {houseTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">Sort</span>
            <Select
              value={formState.sort}
              onChange={(event) => setFormState((prev) => ({ ...prev, sort: event.target.value as HouseFilters["sort"] }))}
            >
              {houseSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>
    ),
    [formState, houseTypes]
  );

  const buildQuery = () => {
    const params = new URLSearchParams();

    if (formState.location) params.set("location", formState.location);
    if (formState.priceMin) params.set("priceMin", formState.priceMin);
    if (formState.priceMax) params.set("priceMax", formState.priceMax);
    if (formState.roomsMin) params.set("roomsMin", formState.roomsMin);
    if (formState.areaMin) params.set("areaMin", formState.areaMin);
    if (formState.type) params.set("type", formState.type);
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
            <p className="text-lg font-semibold text-text">Refine your search</p>
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
              <p className="text-lg font-semibold text-text">Refine your search</p>
            </div>
            {form}
          </div>
        </Drawer>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button, Card, Drawer, Input, Select } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";

import { CategoryDto } from "@/lib/api/categories";
import type { TourFilters } from "@/lib/filters/tours";
import type { SortOption } from "@/components/shared/SortDropdown.client";
import type { FiltersTranslation } from "@/lib/i18n";

interface TourFiltersProps {
  initialFilters: TourFilters;
  tourCategories: CategoryDto[];
  filtersTranslation: FiltersTranslation;
  sortLabel: string;
  sortOptions: SortOption[];
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

export function TourFilters({
  initialFilters,
  tourCategories,
  filtersTranslation,
  sortLabel,
  sortOptions,
}: TourFiltersProps) {
  const [formState, setFormState] = useState<FormState>(() => createFormState(initialFilters));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const formFields = useMemo(() => {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">{filtersTranslation.destination.label}</p>
          <p className="text-xs text-muted">{filtersTranslation.destination.helper}</p>
          <Input
            placeholder={filtersTranslation.destination.placeholder}
            value={formState.destination}
            onChange={(event) => setFormState((prev) => ({ ...prev, destination: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.dateFromLabel}</span>
            <Input
              type="date"
              value={formState.dateFrom}
              onChange={(event) => setFormState((prev) => ({ ...prev, dateFrom: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.dateToLabel}</span>
            <Input
              type="date"
              value={formState.dateTo}
              onChange={(event) => setFormState((prev) => ({ ...prev, dateTo: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.price.minLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={formState.priceMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, priceMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.price.maxLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder={filtersTranslation.price.anyLabel}
              value={formState.priceMax}
              onChange={(event) => setFormState((prev) => ({ ...prev, priceMax: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.duration.minLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder={filtersTranslation.duration.minPlaceholder}
              value={formState.durationMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, durationMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.duration.maxLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder={filtersTranslation.duration.maxPlaceholder}
              value={formState.durationMax}
              onChange={(event) => setFormState((prev) => ({ ...prev, durationMax: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.tourCategory.label}</span>
            <Select
              value={formState.category}
              onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">{filtersTranslation.tourCategory.allLabel}</option>
              {tourCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{sortLabel}</span>
            <Select
              value={formState.sort}
              onChange={(event) => setFormState((prev) => ({ ...prev, sort: event.target.value as TourFilters["sort"] }))}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>
    );
  }, [formState, tourCategories, sortLabel, sortOptions, filtersTranslation]);

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
        {filtersTranslation.applyButton}
      </Button>
      <Button type="button" variant="ghost" onClick={handleReset}>
        {filtersTranslation.resetButton}
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
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {filtersTranslation.title}
            </p>
            <p className="text-lg font-semibold text-text">
              {filtersTranslation.toursSubtitle}
            </p>
          </div>
          {form}
        </Card>
      </div>

      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
          {filtersTranslation.buttonLabel}
        </Button>
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={filtersTranslation.drawerTitle}>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                {filtersTranslation.title}
              </p>
              <p className="text-lg font-semibold text-text">
                {filtersTranslation.toursSubtitle}
              </p>
            </div>
            {form}
          </div>
        </Drawer>
      </div>
    </div>
  );
}

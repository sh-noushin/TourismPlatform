"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Card, Drawer, Input, Select } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";

import { CategoryDto } from "@/lib/api/categories";
import { fetchCountries, type CountryDto } from "@/lib/api/countries";
import type { HouseFilters } from "@/lib/filters/houses";
import type { SortOption } from "@/components/shared/SortDropdown.client";
import type { FiltersTranslation } from "@/lib/i18n";

interface HouseFiltersProps {
  initialFilters: HouseFilters;
  houseTypes: CategoryDto[];
  filtersTranslation: FiltersTranslation;
  sortLabel: string;
  sortOptions: SortOption[];
}

interface FormState {
  location: string;
  country: string;
  priceMin: string;
  priceMax: string;
  roomsMin: string;
  areaMin: string;
  type: string;
  sort: HouseFilters["sort"];
}

const createFormState = (filters: HouseFilters): FormState => ({
  location: filters.location ?? "",
  country: filters.country ?? "",
  priceMin: filters.priceMin?.toString() ?? "",
  priceMax: filters.priceMax?.toString() ?? "",
  roomsMin: filters.roomsMin?.toString() ?? "",
  areaMin: filters.areaMin?.toString() ?? "",
  type: filters.type ?? "",
  sort: filters.sort,
});

export function HouseFilters({
  initialFilters,
  houseTypes,
  filtersTranslation,
  sortLabel,
  sortOptions,
}: HouseFiltersProps) {
  const [formState, setFormState] = useState<FormState>(() => createFormState(initialFilters));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetchCountries()
      .then((data) => {
        if (!active) return;
        setCountries(data);
      })
      .catch((error) => {
        console.error("Failed to load countries", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const formFields = useMemo(() => {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">{filtersTranslation.location.label}</p>
          <p className="text-xs text-muted">{filtersTranslation.location.helper}</p>
          <Input
            placeholder={filtersTranslation.location.placeholder}
            value={formState.location}
            onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <span className="text-sm font-semibold text-text">{filtersTranslation.country.label}</span>
          <Select
            value={formState.country}
            onChange={(event) => setFormState((prev) => ({ ...prev, country: event.target.value }))}
          >
            <option value="">{filtersTranslation.country.allLabel}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
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
            <span className="text-sm font-semibold text-text">{filtersTranslation.roomsMinLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder="1"
              value={formState.roomsMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, roomsMin: event.target.value }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.areaMinLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder={filtersTranslation.duration.maxPlaceholder}
              value={formState.areaMin}
              onChange={(event) => setFormState((prev) => ({ ...prev, areaMin: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{filtersTranslation.houseType.label}</span>
            <Select
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="">{filtersTranslation.houseType.allLabel}</option>
              {houseTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-text">{sortLabel}</span>
            <Select
              value={formState.sort}
              onChange={(event) => setFormState((prev) => ({ ...prev, sort: event.target.value as HouseFilters["sort"] }))}
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
  }, [formState, houseTypes, countries, filtersTranslation, sortLabel, sortOptions]);

  const buildQuery = () => {
    const params = new URLSearchParams();

    if (formState.location) params.set("location", formState.location);
    if (formState.country) params.set("country", formState.country);
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
              {filtersTranslation.housesSubtitle}
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
                {filtersTranslation.housesSubtitle}
              </p>
            </div>
            {form}
          </div>
        </Drawer>
      </div>
    </div>
  );
}

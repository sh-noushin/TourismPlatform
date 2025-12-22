"use client";

import { Select } from "@/components/ui";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback } from "react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  options: readonly SortOption[];
  basePath: string;
  currentQuery: Record<string, string | string[] | undefined>;
  label?: string;
}

export function SortDropdown({ value, options, basePath, currentQuery, label }: SortDropdownProps) {
  const router = useRouter();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams();

      Object.entries(currentQuery).forEach(([key, rawValue]) => {
        if (!rawValue) return;
        if (Array.isArray(rawValue)) {
          rawValue.forEach((entry) => key !== "sort" && params.append(key, entry));
          return;
        }
        if (key === "sort" || key === "page") return;
        params.append(key, rawValue);
      });

      params.set("sort", event.target.value);
      params.set("page", "1");
      const queryString = params.toString();
      router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
    },
    [basePath, currentQuery, router]
  );

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-muted">
      {label && <span>{label}</span>}
      <Select value={value} onChange={handleChange} className="min-w-[150px]">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

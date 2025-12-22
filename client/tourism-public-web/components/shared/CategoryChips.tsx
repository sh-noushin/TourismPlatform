import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export interface CategoryChipItem {
  label: string;
  href: string;
  isActive?: boolean;
  count?: number;
}

export interface CategoryChipsProps {
  items: CategoryChipItem[];
  className?: string;
}

export function CategoryChips({ items, className }: CategoryChipsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <Link
          key={`${item.href}:${item.label}`}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            item.isActive
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-surface text-text hover:border-primary hover:text-primary"
          )}
        >
          <span>{item.label}</span>
          {typeof item.count === "number" && (
            <span className="text-xs font-normal text-text/60">{item.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

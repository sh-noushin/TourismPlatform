import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "solid" | "subtle" | "outline";

const variantStyles: Record<Variant, string> = {
  solid: "bg-primary text-primary-foreground",
  subtle: "bg-border/50 text-muted",
  outline: "border border-amber-400/60 text-amber-100",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "subtle", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
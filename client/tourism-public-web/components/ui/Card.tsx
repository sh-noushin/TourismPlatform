import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface p-4 shadow-sm shadow-black/5",
        className
      )}
      {...props}
    />
  );
}
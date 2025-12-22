import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ width = "100%", height = "1rem", style, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-border/40", className)}
      style={Object.assign({ width, height }, style) as CSSProperties}
      {...props}
    />
  );
}
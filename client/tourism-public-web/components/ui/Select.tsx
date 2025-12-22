import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-base",
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: Size;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ size = "md", className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-3 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {props.children}
    </select>
  )
);

Select.displayName = "Select";
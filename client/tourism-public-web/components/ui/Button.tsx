import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow shadow-primary/30 hover:bg-primary/90 focus-visible:ring-primary/50",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface/90 focus-visible:ring-primary/50",
  outline:
    "border border-border bg-transparent text-text hover:bg-surface focus-visible:ring-primary/50",
  ghost: "bg-transparent text-text hover:bg-surface focus-visible:ring-primary/50",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled ? "cursor-not-allowed opacity-70" : "shadow-sm",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent border-current" />
        </span>
      )}
      {children}
    </button>
  );
}
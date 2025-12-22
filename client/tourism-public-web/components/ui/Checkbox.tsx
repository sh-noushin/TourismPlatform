import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const { label, className, ...rest } = props;

  return (
    <label className={cn("inline-flex items-center gap-2 text-text", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded border border-border bg-surface text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        {...rest}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
});

Checkbox.displayName = "Checkbox";
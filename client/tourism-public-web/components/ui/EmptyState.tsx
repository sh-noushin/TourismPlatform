import type { ReactNode } from "react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title = "Nothing to show",
  description = "Try changing your filters or come back later.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center text-muted">
      {icon && <div className="text-4xl text-muted">{icon}</div>}
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="text-sm text-muted">{description}</p>
      {action && <div className="pt-3">{action}</div>}
    </div>
  );
}
import type { ReactNode } from "react";

import { Card } from "@/components/ui";

type DetailProperty = {
  label: string;
  value?: ReactNode;
};

type DetailPropertiesProps = {
  title: string;
  items: DetailProperty[];
  className?: string;
};

export function DetailProperties({ title, items, className }: DetailPropertiesProps) {
  const wrapperClassName = [
    "space-y-4 border border-white/10 bg-slate-900/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const emptyValue = <span className="text-muted">--</span>;

  return (
    <Card className={wrapperClassName}>
      <div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
      </div>
      <dl className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const displayValue =
            item.value === undefined ||
            item.value === null ||
            (typeof item.value === "number" && Number.isNaN(item.value))
              ? emptyValue
              : item.value;

          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <dt className="text-xs uppercase text-muted">{item.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-text">{displayValue}</dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

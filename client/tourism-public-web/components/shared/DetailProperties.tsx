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
      <dl className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {items.map((item, index) => {
          const displayValue =
            item.value === undefined ||
            item.value === null ||
            (typeof item.value === "number" && Number.isNaN(item.value))
              ? emptyValue
              : item.value;

          return (
            <div
              key={item.label}
              className={[
                "flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-6",
                index === 0 ? "" : "border-t border-white/10",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted sm:w-52 sm:shrink-0">
                {item.label}
              </dt>
              <dd className="text-sm font-semibold text-text sm:flex-1">{displayValue}</dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

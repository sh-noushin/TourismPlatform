"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The hero's search box.
 *
 * It does not query anything itself -- it hands the term to the existing
 * /tours and /houses list pages, which already know how to filter, sort and
 * page. One entry point, no second implementation of search.
 *
 * Labels arrive as individual strings rather than the whole translations
 * object: that object carries formatter functions, and a server component
 * cannot serialise a function across to the client.
 */
export function HeroSearch({
  labelDestination,
  placeholder,
  labelTours,
  labelHouses,
  labelSubmit,
}: {
  labelDestination: string;
  placeholder: string;
  labelTours: string;
  labelHouses: string;
  labelSubmit: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<"tours" | "houses">("tours");
  const [term, setTerm] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = term.trim();
    const query = trimmed ? `?destination=${encodeURIComponent(trimmed)}` : "";
    router.push(`/${kind}${query}`);
  };

  const tab = (value: "tours" | "houses", label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setKind(value)}
      aria-pressed={kind === value}
      className={[
        "rounded-full px-5 py-2 text-sm font-semibold transition",
        kind === value
          ? "bg-white text-[color:var(--text)] shadow-sm"
          : "text-white/85 hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-3 inline-flex rounded-full bg-black/25 p-1 backdrop-blur">
        {tab("tours", labelTours)}
        {tab("houses", labelHouses)}
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur sm:flex-row sm:items-center"
      >
        <label className="flex-1 px-3 py-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            {labelDestination}
          </span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent py-1 text-base text-[color:var(--text)] outline-none placeholder:text-[color:var(--muted)]"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-[color:var(--cta)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--cta-hover)]"
        >
          {labelSubmit}
        </button>
      </form>
    </div>
  );
}

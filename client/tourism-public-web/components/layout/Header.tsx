"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";

interface HeaderProps {
  initialLocale?: string;
}

export function Header({ initialLocale = "en" }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("NEXT_LOCALE") ?? initialLocale;
    }
    return initialLocale;
  });

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  return (
    <header
      className={cn(
        "z-40",
        isHome
          ? "absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 via-slate-900/80 to-transparent shadow-[0_40px_80px_-60px_rgba(0,0,0,0.8)]"
          : "sticky top-0 border-b border-border bg-surface/90 backdrop-blur"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:py-4 md:min-h-[64px]">
        <Link
          href="/"
          className={cn(
            "text-base font-semibold",
            isHome ? "text-white" : "text-text"
          )}
        >
          Tourism Platform
        </Link>
        <nav className={cn("flex items-center gap-6 text-sm font-medium", isHome ? "text-white/90" : "text-muted")}>
          <Link
            href="/houses"
            className={cn(
              "transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
              isHome ? "text-white" : "text-text"
            )}
          >
            Houses
          </Link>
          <Link
            href="/tours"
            className={cn(
              "transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
              isHome ? "text-white" : "text-text"
            )}
          >
            Tours
          </Link>
          <div className="ml-2 flex items-center">
            <label htmlFor="locale-select" className={cn("sr-only")}>Language</label>
            <select
              id="locale-select"
              value={locale}
              onChange={(e) => {
                const val = e.target.value;
                setLocale(val);
                document.cookie = `NEXT_LOCALE=${val}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
                localStorage.setItem("NEXT_LOCALE", val);
                location.reload();
              }}
              className={cn(
                "rounded border bg-transparent px-2 py-1 text-sm text-current focus:outline-none",
                isHome ? "text-white/90" : "text-text"
              )}
            >
              <option value="en">EN</option>
              <option value="fa">FA</option>
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
}

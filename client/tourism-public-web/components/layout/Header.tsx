"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

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

  const languages = [
    { code: "en", label: "English", flag: "/flags/en.svg" },
    { code: "fa", label: "فارسی", flag: "/flags/fa.svg" },
  ];

  const handleLocaleChange = (val: string) => {
    setLocale(val);
    document.cookie = `NEXT_LOCALE=${val}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
    localStorage.setItem("NEXT_LOCALE", val);
    location.reload();
  };

  return (
    <header
      className={cn(
        "z-40 lang-balanced-header",
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
          <div className="ml-2 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-2 py-1 shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur md:px-3">
            {languages.map((lang) => {
              const active = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLocaleChange(lang.code)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold uppercase transition",
                    active
                      ? "bg-white/25 text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                      : "text-white/80 hover:bg-white/15"
                  )}
                >
                  <Image src={lang.flag} alt={lang.label} width={18} height={12} className="rounded-sm ring-1 ring-white/50" />
                  <span>{lang.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}

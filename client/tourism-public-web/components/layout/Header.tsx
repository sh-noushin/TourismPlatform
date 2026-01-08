"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { i18n } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";

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

  const translations = useMemo(() => i18n(locale), [locale]);

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
      <div className="relative mx-auto w-full max-w-6xl px-5 py-3 md:py-4 md:min-h-[64px]">
        <nav
          className={cn(
            "relative z-10 flex w-full items-center justify-between gap-6 text-sm font-medium",
            isHome ? "text-white/90" : "text-muted"
          )}
        >
          <div />
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-2 py-1 shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur md:px-3">
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
        {isHome ? null : (
          <Link
            href="/"
            className={cn(
              "pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold",
              isHome ? "text-white" : "text-text"
            )}
          >
            {translations.siteTitle}
          </Link>
        )}
      </div>
    </header>
  );
}

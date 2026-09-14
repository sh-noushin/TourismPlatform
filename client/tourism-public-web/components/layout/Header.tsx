"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { i18n } from "@/lib/i18n";

interface HeaderProps {
  initialLocale?: string;
}

/**
 * Site header.
 *
 * Transparent over the home hero, solid everywhere else — one component, two
 * grounds. Previously the inner-page version carried only a centred wordmark
 * and the language pills: no way to reach tours or homes from a detail page
 * except the browser's back button.
 */
export function Header({ initialLocale = "en" }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const t = useMemo(() => i18n(locale), [locale]);

  // flag-icons artwork (MIT) rather than the hand-drawn en.svg/fa.svg that
  // shipped with the project: that Union Jack had the diagonals meeting off
  // centre and no white fimbriation, which is what made it look wrong at
  // small sizes. These are the real geometry, so they survive being 20px wide.
  const languages = [
    { code: "en", label: "English", flag: "/flags/gb.svg" },
    { code: "fa", label: "فارسی", flag: "/flags/ir.svg" },
  ];

  const handleLocaleChange = (value: string) => {
    setLocale(value);
    document.cookie = `NEXT_LOCALE=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
    localStorage.setItem("NEXT_LOCALE", value);
    location.reload();
  };

  const links = [
    { href: "/tours", label: t.navTours },
    { href: "/houses", label: t.navHouses },
    { href: "/#about", label: t.nav.about },
    { href: "/#contact", label: t.nav.contact },
  ];

  const languagePills = (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full p-1",
        isHome ? "bg-white/15 backdrop-blur" : "bg-[color:var(--surface-sunken)]",
      )}
    >
      {languages.map((lang) => {
        const active = locale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLocaleChange(lang.code)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition",
              active
                ? isHome
                  ? "bg-white text-[color:var(--text)]"
                  : "bg-[color:var(--surface)] text-[color:var(--text)] shadow-sm"
                : isHome
                  ? "text-white/80 hover:text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--text)]",
            )}
          >
            <Image
              src={lang.flag}
              alt=""
              width={20}
              height={14}
              className="h-[14px] w-[20px] rounded-[3px] object-cover ring-1 ring-black/10"
            />
            <span>{lang.code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <header
      className={cn(
        "z-40",
        isHome
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "sticky top-0 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className={cn(
            "text-base font-semibold",
            isHome ? "text-white" : "text-[color:var(--text)]",
          )}
        >
          {t.siteTitle}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition",
                isHome
                  ? "text-white/85 hover:text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--primary)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {languagePills}
      </div>
    </header>
  );
}

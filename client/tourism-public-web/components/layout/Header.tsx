"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        </nav>
      </div>
    </header>
  );
}
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-text">
          Tourism Platform
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted">
          <Link
            href="/houses"
            className={cn(
              "rounded-full px-4 py-2 transition hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              "border border-transparent text-text"
            )}
          >
            Houses
          </Link>
          <Link
            href="/tours"
            className={cn(
              "rounded-full px-4 py-2 transition hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              "border border-transparent text-text"
            )}
          >
            Tours
          </Link>
        </nav>
      </div>
    </header>
  );
}
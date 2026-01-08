import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-950/90" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-semibold">
              P
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sky-200">Parker</p>
              <p className="text-sm text-white/80">Tour &amp; Travel</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 md:flex">
            <Link href="/tours" className="hover:text-white">
              Tours
            </Link>
            <Link href="/houses" className="hover:text-white">
              Houses
            </Link>
            <Link href="#about" className="hover:text-white">
              About
            </Link>
            <Link href="mailto:hello@parker.travel" className="hover:text-white">
              Call us
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Explore</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl">
            Travel is the only thing you buy that makes you rich
          </h1>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            Discover unforgettable journeys and curated stays designed to inspire every traveler.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tours"
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-sky-400"
            >
              View Tours
            </Link>
            <Link
              href="/houses"
              className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white/10"
            >
              View Houses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

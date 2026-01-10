import Link from "next/link";

interface HeroProps {
  heading: string;
  toursCta: string;
  housesCta: string;
}

export function Hero({ heading, toursCta, housesCta }: HeroProps) {
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

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 pb-10 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl">{heading}</h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tours"
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-sky-400"
            >
              {toursCta}
            </Link>
            <Link
              href="/houses"
              className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white/10"
            >
              {housesCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

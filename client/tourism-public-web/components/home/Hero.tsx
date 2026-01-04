import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f0f7fb]">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-mountains.jpg"
          alt="Misty mountains and forest backdrop"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-[#f0f7fb]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 text-center text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-100/80 md:text-[11px]">
          Trips
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[0.06em] md:text-5xl">
          TRAVEL
        </h1>
      </div>
    </section>
  );
}

import Image from "next/image";

const Field = ({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) => (
  <label className="group flex flex-col gap-1 rounded-md border border-white/50 bg-white/80 px-4 py-3 text-left shadow-sm backdrop-blur transition hover:border-white/80 hover:bg-white">
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700/70">
      {label}
    </span>
    <input
      className="bg-transparent text-sm text-sky-900 outline-none placeholder:text-sky-700/70"
      placeholder={placeholder}
      readOnly
    />
  </label>
);

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

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-100/80">
          Trips
        </p>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[0.08em] md:text-7xl">
          TRAVEL
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-sky-50/90 md:text-lg">
          The best travel agency for your tours in Thailand
        </p>

        {/* Search bar (UI only) */}
        <div className="mx-auto mt-12 max-w-5xl rounded-xl border border-white/40 bg-white/80 p-3 shadow-2xl backdrop-blur-md">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-[1.15fr_1fr_1fr_0.9fr_auto] md:items-center">
            <Field label="Where" placeholder="Bangkok" />
            <Field label="Check in" placeholder="12 November" />
            <Field label="Check out" placeholder="2 December" />
            <Field label="Guests" placeholder="1 person" />

            <button
              type="button"
              className="h-full rounded-md bg-sky-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-sky-800"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

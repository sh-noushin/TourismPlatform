export function Hero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-6">
          <p className="font-serif text-lg tracking-wider text-white/90 md:text-xl">amazing tour</p>
          <h1 className="font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl">
            Discover Your
            <br />
            Next Adventure
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-white/90">
            <span className="font-semibold">639 Places</span>
            <span>|</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★★★★★</span>
              <span className="font-semibold">4.8/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

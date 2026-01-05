export function Hero() {
  return (
    <section
      aria-label="Scenic landing background"
      className="relative isolate h-[420px] overflow-hidden bg-black/80"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/60 to-transparent" />
      <div className="relative h-full">
        <div className="pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}

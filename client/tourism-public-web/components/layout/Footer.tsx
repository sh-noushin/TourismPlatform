export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200">
      <div className="absolute inset-0 bg-[url('/images/hero-mountains.jpg')] bg-cover bg-bottom" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/35 to-transparent" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-5 text-center text-sm text-white/85 sm:flex-row sm:items-center sm:justify-center">
        <p className="w-full sm:w-auto">Copyright {new Date().getFullYear()} Tourism Platform. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
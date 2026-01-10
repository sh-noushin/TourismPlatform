import Link from "next/link";

import headerImage from "@/app/assets/header.jpg";

interface HeroProps {
  heading: string;
  body: string;
  toursCta: string;
  housesCta: string;
}

export function Hero({ heading, body, toursCta, housesCta }: HeroProps) {
  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${headerImage.src}')`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 pb-10 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/85 drop-shadow-lg">PARKER</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white drop-shadow-2xl md:text-5xl">{heading}</h1>
          <p className="mt-4 text-base text-white/90 drop-shadow-lg md:text-lg">{body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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

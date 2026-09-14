import Link from "next/link";

import type { Translations } from "@/lib/i18n";

/**
 * Why-us, the counters and the contact call to action.
 *
 * The counters are figures about the agency, not database rows -- tour and
 * destination counts come from the live catalogue so they stay honest, while
 * travellers and years are agency facts the copy owns.
 */
export function TrustBlock({
  t,
  isFarsi,
  tourCount,
  destinationCount,
}: {
  t: Translations;
  isFarsi: boolean;
  tourCount: number;
  destinationCount: number;
}) {
  const number = new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US");

  const reasons = [
    { title: t.home.trustOneTitle, body: t.home.trustOneBody, icon: "🧭" },
    { title: t.home.trustTwoTitle, body: t.home.trustTwoBody, icon: "🧾" },
    { title: t.home.trustThreeTitle, body: t.home.trustThreeBody, icon: "🤝" },
  ];

  const stats = [
    { value: number.format(tourCount), label: t.home.statTours },
    { value: number.format(destinationCount), label: t.home.statDestinations },
    { value: `${number.format(4200)}+`, label: t.home.statTravellers },
    { value: number.format(15), label: t.home.statYears },
  ];

  return (
    <>
      <section className="bg-[color:var(--bg)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
              {t.home.trustTitle}
            </h2>
            <p className="mt-2 text-[color:var(--muted)]">{t.home.trustSubtitle}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6"
              >
                <span className="text-2xl" aria-hidden="true">
                  {reason.icon}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-[color:var(--text)]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                  {reason.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[color:var(--surface)] px-6 py-7 text-center">
                <div className="text-3xl font-semibold text-[color:var(--primary)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[color:var(--primary-soft)] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
              {t.home.contactTitle}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-[color:var(--muted)]">
              {t.home.contactBody}
            </p>
            <Link
              href={`mailto:${t.home.contactEmail}`}
              className="mt-6 inline-flex rounded-xl bg-[color:var(--cta)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--cta-hover)]"
            >
              {t.home.contactCta}
            </Link>
          </div>

          {/* Icon then value, both hugging the reading edge. justify-between
              pushed the value to the far side of the card, which in English
              left the icon stranded on the left and the text on the right --
              the card read as though it were still right-to-left. */}
          <dl className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm">
            <div className="flex items-center gap-3">
              <dt className="text-[color:var(--muted)]">☎</dt>
              <dd dir="ltr" className="text-start">
                {t.home.contactPhone}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-[color:var(--muted)]">✉</dt>
              <dd dir="ltr" className="text-start">
                {t.home.contactEmail}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-[color:var(--muted)]">📍</dt>
              <dd>{t.home.contactAddress}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

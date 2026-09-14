import type { RateSummaryDto } from "@/lib/api/exchange";
import type { Translations } from "@/lib/i18n";

/** Currency names in both languages, so the strip reads as prose, not codes. */
const CURRENCY_NAMES: Record<string, { en: string; fa: string }> = {
  USD: { en: "US Dollar", fa: "دلار آمریکا" },
  EUR: { en: "Euro", fa: "یورو" },
  AED: { en: "UAE Dirham", fa: "درهم امارات" },
  GBP: { en: "British Pound", fa: "پوند انگلیس" },
  TRY: { en: "Turkish Lira", fa: "لیر ترکیه" },
};

/**
 * Self-hosted SVGs rather than flag emoji: an ISO currency code opens with its
 * country code, but Windows ships no colour font for regional indicators, so
 * Chrome renders the pair as the literal letters "US".
 */
const flagFor = (currencyCode: string) => {
  const country = currencyCode.slice(0, 2).toLowerCase();
  return /^[a-z]{2}$/.test(country) ? `/flags/${country}.svg` : null;
};

export function RateStrip({
  rates,
  t,
  isFarsi,
}: {
  rates: RateSummaryDto[];
  t: Translations;
  isFarsi: boolean;
}) {
  const locale = isFarsi ? "fa-IR" : "en-US";
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  const updated = rates.length
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(Math.max(...rates.map((rate) => new Date(rate.capturedAtUtc).getTime()))),
      )
    : null;

  return (
    <section className="bg-[color:var(--text)] py-14 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{t.home.ratesTitle}</h2>
            <p className="mt-1 text-sm text-white/70">{t.home.ratesSubtitle}</p>
          </div>
          {updated && (
            <p className="text-xs text-white/55">
              {t.home.ratesUpdated} · {updated}
            </p>
          )}
        </div>

        {rates.length === 0 ? (
          <p className="mt-8 text-sm text-white/60">{t.home.ratesEmpty}</p>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {rates.map((rate) => {
              const meta = CURRENCY_NAMES[rate.baseCurrencyCode];
              const name = meta ? (isFarsi ? meta.fa : meta.en) : rate.baseCurrencyCode;
              const flag = flagFor(rate.baseCurrencyCode);
              const change = rate.changePercent;
              // No arrow at all when the feed has only one reading: an arrow
              // pointing nowhere reads as "unchanged", which is a claim we
              // cannot make yet.
              const direction = change === null ? null : change >= 0 ? "up" : "down";

              return (
                <div
                  key={`${rate.baseCurrencyCode}-${rate.quoteCurrencyCode}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    {flag && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={flag}
                        alt=""
                        width={20}
                        height={14}
                        className="rounded-[2px] shadow-sm"
                      />
                    )}
                    <span>{name}</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold" dir="ltr">
                    {number.format(rate.rate)}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      {t.home.ratesPerUnit(rate.baseCurrencyCode)}
                    </span>
                    {direction && (
                      <span
                        className={direction === "up" ? "text-emerald-300" : "text-rose-300"}
                        dir="ltr"
                      >
                        {direction === "up" ? "▲" : "▼"} {Math.abs(change ?? 0).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

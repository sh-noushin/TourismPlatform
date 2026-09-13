import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  ExchangeRatesService,
  ExchangeRateSummary,
} from '../../features/exchange/exchange-rates.service';

type RangeKey = '24h' | '7d' | '30d';
type MoveFilter = 'all' | 'up' | 'down';

/** A polyline ready for an <svg viewBox="0 0 w h">, plus the closed area under it. */
interface Series {
  line: string;
  area: string;
}

/** One month of the year-over-year comparison. */
interface MonthBar {
  month: number;
  label: string;
  current: number | null;
  previous: number | null;
  currentHeight: number;
  previousHeight: number;
}

const RANGE_DAYS: Record<RangeKey, number> = { '24h': 1, '7d': 7, '30d': 30 };

/** Days pulled for the monthly comparison: two years, so last year has bars. */
const YEAR_WINDOW_DAYS = 730;

@Component({
  standalone: true,
  selector: 'exchange-page',
  templateUrl: './exchange-page.component.html',
  styleUrls: ['./exchange-page.component.scss'],
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangePageComponent {
  readonly ranges: RangeKey[] = ['30d', '7d', '24h'];
  readonly moveFilters: MoveFilter[] = ['all', 'up', 'down'];

  readonly summaries = signal<ExchangeRateSummary[]>([]);
  /** Same pairs over two years, used only by the monthly chart. */
  readonly yearly = signal<ExchangeRateSummary[]>([]);
  readonly currencyNames = signal<Record<string, string>>({});
  readonly loading = signal(false);
  readonly syncing = signal(false);
  readonly error = signal<string | null>(null);
  /** Informational, not a failure: setup state or "nothing changed". */
  readonly notice = signal<string | null>(null);

  readonly range = signal<RangeKey>('7d');
  readonly filter = signal('');
  readonly move = signal<MoveFilter>('all');
  readonly selectedPair = signal<string | null>(null);

  /**
   * The active language, as a signal.
   *
   * TranslateService.currentLang is a plain property, so a computed that reads
   * it never recomputes when the language changes -- which left the chart's
   * month labels in whichever language the page first rendered in.
   */
  readonly lang = signal<'fa' | 'en'>('fa');

  constructor(
    private readonly rates: ExchangeRatesService,
    private readonly translate: TranslateService
  ) {
    this.lang.set(this.translate.currentLang === 'en' ? 'en' : 'fa');
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.lang.set(lang === 'en' ? 'en' : 'fa');
    });

    void this.loadCurrencies();
    void this.load();
    void this.loadYearly();
  }

  // ---------------------------------------------------------------- data ----

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.rates.getSummaries(RANGE_DAYS[this.range()]);
      this.summaries.set(data ?? []);

      // Keep the hero on whatever the user picked; fall back to the first pair
      // when the selection disappears (filtered out, or first load).
      const keys = (data ?? []).map(s => this.pairKey(s));
      if (!this.selectedPair() || !keys.includes(this.selectedPair()!)) {
        this.selectedPair.set(keys[0] ?? null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      this.error.set(message ?? this.translate.instant('EXCHANGE_PAGE.LOAD_FAILED'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Failures here only cost the monthly chart, so they don't raise a page error. */
  private async loadYearly(): Promise<void> {
    try {
      this.yearly.set((await this.rates.getSummaries(YEAR_WINDOW_DAYS)) ?? []);
    } catch {
      this.yearly.set([]);
    }
  }

  private async loadCurrencies(): Promise<void> {
    try {
      const list = await this.rates.getCurrencies();
      const map: Record<string, string> = {};
      for (const c of list ?? []) map[c.code] = c.name;
      this.currencyNames.set(map);
    } catch {
      this.currencyNames.set({});
    }
  }

  setRange(range: RangeKey): void {
    if (this.range() === range) return;
    this.range.set(range);
    void this.load();
  }

  /**
   * Pulls navasan.net, then re-reads what was stored.
   *
   * This was two buttons -- one that only re-queried the database and one that
   * fetched. They looked alike but behaved differently, and a "refresh" that
   * cannot bring new prices is not what anyone expects. The public feed has no
   * request quota, so there is no reason to keep fetching behind a second,
   * deliberate action.
   */
  async refresh(): Promise<void> {
    this.syncing.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      const result = await this.rates.sync();

      // "No key configured" is a setup state, not a failure -- saying so beats a
      // red banner that implies the network or the provider is broken.
      if (!result.configured) {
        this.notice.set(this.translate.instant('EXCHANGE_PAGE.FEED_NOT_CONFIGURED'));
        return;
      }

      if (result.imported === 0) {
        this.notice.set(this.translate.instant('EXCHANGE_PAGE.SYNC_NO_CHANGES'));
      }

      await this.load();
      await this.loadYearly();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      this.error.set(message ?? this.translate.instant('EXCHANGE_PAGE.SYNC_FAILED'));
    } finally {
      this.syncing.set(false);
    }
  }

  // ------------------------------------------------------------- derived ----

  readonly displayed = computed(() => {
    const q = this.filter().trim().toLowerCase();
    const move = this.move();

    return this.summaries().filter(s => {
      const name = this.currencyName(s.baseCurrencyCode).toLowerCase();
      const matchesText =
        !q ||
        s.baseCurrencyCode.toLowerCase().includes(q) ||
        s.quoteCurrencyCode.toLowerCase().includes(q) ||
        name.includes(q);

      const change = s.changePercent ?? 0;
      const matchesMove =
        move === 'all' || (move === 'up' && change > 0) || (move === 'down' && change < 0);

      return matchesText && matchesMove;
    });
  });

  readonly selected = computed(() => {
    const key = this.selectedPair();
    const list = this.summaries();
    return list.find(s => this.pairKey(s) === key) ?? list[0] ?? null;
  });

  readonly selectedSeries = computed<Series>(() =>
    this.buildSeries(this.selected()?.points ?? [], 400, 150)
  );

  readonly widgetSeries = computed<Series>(() =>
    this.buildSeries(this.selected()?.points ?? [], 320, 90)
  );

  /** Pairs that moved at all in the window -- the amber widget's figure. */
  readonly movedCount = computed(
    () => this.summaries().filter(s => (s.changePercent ?? 0) !== 0).length
  );

  /** Largest absolute 24h move, shown as the second stat. */
  readonly biggestMove = computed(() => {
    const withChange = this.summaries().filter(s => s.changePercent !== null);
    if (withChange.length === 0) return null;
    return withChange.reduce((a, b) =>
      Math.abs(b.changePercent!) > Math.abs(a.changePercent!) ? b : a
    );
  });

  /**
   * Monthly averages for the selected pair, this year against last.
   * Bars are scaled against the largest average in either year so the two
   * series stay comparable.
   */
  readonly monthlyBars = computed<MonthBar[]>(() => {
    const key = this.selectedPair();
    const pair = this.yearly().find(s => this.pairKey(s) === key) ?? this.yearly()[0] ?? null;
    if (!pair) return [];

    const thisYear = new Date().getFullYear();
    const sums = new Map<string, { total: number; count: number }>();

    for (const p of pair.points) {
      const d = new Date(p.capturedAtUtc);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = `${d.getFullYear()}-${d.getMonth()}`;
      const acc = sums.get(bucket) ?? { total: 0, count: 0 };
      acc.total += p.rate;
      acc.count += 1;
      sums.set(bucket, acc);
    }

    const avg = (year: number, month: number): number | null => {
      const acc = sums.get(`${year}-${month}`);
      return acc && acc.count > 0 ? acc.total / acc.count : null;
    };

    const months = Array.from({ length: 12 }, (_, m) => ({
      month: m,
      current: avg(thisYear, m),
      previous: avg(thisYear - 1, m),
    }));

    const peak = Math.max(
      0,
      ...months.flatMap(m => [m.current ?? 0, m.previous ?? 0])
    );

    // Buckets above are Gregorian months, so the label has to name a Gregorian
    // month. Farsi's default calendar in Intl is Jalali, which would translate
    // 1 September into شهریور -- a month that only half overlaps the bucket it
    // is labelling. -u-ca-gregory keeps the Persian script and the real month.
    const monthName = new Intl.DateTimeFormat(
      this.lang() === 'fa' ? 'fa-IR-u-ca-gregory' : 'en-US',
      { month: 'short' }
    );

    return months.map(m => ({
      month: m.month,
      label: monthName.format(new Date(thisYear, m.month, 1)),
      current: m.current,
      previous: m.previous,
      currentHeight: peak > 0 ? ((m.current ?? 0) / peak) * 100 : 0,
      previousHeight: peak > 0 ? ((m.previous ?? 0) / peak) * 100 : 0,
    }));
  });

  readonly hasMonthlyData = computed(() =>
    this.monthlyBars().some(b => b.current !== null || b.previous !== null)
  );

  pairKey(summary: ExchangeRateSummary): string {
    return `${summary.baseCurrencyCode}/${summary.quoteCurrencyCode}`;
  }

  /**
   * Full currency name in the active language, e.g. "دلار آمریکا".
   * Falls back to the API's English name, then the code itself, so an
   * un-translated currency still reads sensibly.
   */
  currencyName(code: string): string {
    const key = `CURRENCY_NAME.${code.toUpperCase()}`;
    const translated = this.translate.instant(key);
    if (translated !== key) return translated;
    return this.currencyNames()[code] ?? code;
  }

  /**
   * Path to a currency's flag.
   *
   * Emoji were the obvious route -- an ISO currency code opens with its ISO
   * country code, so USD -> US -> regional indicators -- but Windows has no
   * colour font for country flags, and Chrome renders the pair as the literal
   * letters "US". These are self-hosted SVGs instead (flag-icons, MIT).
   */
  flagUrl(code: string): string | null {
    const country = code.slice(0, 2).toLowerCase();
    return /^[a-z]{2}$/.test(country) ? `assets/flags/${country}.svg` : null;
  }

  /** Hides the image rather than showing a broken-image icon. */
  onFlagError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  /**
   * The unit shown after an amount. Persian writes ریال rather than the ISO
   * code; any currency without a translation falls back to its code, so adding
   * one is just a new CURRENCY.* key.
   */
  unitLabel(code: string): string {
    const key = `CURRENCY.${code.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated === key ? code : translated;
  }

  selectPair(summary: ExchangeRateSummary): void {
    this.selectedPair.set(this.pairKey(summary));
  }

  /**
   * Where the current rate sits inside the window's low-high band, 0-100.
   * A flat band has no meaningful position, so it reads as 0.
   */
  rangePosition(summary: ExchangeRateSummary): number {
    const low = summary.windowLow;
    const high = summary.windowHigh;
    if (low === null || high === null || high <= low) return 0;
    const pct = ((summary.rate - low) / (high - low)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  sparkline(summary: ExchangeRateSummary): Series {
    return this.buildSeries(summary.points, 78, 24);
  }

  /**
   * Maps points onto an SVG box. Flat series would divide by a zero range, so
   * they are pinned to the vertical middle instead of collapsing onto the axis.
   */
  private buildSeries(points: { rate: number }[], width: number, height: number): Series {
    if (points.length === 0) return { line: '', area: '' };

    const pad = 2;
    const usable = height - pad * 2;
    const values = points.map(p => p.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const step = points.length > 1 ? width / (points.length - 1) : 0;
    const coords = points.map((p, i) => {
      const x = points.length > 1 ? i * step : width / 2;
      const y = range === 0 ? height / 2 : pad + (1 - (p.rate - min) / range) * usable;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    });

    const line = coords.map(c => `${c.x},${c.y}`).join(' ');
    const first = coords[0];
    const last = coords[coords.length - 1];
    const area = `${first.x},${height} ${line} ${last.x},${height}`;

    return { line, area };
  }

  // ------------------------------------------------------------ display ----

  /** Farsi renders Persian digits; English keeps Latin. Grouping either way. */
  formatNumber(value: number | null | undefined, fractionDigits = 0): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat(this.locale(), {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }

  /** 1,042,500 -> 1.04M. Used where a headline has no room for full digits. */
  formatCompact(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat(this.locale(), {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatChange(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${sign}${this.formatNumber(Math.abs(value), 1)}%`;
  }

  changeDirection(value: number | null | undefined): 'up' | 'down' | 'flat' {
    if (!value) return 'flat';
    return value > 0 ? 'up' : 'down';
  }

  formatTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(this.locale(), {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  }

  private locale(): string {
    return this.lang() === 'fa' ? 'fa-IR' : 'en-US';
  }
}

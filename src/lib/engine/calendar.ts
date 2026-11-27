export type Regime = "vat" | "simplified";

export interface Deadline {
  /** ISO yyyy-mm-dd. */
  date: string;
  title: string;
  ref: string;
}

interface Rule {
  /** 0-based months the rule fires in. */
  months: number[];
  day: number;
  title: string;
  ref: string;
  when?: (o: CalendarOptions) => boolean;
}

export interface CalendarOptions {
  regime: Regime;
  excise: boolean;
}

const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const AFTER_QUARTER = [0, 3, 6, 9];
const SECOND_MONTH_OF_QUARTER = [1, 4, 7, 10];
const vat = (o: CalendarOptions) => o.regime === "vat";

const RULES: Rule[] = [
  { months: ALL, day: 20, title: "ƏDV bəyannaməsi və ödənişi (keçən ay)", ref: "VM 177.2", when: vat },
  { months: ALL, day: 20, title: "Əmək haqqından tutulan gəlir vergisinin köçürülməsi", ref: "VM 150.3.1" },
  { months: ALL, day: 20, title: "Aksiz bəyannaməsi və ödənişi", ref: "VM 191, 192", when: (o) => o.excise },
  { months: AFTER_QUARTER, day: 20, title: "Ödəmə mənbəyindən tutulan vergi bəyannaməsi (rüblük)", ref: "VM 150.3.3" },
  { months: AFTER_QUARTER, day: 20, title: "Sadələşdirilmiş vergi bəyannaməsi və ödənişi", ref: "VM 221.3", when: (o) => o.regime === "simplified" },
  { months: AFTER_QUARTER, day: 15, title: "Mənfəət vergisi üzrə cari ödəmə", ref: "VM 151.1", when: vat },
  { months: SECOND_MONTH_OF_QUARTER, day: 15, title: "Əmlak vergisi üzrə cari ödəmə (20%)", ref: "VM 201.3" },
  { months: [0], day: 31, title: "Torpaq vergisi illik bəyannaməsi", ref: "VM 208.2" },
  { months: [7, 10], day: 15, title: "Torpaq vergisi üzrə cari ödəmə (1/2)", ref: "VM 208.5-1" },
  { months: [2], day: 31, title: "Mənfəət vergisi illik bəyannaməsi və yekun ödəniş", ref: "VM 149.2, 152", when: vat },
  { months: [3], day: 15, title: "Cari ödəmə metodunun seçilməsi barədə məlumat", ref: "VM 151.3", when: vat },
  { months: [2], day: 31, title: "Əmlak vergisi illik bəyannaməsi", ref: "VM 201.5" },
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Statutory deadlines from `from` (inclusive) for the next 12 months, sorted by date.
 * Moving a deadline that falls on a weekend or holiday is not applied yet.
 */
export function deadlines(from: string, opts: CalendarOptions): Deadline[] {
  const [y0, m0] = from.split("-").map(Number);
  const end = iso(y0 + 1, m0 - 1, Number(from.slice(8, 10)));
  const out: Deadline[] = [];
  for (const r of RULES) {
    if (r.when && !r.when(opts)) continue;
    for (const y of [y0, y0 + 1]) {
      for (const m of r.months) {
        const date = iso(y, m, r.day);
        if (date >= from && date < end) out.push({ date, title: r.title, ref: r.ref });
      }
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

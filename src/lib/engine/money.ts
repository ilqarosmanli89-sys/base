/** Rounds to qəpik (2 decimals), half away from zero. */
export function round2(x: number): number {
  return Math.sign(x) * Math.round(Math.abs(x) * 100 + Number.EPSILON) / 100;
}

/** Formats an amount as Azerbaijani manat text, e.g. "2 669,00". */
export function formatAzn(x: number): string {
  const [int, frac] = Math.abs(round2(x)).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${grouped},${frac}`;
}

/** Applies a progressive band schedule: each band taxes the part of `base` between its `from` and the next band's `from`. */
export interface Band {
  from: number;
  rate: number;
}

export function progressive(base: number, bands: Band[]): number {
  let total = 0;
  for (let i = 0; i < bands.length; i++) {
    const lo = bands[i].from;
    const hi = i + 1 < bands.length ? bands[i + 1].from : Infinity;
    if (base <= lo) break;
    total += (Math.min(base, hi) - lo) * bands[i].rate;
  }
  return total;
}

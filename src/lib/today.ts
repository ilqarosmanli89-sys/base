/** Today's date in Baku (UTC+4), ISO yyyy-mm-dd. */
export function bakuToday(now = new Date()): string {
  return new Date(now.getTime() + 4 * 3600e3).toISOString().slice(0, 10);
}

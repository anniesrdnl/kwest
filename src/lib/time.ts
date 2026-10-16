/** Today's date (YYYY-MM-DD) in an IANA time zone. Falls back to UTC for unknown zones. */
export function localDate(timeZone: string, now: Date = new Date()): string {
  const format = (zone: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  try {
    return format(timeZone);
  } catch {
    return format("UTC");
  }
}

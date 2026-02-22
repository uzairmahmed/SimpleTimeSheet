/**
 * Pay period: Sunday 00:00 to Saturday 23:59.
 * Returns the Sunday (start) and Saturday (end) for the week containing the given date.
 */
export function getPayPeriodBoundsForDate(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function formatPayPeriodLabel(start: Date, end: Date): string {
  return `${start.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}`;
}

export function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 14-day window (Sun–Sat x2) starting from the Sunday of the week containing the given date. */
export function getTwoWeekWindow(date: Date): { start: Date; end: Date } {
  const { start } = getPayPeriodBoundsForDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Move a 2-week window by N periods (1 = next 14 days, -1 = previous 14 days). */
export function shiftTwoWeekWindow(start: Date, periods: number): Date {
  const next = new Date(start);
  next.setDate(start.getDate() + periods * 14);
  return next;
}

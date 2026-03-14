/**
 * Pure calculation functions for timesheet business logic.
 * All logic is server-side only.
 */

/** Format a Date to YYYY-MM-DD */
export function formatDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse HH:mm into total minutes */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Round minutes to nearest 15-minute increment */
function roundMinutes(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

export type TimesheetCalcResult = {
  workedMinutes: number;
  breakMinutes: number;
  paidHours: number;
};

/**
 * Calculate paid hours from start/end time strings (HH:mm).
 * Applies 30-min unpaid break if worked > 5.5 hours.
 * Rounds to nearest 15-minute increment.
 */
export function calculatePaidHours(
  startTime: string,
  endTime: string
): TimesheetCalcResult {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const workedMinutes = endMinutes - startMinutes;
  const workedHours = workedMinutes / 60;

  const breakMinutes = workedHours > 5.5 ? 30 : 0;
  const paidMinutes = workedMinutes - breakMinutes;
  const roundedPaidMinutes = roundMinutes(paidMinutes);
  const paidHours = roundedPaidMinutes / 60;

  return { workedMinutes, breakMinutes, paidHours };
}

/**
 * Get the Sunday–Saturday pay period that contains the given date.
 * Returns { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
export function getPayPeriodRange(date: Date): { start: string; end: string } {
  const day = date.getDay(); // 0 = Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    start: formatDateStr(sunday),
    end: formatDateStr(saturday),
  };
}

/** Format a period label e.g. "Mar 9 – Mar 15, 2026" */
export function formatPeriodLabel(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    });
  const year = new Date(endDate + "T12:00:00").getFullYear();
  return `${fmt(startDate)} – ${fmt(endDate)}, ${year}`;
}

/** Format hours as "X h Y min" */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

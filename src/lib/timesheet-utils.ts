/**
 * Round minutes to the nearest 15 (0, 15, 30, 45).
 * timeStr format: "HH:MM"
 */
export function roundToNearest15Min(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m;
  const rounded = Math.round(totalMins / 15) * 15;
  const hours = Math.floor(rounded / 60) % 24;
  const mins = rounded % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Parse "HH:MM" to total minutes since midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Minutes since midnight to "HH:MM".
 */
export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Compute worked minutes (end - start), break (30 if worked > 5.5h else 0), and paid hours.
 * Times are "HH:MM"; round to nearest 15 min and apply break rule.
 */
export function computeBreakAndPaidHours(
  startTime: string,
  endTime: string
): { breakMinutes: number; paidHours: number; workedMinutes: number } {
  const start = roundToNearest15Min(startTime);
  const end = roundToNearest15Min(endTime);
  let workedMinutes = timeToMinutes(end) - timeToMinutes(start);
  if (workedMinutes < 0) workedMinutes = 0;
  const workedHours = workedMinutes / 60;
  const breakMinutes = workedHours > 5.5 ? 30 : 0;
  const paidMinutes = workedMinutes - breakMinutes;
  const paidHours = Math.round((paidMinutes / 60) * 100) / 100;
  return { breakMinutes, paidHours, workedMinutes };
}

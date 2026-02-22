"use client";

import { toDateOnly } from "@/lib/pay-period";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarEntry = {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  paidHours: number | { toString(): string };
};

function paidNum(v: number | { toString(): string }): number {
  return typeof v === "number" ? v : Number(v.toString());
}

/** Format entry as start–end (e.g. "9:00–17:00"). Multiple entries: "9:00–12:00, 13:00–17:00" or first + count. */
function formatEntryTimes(dayEntries: CalendarEntry[]): string {
  if (dayEntries.length === 0) return "—";
  if (dayEntries.length === 1) return `${dayEntries[0].startTime}–${dayEntries[0].endTime}`;
  return dayEntries.map((e) => `${e.startTime}–${e.endTime}`).join(", ");
}

export function TwoWeekCalendar({
  windowStart,
  entries,
  periodLocked,
  lockedDateStrings = [],
  onPrev,
  onNext,
  onAddDate,
  onEditEntry,
}: {
  windowStart: Date;
  entries: CalendarEntry[];
  periodLocked: boolean;
  lockedDateStrings?: string[];
  onPrev: () => void;
  onNext: () => void;
  onAddDate: (date: string) => void;
  onEditEntry: (entry: CalendarEntry) => void;
}) {
  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(windowStart);
    d.setDate(windowStart.getDate() + i);
    days.push(d);
  }

  const entriesByDate = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    const key = toDateOnly(new Date(e.date));
    if (!entriesByDate.has(key)) entriesByDate.set(key, []);
    entriesByDate.get(key)!.push(e);
  }

  const lockedSet = new Set(lockedDateStrings);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md p-2 hover:bg-accent"
          aria-label="Previous 2 weeks"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium">
          {windowStart.toLocaleDateString("en-CA", { month: "short", year: "numeric" })} — 2 weeks
        </span>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md p-2 hover:bg-accent"
          aria-label="Next 2 weeks"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-x-auto flex-1 min-h-0">
        <div className="grid grid-cols-7 gap-2 min-w-0 py-2">
          {days.map((d) => {
            const dateStr = toDateOnly(d);
            const dayEntries = entriesByDate.get(dateStr) ?? [];
            const isToday = dateStr === toDateOnly(new Date());
            const isLocked = lockedSet.has(dateStr);

            return (
              <div
                key={dateStr}
                className={`min-w-[72px] sm:min-w-[80px] min-h-[140px] rounded-lg border p-2 text-center text-sm flex flex-col ${
                  isLocked
                    ? "border-muted bg-muted/50 text-muted-foreground opacity-75"
                    : isToday
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                }`}
              >
                <div className="text-muted-foreground font-medium flex-shrink-0">
                  {dayNames[d.getDay()]} {d.getDate()}
                </div>
                {isLocked ? (
                  <div className="mt-1 flex-1 flex items-center justify-center text-muted-foreground text-xs">
                    {dayEntries.length > 0 ? formatEntryTimes(dayEntries) : "—"}
                  </div>
                ) : periodLocked ? (
                  <div className="mt-1 flex-1 flex items-center justify-center text-muted-foreground text-xs">
                    {dayEntries.length > 0 ? formatEntryTimes(dayEntries) : "—"}
                  </div>
                ) : dayEntries.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onAddDate(dateStr)}
                    className="mt-1 flex-1 w-full min-h-[88px] rounded bg-muted py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs flex items-center justify-center"
                  >
                    + Add
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onEditEntry(dayEntries[0])}
                    className="mt-1 flex-1 w-full min-h-[88px] rounded py-2 font-medium text-primary hover:bg-accent text-xs flex items-center justify-center"
                  >
                    {formatEntryTimes(dayEntries)}
                    {dayEntries.length > 1 ? ` (${dayEntries.length})` : ""}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

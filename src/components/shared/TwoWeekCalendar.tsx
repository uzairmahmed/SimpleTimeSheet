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

export function TwoWeekCalendar({
  windowStart,
  entries,
  periodLocked,
  onPrev,
  onNext,
  onAddDate,
  onEditEntry,
}: {
  windowStart: Date;
  entries: CalendarEntry[];
  periodLocked: boolean;
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-0">
          {days.map((d) => {
          const dateStr = toDateOnly(d);
          const dayEntries = entriesByDate.get(dateStr) ?? [];
          const totalPaid = dayEntries.reduce((s, e) => s + paidNum(e.paidHours), 0);
          const isToday =
            dateStr === toDateOnly(new Date());

          return (
            <div
              key={dateStr}
              className={`min-w-[72px] sm:min-w-[80px] rounded-lg border p-2 text-center text-sm ${
                isToday ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="text-muted-foreground font-medium">
                {dayNames[d.getDay()]} {d.getDate()}
              </div>
              {periodLocked ? (
                <div className="mt-1 text-muted-foreground">
                  {dayEntries.length > 0 ? `${totalPaid} h` : "—"}
                </div>
              ) : dayEntries.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onAddDate(dateStr)}
                  className="mt-1 w-full min-h-[44px] rounded bg-muted py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  + Add
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEditEntry(dayEntries[0])}
                  className="mt-1 w-full min-h-[44px] rounded py-2 font-medium text-primary hover:bg-accent"
                >
                  {totalPaid} h
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

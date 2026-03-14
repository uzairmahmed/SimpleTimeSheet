"use client";

import { formatHours } from "@/lib/timesheetCalc";
import { AdminEditEntryDialog } from "./AdminEntryFormDialog";
import { AdminDeleteEntryButton } from "./AdminDeleteEntryButton";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  paidHours: number;
  user: { name: string };
};

type Props = {
  entries: Entry[];
  periodStart: string;
  isLocked: boolean;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDays(periodStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(periodStart + "T12:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function AdminCalendarView({ entries, periodStart, isLocked }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const days = buildDays(periodStart);

  const entriesByDate = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = entriesByDate.get(e.date) ?? [];
    list.push(e);
    entriesByDate.set(e.date, list);
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
      {/* Day headers */}
      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="bg-muted/50 text-center text-xs font-medium text-muted-foreground py-1.5"
        >
          {label}
        </div>
      ))}

      {/* Day cells */}
      {days.map((date) => {
        const dayEntries = entriesByDate.get(date) ?? [];
        const isToday = date === today;
        const dayNum = parseInt(date.slice(8), 10);

        return (
          <div
            key={date}
            className={[
              "bg-background min-h-[80px] p-1.5 flex flex-col gap-1",
              isLocked ? "opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Date number */}
            <span
              className={[
                "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full shrink-0",
                isToday
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {dayNum}
            </span>

            {/* Employee entries */}
            <div className="flex flex-col gap-0.5">
              {dayEntries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-1 rounded bg-muted/60 px-1 py-0.5 group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium leading-tight truncate">
                      {e.user.name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-tight font-mono">
                      {formatHours(e.paidHours)}
                    </span>
                  </div>
                  {!isLocked && (
                    <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <AdminEditEntryDialog
                        entry={{
                          id: e.id,
                          employeeName: e.user.name,
                          date: e.date,
                          startTime: e.startTime,
                          endTime: e.endTime,
                          paidHours: e.paidHours,
                        }}
                      />
                      <AdminDeleteEntryButton id={e.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Lock } from "lucide-react";
import { formatHours } from "@/lib/timesheetCalc";
import { AdminEditEntryDialog } from "./AdminEntryFormDialog";
import { AdminDeleteEntryButton } from "./AdminDeleteEntryButton";
import { AdjustmentDialog } from "./AdjustmentDialog";

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
  periodEnd: string;
  isLocked: boolean;
  today: string;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDays(start: string, end: string): string[] {
  const days: string[] = [];
  const cur = new Date(start + "T12:00:00");
  const last = new Date(end + "T12:00:00");
  while (cur <= last) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function AdminCalendarView({ entries, periodStart, periodEnd, isLocked, today }: Props) {
  const days = buildDays(periodStart, periodEnd);

  const entriesByDate = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = entriesByDate.get(e.date) ?? [];
    list.push(e);
    entriesByDate.set(e.date, list);
  }

  return (
    <>
      {isLocked && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-3 bg-muted/40 rounded-md border">
          <Lock className="h-3 w-3 shrink-0" />
          This period is locked. Use the amber adjust button to make changes (all adjustments are logged).
        </div>
      )}

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {/* Day headers */}
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-muted/50 text-center text-sm font-medium text-muted-foreground py-3"
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
                "bg-background min-h-[130px] p-2.5 flex flex-col gap-2",
                isLocked ? "opacity-75" : "",
              ].join(" ")}
            >
              {/* Date number */}
              <span
                className={[
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full shrink-0",
                  isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {dayNum}
              </span>

              {/* Employee entry chips */}
              <div className="flex flex-col gap-1">
                {dayEntries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-1 rounded bg-muted/60 px-2 py-1.5 group"
                  >
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span className="text-xs font-medium leading-snug truncate">
                        {e.user.name.split(" ")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground leading-snug font-mono">
                        {e.startTime} – {e.endTime}
                      </span>
                      <span className="text-xs font-semibold leading-snug">
                        {formatHours(e.paidHours)}
                      </span>
                    </div>
                    <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {isLocked ? (
                        <AdjustmentDialog
                          entry={{
                            id: e.id,
                            employeeName: e.user.name,
                            date: e.date,
                            startTime: e.startTime,
                            endTime: e.endTime,
                            paidHours: e.paidHours,
                          }}
                        />
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

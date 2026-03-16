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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 p-2 bg-muted/40 rounded-md border">
          <Lock className="h-3 w-3 shrink-0" />
          This period is locked. Use the amber adjust button to make changes (all adjustments are logged).
        </div>
      )}

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
                isLocked ? "opacity-75" : "",
              ].join(" ")}
            >
              {/* Date number */}
              <span
                className={[
                  "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full shrink-0",
                  isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {dayNum}
              </span>

              {/* Employee entry chips */}
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

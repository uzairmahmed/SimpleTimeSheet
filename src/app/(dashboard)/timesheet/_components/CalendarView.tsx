"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Pencil, Plus } from "lucide-react";
import { EntryFormDialog } from "./EntryFormDialog";
import { DeleteEntryButton } from "./DeleteEntryButton";
import { formatHours } from "@/lib/timesheetCalc";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number;
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

export function CalendarView({ entries, periodStart, periodEnd, isLocked, today }: Props) {
  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to today's cell when period changes
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [periodStart]);

  const days = buildDays(periodStart, periodEnd);
  const entryByDate = new Map(entries.map((e) => [e.date, e]));

  function openAdd(date: string) {
    setEditEntry(null);
    setDialogDate(date);
    setDialogOpen(true);
  }

  function openEdit(entry: Entry) {
    setEditEntry(entry);
    setDialogDate(entry.date);
    setDialogOpen(true);
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setDialogDate(null);
      setEditEntry(null);
    }
  }

  return (
    <>
      {isLocked && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-3 bg-muted/40 rounded-md border">
          <Lock className="h-3 w-3 shrink-0" />
          This period is locked. Entries are read-only.
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
          const entry = entryByDate.get(date);
          const isToday = date === today;
          const canAdd = !isLocked && !entry;
          const canEdit = !isLocked && !!entry;
          const dayNum = parseInt(date.slice(8), 10);

          return (
            <div
              key={date}
              ref={isToday ? todayRef : undefined}
              onClick={() => {
                if (isLocked) return;
                if (entry) openEdit(entry);
                else openAdd(date);
              }}
              title={isLocked ? "This period is locked and cannot be edited." : undefined}
              className={[
                "group bg-background min-h-[130px] p-2.5 flex flex-col gap-2 transition-colors",
                isLocked ? "opacity-60 cursor-not-allowed" : entry ? "cursor-pointer hover:bg-accent/50" : "cursor-pointer hover:bg-accent/30",
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

              {/* Entry info */}
              {entry ? (
                <div className="rounded bg-muted/60 px-2 py-2 group/chip flex items-start gap-1 justify-between flex-1">
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-xs leading-snug font-mono">
                      {entry.startTime} – {entry.endTime}
                    </span>
                    <span className="text-xs font-semibold text-foreground leading-snug">
                      {formatHours(entry.paidHours)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 opacity-0 group-hover/chip:opacity-100 transition-opacity">
                    {canEdit && (
                      <>
                        <Pencil className="h-3 w-3 text-muted-foreground/60" />
                        <div onClick={(e) => e.stopPropagation()}>
                          <DeleteEntryButton id={entry.id} />
                        </div>
                      </>
                    )}
                    {isLocked && (
                      <Lock className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </div>
                </div>
              ) : canAdd ? (
                <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-5 w-5 text-muted-foreground/40" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Controlled dialog */}
      {dialogDate && !editEntry && (
        <EntryFormDialog
          mode="add"
          fixedDate={dialogDate}
          open={dialogOpen}
          onOpenChange={handleOpenChange}
        />
      )}
      {dialogDate && editEntry && (
        <EntryFormDialog
          mode="edit"
          entryId={editEntry.id}
          fixedDate={editEntry.date}
          defaultValues={{
            date: editEntry.date,
            startTime: editEntry.startTime,
            endTime: editEntry.endTime,
          }}
          open={dialogOpen}
          onOpenChange={handleOpenChange}
        />
      )}
    </>
  );
}

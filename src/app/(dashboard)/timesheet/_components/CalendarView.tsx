"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

function buildDays(periodStart: string): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(periodStart + "T12:00:00");
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function CalendarView({ entries, periodStart, isLocked, today }: Props) {
  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const days = buildDays(periodStart);
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
      {/* 7-column calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {/* Day headers */}
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-muted/50 text-center text-xs font-medium text-muted-foreground py-2"
          >
            {label}
          </div>
        ))}

        {/* Day cells */}
        {days.map((date, idx) => {
          const entry = entryByDate.get(date);
          const isToday = date === today;
          const isPast = date < today;
          const canAdd = !isLocked && !entry;
          const canEdit = !isLocked && !!entry;
          const dayNum = parseInt(date.slice(8), 10);

          return (
            <div
              key={date}
              onClick={() => {
                if (isLocked) return;
                if (entry) openEdit(entry);
                else openAdd(date);
              }}
              className={[
                "bg-background min-h-[90px] p-2 flex flex-col gap-1 transition-colors",
                isLocked
                  ? "opacity-60"
                  : entry
                  ? "cursor-pointer hover:bg-accent/50"
                  : canAdd
                  ? "cursor-pointer hover:bg-accent/30"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Date number */}
              <span
                className={[
                  "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {dayNum}
              </span>

              {/* Entry info */}
              {entry ? (
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-[11px] leading-tight font-medium">
                    {entry.startTime} – {entry.endTime}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatHours(entry.paidHours)}
                  </span>
                  {canEdit && (
                    <div
                      className="mt-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteEntryButton id={entry.id} />
                    </div>
                  )}
                </div>
              ) : canAdd ? (
                <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Controlled dialog — add or edit depending on state */}
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

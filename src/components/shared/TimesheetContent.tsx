"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyEntryForm } from "./DailyEntryForm";
import { EntryTable } from "./EntryTable";
import { TwoWeekCalendar, type CalendarEntry } from "./TwoWeekCalendar";
import { Button } from "@/components/ui/button";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPayPeriodLabel, toDateOnly, shiftTwoWeekWindow } from "@/lib/pay-period";

type Entry = {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number | { toString(): string };
  payPeriod: { isLocked: boolean } | null;
};

type PayPeriodRow = {
  id: string;
  startDate: Date;
  endDate: Date;
  isLocked: boolean;
};

export function TimesheetContent({
  entries,
  currentPeriod,
  periodHistory,
  showAddForm = true,
  windowStart: windowStartProp = null,
}: {
  entries: Entry[];
  currentPeriod: { start: Date; end: Date; isLocked: boolean };
  periodHistory: PayPeriodRow[];
  showAddForm?: boolean;
  windowStart?: Date | null;
}) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string>("");
  const [selectedEntryIdForEdit, setSelectedEntryIdForEdit] = useState<string | null>(null);

  const refresh = () => router.refresh();

  function handleCalendarPrev() {
    if (!windowStartProp) return;
    const nextStart = shiftTwoWeekWindow(windowStartProp, -1);
    router.push(`/timesheet?window=${toDateOnly(nextStart)}`);
  }

  function handleCalendarNext() {
    if (!windowStartProp) return;
    const nextStart = shiftTwoWeekWindow(windowStartProp, 1);
    router.push(`/timesheet?window=${toDateOnly(nextStart)}`);
  }

  const calendarEntries: CalendarEntry[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    paidHours: e.paidHours,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground">
          {showAddForm ? "Current period: " : "Period: "}
          {formatPayPeriodLabel(currentPeriod.start, currentPeriod.end)}
          {currentPeriod.isLocked && " (locked)"}
        </p>
        {!showAddForm && (
          <Link href="/timesheet">
            <Button variant="outline" size="sm" className="mt-2">
              Back to current period
            </Button>
          </Link>
        )}
      </div>

      {windowStartProp && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>2-week calendar</CardTitle>
            <CardDescription>
              Click a day to add an entry; click hours to edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoWeekCalendar
              windowStart={windowStartProp}
              entries={calendarEntries}
              periodLocked={currentPeriod.isLocked}
              onPrev={handleCalendarPrev}
              onNext={handleCalendarNext}
              onAddDate={(date) => {
                setAddModalDate(date);
                setAddModalOpen(true);
              }}
              onEditEntry={(entry) => setSelectedEntryIdForEdit(entry.id)}
            />
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <DailyEntryForm
          disabled={currentPeriod.isLocked}
          onSuccess={refresh}
        />
      )}

      {addModalOpen && (
        <>
          <DialogOverlay onClick={() => setAddModalOpen(false)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add entry</DialogTitle>
              <DialogDescription>
                Add a timesheet entry for the selected date.
              </DialogDescription>
            </DialogHeader>
            <DailyEntryForm
              defaultDate={addModalDate}
              disabled={currentPeriod.isLocked}
              onSuccess={() => {
                setAddModalOpen(false);
                refresh();
              }}
            />
            <div className="mt-4">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </>
      )}

      <EntryTable
        entries={entries}
        periodLocked={currentPeriod.isLocked}
        onUpdate={refresh}
        initialEditEntryId={selectedEntryIdForEdit}
        onClearEditId={() => setSelectedEntryIdForEdit(null)}
      />

      {periodHistory.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Past periods</h2>
          <ul className="space-y-1 text-sm">
            {periodHistory.map((p) => (
              <li key={p.id}>
                <a
                  href={`/timesheet?period=${p.id}`}
                  className="text-primary hover:underline"
                >
                  {formatPayPeriodLabel(p.startDate, p.endDate)}
                  {p.isLocked ? " (locked)" : ""}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

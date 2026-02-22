"use client";

import { useState, useRef, useEffect } from "react";
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
import { formatPayPeriodLabel, toDateOnly, shiftTwoWeekWindow } from "@/lib/pay-period";
import { Calendar, List } from "lucide-react";

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

function AddEntryMoreInfo() {
  const [showMore, setShowMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMore) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto py-1 px-0 text-muted-foreground hover:text-foreground font-normal text-sm"
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore ? "less" : "more"}
      </Button>
      {showMore && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[240px] rounded-md border bg-popover px-3 py-2 shadow-md">
          <ul className="text-sm text-muted-foreground space-y-1 list-none list-inside">
            <li>* Date and times are rounded to the nearest 15 minutes.</li>
            <li>* 30-minute unpaid break is applied when hours exceed 5.5.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function TimesheetContent({
  entries,
  currentPeriod,
  periodHistory,
  showAddForm = true,
  windowStart: windowStartProp = null,
  periodId = null,
  lockedDateStrings = [],
}: {
  entries: Entry[];
  currentPeriod: { start: Date; end: Date; isLocked: boolean };
  periodHistory: PayPeriodRow[];
  showAddForm?: boolean;
  windowStart?: Date | null;
  periodId?: string | null;
  lockedDateStrings?: string[];
}) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string>("");
  const [selectedEntryIdForEdit, setSelectedEntryIdForEdit] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

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
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground mt-1">
          {showAddForm && !periodId ? "Current period: " : "Period: "}
          {formatPayPeriodLabel(currentPeriod.start, currentPeriod.end)}
          {currentPeriod.isLocked && " (locked)"}
        </p>
        {!showAddForm && periodId && (
          <Link href="/timesheet" className="mt-2 inline-block">
            <Button variant="outline" size="sm">
              Back to current period
            </Button>
          </Link>
        )}
      </div>

      {windowStartProp && showAddForm && (
        <>
          <div className="flex border-b flex-shrink-0 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "calendar"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar view
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "list"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              List view
            </button>
          </div>
          <div className="flex-1 min-h-0 border rounded-lg mt-0 flex flex-col mt-2">
            {activeTab === "calendar" && (
              <>
                <div className="flex-1 min-h-[50vh] flex flex-col p-4 overflow-hidden">
                  <TwoWeekCalendar
                    windowStart={windowStartProp}
                    entries={calendarEntries}
                    periodLocked={currentPeriod.isLocked}
                    lockedDateStrings={lockedDateStrings}
                    onPrev={handleCalendarPrev}
                    onNext={handleCalendarNext}
                    onAddDate={(date) => {
                      setAddModalDate(date);
                      setAddModalOpen(true);
                    }}
                    onEditEntry={(entry) => {
                      setSelectedEntryIdForEdit(entry.id);
                      setActiveTab("list");
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-sm p-4 pt-0 border-t flex-shrink-0">
                  Click a day to add an entry; click an entry to edit.
                </p>
              </>
            )}
            {activeTab === "list" && (
              <div className="flex-1 min-h-[50vh] overflow-auto">
                <EntryTable
                  entries={entries}
                  periodLocked={currentPeriod.isLocked}
                  onUpdate={refresh}
                  initialEditEntryId={selectedEntryIdForEdit}
                  onClearEditId={() => setSelectedEntryIdForEdit(null)}
                />
              </div>
            )}
          </div>
        </>
      )}

      {(!windowStartProp || !showAddForm) && (
        <div className="flex-1 min-h-0 mt-4">
          <EntryTable
            entries={entries}
            periodLocked={currentPeriod.isLocked}
            onUpdate={refresh}
            initialEditEntryId={selectedEntryIdForEdit}
            onClearEditId={() => setSelectedEntryIdForEdit(null)}
          />
        </div>
      )}

      {addModalOpen && (
        <>
          <DialogOverlay onClick={() => setAddModalOpen(false)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add entry</DialogTitle>
              <div className="flex justify-between items-center">

              <DialogDescription>
                Add a timesheet entry for the selected date.
              </DialogDescription>
              <AddEntryMoreInfo />
              </div>
            </DialogHeader>
            <DailyEntryForm
              defaultDate={addModalDate}
              disabled={currentPeriod.isLocked}
              onSuccess={() => {
                setAddModalOpen(false);
                refresh();
              }}
              embedded
              onCancel={() => setAddModalOpen(false)}
            />
          </DialogContent>
        </>
      )}
    </div>
  );
}

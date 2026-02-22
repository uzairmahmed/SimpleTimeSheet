"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyEntryForm } from "./DailyEntryForm";
import { EntryTable } from "./EntryTable";
import { Button } from "@/components/ui/button";
import { formatPayPeriodLabel } from "@/lib/pay-period";

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
}: {
  entries: Entry[];
  currentPeriod: { start: Date; end: Date; isLocked: boolean };
  periodHistory: PayPeriodRow[];
  showAddForm?: boolean;
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

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

      {showAddForm && (
        <DailyEntryForm
          disabled={currentPeriod.isLocked}
          onSuccess={refresh}
        />
      )}

      <EntryTable
        entries={entries}
        periodLocked={currentPeriod.isLocked}
        onUpdate={refresh}
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

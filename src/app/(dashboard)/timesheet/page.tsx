import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPayPeriodRange,
} from "@/lib/timesheetCalc";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EntryFormDialog } from "./_components/EntryFormDialog";
import { PeriodNav } from "./_components/PeriodNav";
import { TimesheetTabs } from "./_components/TimesheetTabs";

type SearchParams = { period?: string };

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;

  // ─── Determine active period ──────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const currentRange = getPayPeriodRange(today);

  const periodStart = searchParams.period ?? currentRange.start;
  const periodEnd = (() => {
    const d = new Date(periodStart + "T12:00:00");
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  // ─── Fetch entries for this period ────────────────────────────────────────
  const [entries, payPeriod, user, allEntries] = await Promise.all([
    prisma.timesheetEntry.findMany({
      where: {
        userId,
        date: { gte: periodStart, lte: periodEnd },
      },
      orderBy: { date: "asc" },
    }),
    prisma.payPeriod.findUnique({
      where: { startDate_endDate: { startDate: periodStart, endDate: periodEnd } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { wageRate: true },
    }),
    // Fetch all dates with entries to build period list
    prisma.timesheetEntry.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const isLocked = payPeriod?.isLocked ?? false;
  const wageRate = Number(user?.wageRate ?? 0);

  // ─── Build period navigation list ─────────────────────────────────────────
  const periodSet = new Map<string, string>();
  // Always include current period
  periodSet.set(currentRange.start, currentRange.end);
  // Add periods from existing entries
  for (const { date } of allEntries) {
    const r = getPayPeriodRange(new Date(date + "T12:00:00"));
    periodSet.set(r.start, r.end);
  }
  // Always include the currently viewed period
  periodSet.set(periodStart, periodEnd);

  const periods = Array.from(periodSet.entries())
    .map(([start, end]) => ({ start, end }))
    .sort((a, b) => b.start.localeCompare(a.start));

  // ─── Serialize entries (Decimal → number) ─────────────────────────────────
  const serializedEntries = entries.map((e) => ({
    ...e,
    paidHours: Number(e.paidHours),
  }));

  const totalPaidHours = serializedEntries.reduce(
    (sum, e) => sum + e.paidHours,
    0
  );

  const isCurrentPeriod = periodStart === currentRange.start;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {session.user.name}
        </p>
      </div>

      {/* Period navigation + status + add button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <PeriodNav periods={periods} currentStart={periodStart} />
        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge variant="destructive" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
          {isCurrentPeriod && !isLocked && (
            <Badge variant="secondary">Current Period</Badge>
          )}
        </div>
        <div className="sm:ml-auto">
          {!isLocked && isCurrentPeriod && (
            <EntryFormDialog mode="add" currentPeriodStart={periodStart} />
          )}
        </div>
      </div>

      {/* Tabs: Calendar + List */}
      <TimesheetTabs
        entries={serializedEntries}
        periodStart={periodStart}
        periodEnd={periodEnd}
        isLocked={isLocked}
        today={todayStr}
        totalPaidHours={totalPaidHours}
        wageRate={wageRate}
      />
    </div>
  );
}

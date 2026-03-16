import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatHours } from "@/lib/timesheetCalc";
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
  const today = new Date().toISOString().slice(0, 10);

  // ─── Fetch all pay periods from DB ───────────────────────────────────────────
  const allPeriods = await prisma.payPeriod.findMany({
    orderBy: { startDate: "desc" },
  });

  // Current period = the one that contains today
  const currentPeriod = allPeriods.find(
    (p) => p.startDate <= today && p.endDate >= today
  );

  // Period being viewed
  const periodStart = searchParams.period ?? currentPeriod?.startDate ?? today;
  const viewedPeriod = allPeriods.find((p) => p.startDate === periodStart);
  const periodEnd = viewedPeriod?.endDate ?? periodStart;
  const isLocked = viewedPeriod?.isLocked ?? false;
  const isCurrentPeriod = viewedPeriod?.id === currentPeriod?.id;

  // ─── Fetch entries for this period ───────────────────────────────────────────
  const [entries, user] = await Promise.all([
    prisma.timesheetEntry.findMany({
      where: { userId, date: { gte: periodStart, lte: periodEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { wageRate: true },
    }),
  ]);

  const wageRate = Number(user?.wageRate ?? 0);

  const serializedEntries = entries.map((e) => ({
    ...e,
    paidHours: Number(e.paidHours),
  }));

  const totalPaidHours = serializedEntries.reduce((sum, e) => sum + e.paidHours, 0);

  // Periods list for nav (all DB periods, sorted desc — newest first)
  const periods = allPeriods.map((p) => ({
    start: p.startDate,
    end: p.endDate,
    isLocked: p.isLocked,
  }));

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{session.user.name}</p>
      </div>

      {/* Period navigation + status + add button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <PeriodNav
          periods={periods}
          currentStart={periodStart}
          isLocked={isLocked}
        />
        <div className="flex items-center gap-2">
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

      {/* No period state */}
      {!viewedPeriod && (
        <p className="text-sm text-muted-foreground border rounded-md p-4">
          No pay period found for this date. Ask your administrator to create one.
        </p>
      )}

      {/* Tabs: Calendar + List */}
      {viewedPeriod && (
        <TimesheetTabs
          entries={serializedEntries}
          periodStart={periodStart}
          periodEnd={periodEnd}
          isLocked={isLocked}
          today={today}
          totalPaidHours={totalPaidHours}
          wageRate={wageRate}
        />
      )}
    </div>
  );
}

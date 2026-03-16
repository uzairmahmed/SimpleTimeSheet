import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const entries = await prisma.timesheetEntry.findMany({
    where: { userId, date: { gte: periodStart, lte: periodEnd } },
    orderBy: { date: "asc" },
  });

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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{session.user.name}</p>
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
          periods={periods}
          currentStart={periodStart}
          isCurrentPeriod={isCurrentPeriod}
        />
      )}
    </div>
  );
}

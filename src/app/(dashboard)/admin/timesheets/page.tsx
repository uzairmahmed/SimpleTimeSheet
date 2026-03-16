import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPeriodLabel, formatHours } from "@/lib/timesheetCalc";
import { AdminTimesheetTabs } from "./_components/AdminTimesheetTabs";

type SearchParams = { employee?: string; period?: string };

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  const today = new Date().toISOString().slice(0, 10);

  // ─── All pay periods from DB ──────────────────────────────────────────────
  const allPeriods = await prisma.payPeriod.findMany({
    orderBy: { startDate: "desc" },
  });

  const currentPeriod = allPeriods.find(
    (p) => p.startDate <= today && p.endDate >= today
  );

  const periods = allPeriods.map((p) => ({ start: p.startDate, end: p.endDate, isLocked: p.isLocked }));

  const periodStart = searchParams.period ?? currentPeriod?.startDate ?? today;
  const viewedPeriod = allPeriods.find((p) => p.startDate === periodStart);
  const periodEnd = viewedPeriod?.endDate ?? periodStart;
  const isLocked = viewedPeriod?.isLocked ?? false;

  const periodLabel = viewedPeriod
    ? formatPeriodLabel(periodStart, periodEnd)
    : periodStart;

  // ─── Employees ────────────────────────────────────────────────────────────
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const employeeId = searchParams.employee;

  // ─── Entries ──────────────────────────────────────────────────────────────
  const rawEntries = await prisma.timesheetEntry.findMany({
    where: {
      date: { gte: periodStart, lte: periodEnd },
      ...(employeeId ? { userId: employeeId } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: [{ date: "asc" }, { user: { name: "asc" } }],
  });

  const entries = rawEntries.map((e) => ({
    ...e,
    paidHours: Number(e.paidHours),
  }));

  const totalPaidHours = entries.reduce((sum, e) => sum + e.paidHours, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          View and adjust entries for any employee.
        </p>
      </div>

      {/* Tabs */}
      <Suspense>
        <AdminTimesheetTabs
          entries={entries}
          periodStart={periodStart}
          periodEnd={periodEnd}
          isLocked={isLocked}
          totalPaidHours={totalPaidHours}
          today={today}
          employees={employees}
          periods={periods}
          currentStart={periodStart}
        />
      </Suspense>

      <p className="text-xs text-muted-foreground">
        Period: {periodLabel} · Total: {formatHours(totalPaidHours)}
      </p>
    </div>
  );
}

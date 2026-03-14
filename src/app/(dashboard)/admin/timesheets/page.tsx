import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPayPeriodRange,
  formatPeriodLabel,
  formatHours,
} from "@/lib/timesheetCalc";
import { Badge } from "@/components/ui/badge";
import { EmployeeFilter, PeriodFilter } from "./_components/EmployeeFilter";
import { AdminAddEntryDialog } from "./_components/AdminEntryFormDialog";
import { AdminTimesheetTabs } from "./_components/AdminTimesheetTabs";

type SearchParams = { employee?: string; period?: string };

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  // ─── Compute available periods ─────────────────────────────────────────────
  const currentRange = getPayPeriodRange(new Date());

  const allDates = await prisma.timesheetEntry.findMany({
    select: { date: true },
    distinct: ["date"],
  });

  const periodMap = new Map<string, string>();
  periodMap.set(currentRange.start, currentRange.end);
  for (const { date } of allDates) {
    const r = getPayPeriodRange(new Date(date + "T12:00:00"));
    periodMap.set(r.start, r.end);
  }
  const periods = Array.from(periodMap.entries())
    .map(([start, end]) => ({ start, end }))
    .sort((a, b) => b.start.localeCompare(a.start));

  const periodStart = searchParams.period ?? currentRange.start;
  const periodEnd = (() => {
    const d = new Date(periodStart + "T12:00:00");
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  // ─── Fetch employees ───────────────────────────────────────────────────────
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const employeeId = searchParams.employee;

  // ─── Fetch entries ─────────────────────────────────────────────────────────
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

  const payPeriod = await prisma.payPeriod.findUnique({
    where: { startDate_endDate: { startDate: periodStart, endDate: periodEnd } },
  });
  const isLocked = payPeriod?.isLocked ?? false;

  const totalPaidHours = entries.reduce((sum, e) => sum + e.paidHours, 0);
  const periodLabel = formatPeriodLabel(periodStart, periodEnd);

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          View and adjust entries for any employee.
        </p>
      </div>

      {/* Filters + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
        <Suspense>
          <EmployeeFilter employees={employees} />
          <PeriodFilter periods={periods} />
        </Suspense>
        <div className="flex items-center gap-2 sm:ml-auto">
          {isLocked && (
            <Badge variant="destructive" className="gap-1">
              Locked
            </Badge>
          )}
          {!isLocked && <AdminAddEntryDialog employees={employees} />}
        </div>
      </div>

      {/* Calendar + List tabs */}
      <AdminTimesheetTabs
        entries={entries}
        periodStart={periodStart}
        isLocked={isLocked}
        totalPaidHours={totalPaidHours}
      />

      <p className="text-xs text-muted-foreground">Period: {periodLabel} · Total: {formatHours(totalPaidHours)}</p>
    </div>
  );
}

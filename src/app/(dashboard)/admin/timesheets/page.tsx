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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeeFilter, PeriodFilter } from "./_components/EmployeeFilter";
import { AdminAddEntryDialog, AdminEditEntryDialog } from "./_components/AdminEntryFormDialog";
import { AdminDeleteEntryButton } from "./_components/AdminDeleteEntryButton";

type SearchParams = { employee?: string; period?: string };

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function dayLabel(d: string) {
  return DAY[new Date(d + "T12:00:00").getDay()];
}
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

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
  const entries = await prisma.timesheetEntry.findMany({
    where: {
      date: { gte: periodStart, lte: periodEnd },
      ...(employeeId ? { userId: employeeId } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: [{ date: "asc" }, { user: { name: "asc" } }],
  });

  const payPeriod = await prisma.payPeriod.findUnique({
    where: { startDate_endDate: { startDate: periodStart, endDate: periodEnd } },
  });
  const isLocked = payPeriod?.isLocked ?? false;

  const totalPaidHours = entries.reduce((sum, e) => sum + Number(e.paidHours), 0);
  const periodLabel = formatPeriodLabel(periodStart, periodEnd);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          View and adjust entries for any employee.
        </p>
      </div>

      {/* Filters + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
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

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Day</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-center">Break</TableHead>
              <TableHead className="text-right">Paid Hrs</TableHead>
              {!isLocked && <TableHead className="w-[80px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isLocked ? 7 : 8}
                  className="text-center text-muted-foreground py-10"
                >
                  No entries found for this period
                  {employeeId ? " and employee" : ""}.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground">{dayLabel(e.date)}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell className="font-medium">{e.user.name}</TableCell>
                  <TableCell>{fmtTime(e.startTime)}</TableCell>
                  <TableCell>{fmtTime(e.endTime)}</TableCell>
                  <TableCell className="text-center">
                    {e.breakMinutes > 0 ? (
                      <Badge variant="secondary" className="text-xs">30 min</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatHours(Number(e.paidHours))}
                  </TableCell>
                  {!isLocked && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <AdminEditEntryDialog
                          entry={{
                            id: e.id,
                            employeeName: e.user.name,
                            date: e.date,
                            startTime: e.startTime,
                            endTime: e.endTime,
                            paidHours: Number(e.paidHours),
                          }}
                        />
                        <AdminDeleteEntryButton id={e.id} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
          {entries.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={isLocked ? 6 : 7} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatHours(totalPaidHours)}
                </TableCell>
                {!isLocked && <TableCell />}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">Period: {periodLabel}</p>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPeriodRange, formatPeriodLabel, formatHours } from "@/lib/timesheetCalc";
import { Users, ClipboardList, CalendarDays, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  const { start, end } = getPayPeriodRange(new Date());
  const currentPeriodLabel = formatPeriodLabel(start, end);

  const [employeeCount, entryCount, periodCount, currentPeriod] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.timesheetEntry.count(),
    prisma.payPeriod.count(),
    prisma.payPeriod.findUnique({
      where: { startDate_endDate: { startDate: start, endDate: end } },
    }),
  ]);

  // ─── Pay Period Summary ────────────────────────────────────────────────────
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true, wageRate: true },
    orderBy: { name: "asc" },
  });

  const periodEntries = await prisma.timesheetEntry.findMany({
    where: { date: { gte: start, lte: end } },
    select: { userId: true, paidHours: true },
  });

  // Build per-employee summary
  const hoursMap = new Map<string, number>();
  for (const e of periodEntries) {
    hoursMap.set(e.userId, (hoursMap.get(e.userId) ?? 0) + Number(e.paidHours));
  }

  const summaryRows = employees
    .map((emp) => {
      const hours = hoursMap.get(emp.id) ?? 0;
      const wage = Number(emp.wageRate);
      return { name: emp.name, hours, wage, pay: hours * wage };
    })
    .filter((r) => r.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  const totalHours = summaryRows.reduce((s, r) => s + r.hours, 0);
  const totalPay = summaryRows.reduce((s, r) => s + r.pay, 0);

  const sections = [
    {
      href: "/admin/employees",
      icon: Users,
      title: "Employees",
      description: "Manage staff accounts, roles, and wages.",
      stat: employeeCount,
      statLabel: `employee${employeeCount !== 1 ? "s" : ""}`,
    },
    {
      href: "/admin/timesheets",
      icon: ClipboardList,
      title: "Timesheets",
      description: "View and adjust entries for any employee.",
      stat: entryCount,
      statLabel: `entr${entryCount !== 1 ? "ies" : "y"}`,
    },
    {
      href: "/admin/pay-periods",
      icon: CalendarDays,
      title: "Pay Periods",
      description: "Lock and manage payroll periods.",
      stat: periodCount,
      statLabel: `period${periodCount !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-muted-foreground text-sm">
            Current period:{" "}
            <span className="font-medium text-foreground">{currentPeriodLabel}</span>
          </p>
          {currentPeriod?.isLocked && (
            <Badge variant="destructive" className="text-xs">Locked</Badge>
          )}
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {sections.map(({ href, icon: Icon, title, description, stat, statLabel }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stat}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{statLabel}</span>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pay Period Summary */}
      <div>
        <h2 className="text-base font-semibold mb-2">Pay Period Summary</h2>
        {summaryRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No entries logged for the current period.
          </p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatHours(row.hours)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${row.wage.toFixed(2)}/h
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      ${row.pay.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatHours(totalHours)}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right font-mono font-bold">
                    ${totalPay.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

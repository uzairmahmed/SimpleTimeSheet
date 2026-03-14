import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPeriodRange, formatPeriodLabel } from "@/lib/timesheetCalc";
import { Users, ClipboardList, CalendarDays, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  const [employeeCount, entryCount, periodCount] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.timesheetEntry.count(),
    prisma.payPeriod.count(),
  ]);

  const { start, end } = getPayPeriodRange(new Date());
  const currentPeriodLabel = formatPeriodLabel(start, end);
  const currentPeriod = await prisma.payPeriod.findUnique({
    where: { startDate_endDate: { startDate: start, endDate: end } },
  });

  const sections = [
    {
      href: "/admin/employees",
      icon: Users,
      title: "Employees",
      description: "Manage staff accounts, roles, and wages.",
      stat: employeeCount,
      statLabel: `employee${employeeCount !== 1 ? "s" : ""}`,
      ready: true,
    },
    {
      href: "/admin/timesheets",
      icon: ClipboardList,
      title: "Timesheets",
      description: "View and adjust entries for any employee.",
      stat: entryCount,
      statLabel: `entr${entryCount !== 1 ? "ies" : "y"}`,
      ready: false,
    },
    {
      href: "/admin/pay-periods",
      icon: CalendarDays,
      title: "Pay Periods",
      description: "Lock and manage payroll periods.",
      stat: periodCount,
      statLabel: `period${periodCount !== 1 ? "s" : ""}`,
      ready: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
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

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ href, icon: Icon, title, description, stat, statLabel, ready }) => (
          <Link
            key={href}
            href={ready ? href : "#"}
            className={`rounded-xl border bg-card shadow-sm transition-shadow ${
              ready ? "hover:shadow-md" : "opacity-60 cursor-not-allowed pointer-events-none"
            }`}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {ready ? (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Badge variant="outline" className="text-xs">Phase 5</Badge>
                  )}
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
    </div>
  );
}

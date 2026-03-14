import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPayPeriodRange,
  formatPeriodLabel,
} from "@/lib/timesheetCalc";
import { Clock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function KioskHome() {
  const session = await getServerSession(authOptions);

  // Authenticated users go straight to their area
  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    redirect("/timesheet");
  }

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });

  const { start, end } = getPayPeriodRange(new Date());
  const periodLabel = formatPeriodLabel(start, end);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Smiline Timesheet</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin Sign In
          </Link>
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-10 gap-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Who are you?</h1>
          <p className="text-muted-foreground text-sm">
            Tap your name to log your hours.
          </p>
          <Badge variant="secondary" className="mt-2">
            Current period: {periodLabel}
          </Badge>
        </div>

        <Separator className="max-w-sm w-full" />

        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No employees yet — an admin must add them first.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/login?username=${encodeURIComponent(emp.username)}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md active:scale-95"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {emp.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

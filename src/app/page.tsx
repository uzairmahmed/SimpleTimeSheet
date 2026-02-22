import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEmployeeNames } from "@/app/actions/employees";
import { getPayPeriodBoundsForDate, formatPayPeriodLabel } from "@/lib/pay-period";
import { LayoutDashboard, FileText } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }
  if (session?.user?.role === "EMPLOYEE") {
    redirect("/timesheet");
  }

  const employees = await getEmployeeNames();
  const periodBounds = getPayPeriodBoundsForDate(new Date());
  const currentPeriodLabel = formatPayPeriodLabel(periodBounds.start, periodBounds.end);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Clinic Timesheet</h1>
        <p className="text-muted-foreground">
          Sign in to view your timesheet or access the admin dashboard.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            Click your name to sign in and view your timesheet. Current pay period:{" "}
            <span className="font-medium text-foreground">{currentPeriodLabel}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees listed yet.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((emp) => (
                <li key={emp.id}>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent("/timesheet")}`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    {emp.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 pt-4 border-t sm:flex-row sm:items-center">
            <Link href="/login?callbackUrl=/timesheet" className="sm:mr-4">
              <Button variant="default">Sign in (Timesheet)</Button>
            </Link>
            <Link href="/login?callbackUrl=/admin">
              <Button variant="outline" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

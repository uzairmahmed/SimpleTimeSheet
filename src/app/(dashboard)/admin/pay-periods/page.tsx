import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPeriodLabel, formatHours } from "@/lib/timesheetCalc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { LockToggleButton } from "./_components/LockToggleButton";
import { CreatePeriodDialog } from "./_components/CreatePeriodDialog";
import { DeletePeriodDialog } from "./_components/DeletePeriodDialog";

export default async function PayPeriodsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  const today = new Date().toISOString().slice(0, 10);

  // Fetch all periods with entry stats
  const periods = await prisma.payPeriod.findMany({
    orderBy: { startDate: "desc" },
  });

  const periodStats = await Promise.all(
    periods.map(async (p) => {
      const entries = await prisma.timesheetEntry.findMany({
        where: { date: { gte: p.startDate, lte: p.endDate } },
        select: { paidHours: true, userId: true },
      });
      const totalHours = entries.reduce((sum, e) => sum + Number(e.paidHours), 0);
      const uniqueEmployees = new Set(entries.map((e) => e.userId)).size;
      return { ...p, entryCount: entries.length, totalHours, uniqueEmployees };
    })
  );

  // Determine suggested start for new period (day after last period ends)
  const lastPeriodEnd = periods[0]?.endDate;

  // Find the period that contains today (for "Current" badge)
  const currentPeriodId = periods.find(
    (p) => p.startDate <= today && p.endDate >= today
  )?.id;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pay Periods</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Lock periods to prevent edits and export payroll reports.
          </p>
        </div>
        <CreatePeriodDialog lastPeriodEnd={lastPeriodEnd} />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Employees</TableHead>
              <TableHead className="text-center">Entries</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No pay periods yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              periodStats.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {formatPeriodLabel(p.startDate, p.endDate)}
                    {p.id === currentPeriodId && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Current
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {p.uniqueEmployees}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {p.entryCount}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatHours(p.totalHours)}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.isLocked ? (
                      <Badge variant="destructive" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    ) : (
                      <Badge variant="outline">Open</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/api/admin/export?period=${p.startDate}`} target="_blank">
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Export
                        </Link>
                      </Button>
                      <LockToggleButton id={p.id} isLocked={p.isLocked} />
                      <DeletePeriodDialog
                        id={p.id}
                        label={formatPeriodLabel(p.startDate, p.endDate)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Pay periods are created manually. Locked periods require admin adjustment for any changes.
      </p>
    </div>
  );
}

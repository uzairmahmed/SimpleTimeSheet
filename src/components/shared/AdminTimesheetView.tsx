"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateEntryPaidHoursAdmin,
  setPayPeriodLock,
  getPayrollReport,
  ensurePayPeriodsGenerated,
} from "@/app/actions/admin-timesheet";
import { formatPayPeriodLabel } from "@/lib/pay-period";

type EmployeeOpt = { id: string; name: string };
type PeriodOpt = { id: string; startDate: Date; endDate: Date; isLocked: boolean };
type Entry = {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number | { toString(): string };
  user: { id: string; name: string };
  payPeriod: { isLocked: boolean } | null;
};

function paidNum(v: number | { toString(): string }): number {
  return typeof v === "number" ? v : Number(v.toString());
}

export function AdminTimesheetView({
  employees,
  periods,
  entries,
  filterEmployeeId,
  filterPeriodId,
}: {
  employees: EmployeeOpt[];
  periods: PeriodOpt[];
  entries: Entry[];
  filterEmployeeId?: string;
  filterPeriodId?: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingPaid, setEditingPaid] = useState<string | null>(null);
  const [paidValue, setPaidValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePeriods() {
    setError(null);
    setGenerating(true);
    const res = await ensurePayPeriodsGenerated(12);
    setGenerating(false);
    if (res.success) router.refresh();
    else setError(res.error);
  }

  async function handleLock(periodId: string, isLocked: boolean) {
    setError(null);
    const res = await setPayPeriodLock(periodId, isLocked);
    if (res.success) router.refresh();
    else setError(res.error);
  }

  async function handleSavePaidHours(entryId: string) {
    const n = parseFloat(paidValue);
    if (Number.isNaN(n) || n < 0) {
      setError("Enter a valid number.");
      return;
    }
    setError(null);
    const res = await updateEntryPaidHoursAdmin(entryId, n);
    if (res.success) {
      setEditingPaid(null);
      router.refresh();
    } else setError(res.error);
  }

  async function handleExportCsv() {
    const periodId = filterPeriodId || periods[0]?.id;
    if (!periodId) {
      setError("Select a period to export.");
      return;
    }
    setError(null);
    setExporting(true);
    const rows = await getPayrollReport(periodId);
    setExporting(false);
    const headers = ["Employee Name", "Total Paid Hours", "Wage", "Total Pay"];
    const lines = [headers.join(","), ...rows.map((r) => [r.employeeName, r.totalPaidHours, r.wage, r.totalPay].join(","))];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${periodId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Timesheet & Payroll</h1>
        <p className="text-muted-foreground">
          Consolidated view, pay period management, and CSV export.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter entries by employee and/or pay period.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Employee</label>
              <select
                name="employeeId"
                defaultValue={filterEmployeeId ?? ""}
                className="flex h-10 w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Pay period</label>
              <select
                name="periodId"
                defaultValue={filterPeriodId ?? ""}
                className="flex h-10 w-full min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All periods</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatPayPeriodLabel(p.startDate, p.endDate)} {p.isLocked ? "(locked)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {/* Pay period management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pay periods</CardTitle>
              <CardDescription>Generate Sun–Sat periods and lock/unlock for payroll.</CardDescription>
            </div>
            <Button onClick={handleGeneratePeriods} disabled={generating}>
              {generating ? "Generating…" : "Generate next 12 weeks"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-2">{error}</p>}
          {periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No periods yet. Click &quot;Generate next 12 weeks&quot;.</p>
          ) : (
            <ul className="space-y-2">
              {periods.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-1 border-b">
                  <span className="flex-1 text-sm">
                    {formatPayPeriodLabel(p.startDate, p.endDate)}
                    {p.isLocked ? " (locked)" : ""}
                  </span>
                  <Button
                    variant={p.isLocked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLock(p.id, !p.isLocked)}
                  >
                    {p.isLocked ? "Unlock" : "Lock"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Consolidated entries */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Entries</CardTitle>
              <CardDescription>Click paid hours to override (admin).</CardDescription>
            </div>
            <Button onClick={handleExportCsv} disabled={exporting || periods.length === 0}>
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries match the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Employee</th>
                    <th className="p-2 text-left font-medium">Date</th>
                    <th className="p-2 text-left font-medium">Start</th>
                    <th className="p-2 text-left font-medium">End</th>
                    <th className="p-2 text-left font-medium">Break</th>
                    <th className="p-2 text-right font-medium">Paid hours</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="p-2">{entry.user.name}</td>
                      <td className="p-2">
                        {new Date(entry.date).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-2">{entry.startTime}</td>
                      <td className="p-2">{entry.endTime}</td>
                      <td className="p-2">{entry.breakMinutes ? "30 min" : "—"}</td>
                      <td className="p-2 text-right">
                        {editingPaid === entry.id ? (
                          <div className="flex gap-1 justify-end">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-20 h-8 text-right"
                              value={paidValue}
                              onChange={(e) => setPaidValue(e.target.value)}
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleSavePaidHours(entry.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingPaid(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => {
                              setEditingPaid(entry.id);
                              setPaidValue(String(paidNum(entry.paidHours)));
                            }}
                          >
                            {paidNum(entry.paidHours)} h
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

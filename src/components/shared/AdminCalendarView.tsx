"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TwoWeekCalendar, type CalendarEntry } from "./TwoWeekCalendar";
import { toDateOnly, shiftTwoWeekWindow } from "@/lib/pay-period";

type EmployeeOpt = { id: string; name: string };
type Entry = {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  paidHours: number | { toString(): string };
  user: { id: string; name: string };
};

function paidNum(v: number | { toString(): string }): number {
  return typeof v === "number" ? v : Number(v.toString());
}

export function AdminCalendarView({
  employees,
  entries,
  windowStart,
  filterEmployeeId,
}: {
  employees: EmployeeOpt[];
  entries: Entry[];
  windowStart: Date;
  filterEmployeeId?: string;
}) {
  const router = useRouter();

  const calendarEntries: CalendarEntry[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    paidHours: e.paidHours,
  }));

  function navigateWindow(delta: number) {
    const nextStart = shiftTwoWeekWindow(windowStart, delta);
    const params = new URLSearchParams();
    params.set("window", toDateOnly(nextStart));
    if (filterEmployeeId) params.set("employeeId", filterEmployeeId);
    router.push(`/admin/calendar?${params.toString()}`);
  }

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(windowStart);
    d.setDate(windowStart.getDate() + i);
    days.push(d);
  }

  const entriesByUserAndDate = new Map<string, Map<string, number>>();
  for (const e of entries) {
    const uid = e.user.id;
    if (!entriesByUserAndDate.has(uid)) entriesByUserAndDate.set(uid, new Map());
    const dateStr = toDateOnly(new Date(e.date));
    const prev = entriesByUserAndDate.get(uid)!.get(dateStr) ?? 0;
    entriesByUserAndDate.get(uid)!.set(dateStr, prev + paidNum(e.paidHours));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Global calendar</h1>
        <p className="text-muted-foreground">
          View 2-week spread by employee or consolidated.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Select an employee for single view, or leave empty for consolidated.
              </CardDescription>
            </div>
            <form method="get" className="flex gap-2 items-center">
              <input type="hidden" name="window" value={toDateOnly(windowStart)} />
              <select
                name="employeeId"
                defaultValue={filterEmployeeId ?? ""}
                className="flex h-10 min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => e.currentTarget.form?.submit()}
              >
                <option value="">All (consolidated)</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">Apply</Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {filterEmployeeId ? (
        <Card>
          <CardHeader>
            <CardTitle>2-week calendar</CardTitle>
            <CardDescription>
              Single employee view. Navigate with arrows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoWeekCalendar
              windowStart={windowStart}
              entries={calendarEntries}
              periodLocked={false}
              onPrev={() => navigateWindow(-1)}
              onNext={() => navigateWindow(1)}
              onAddDate={() => {}}
              onEditEntry={() => {}}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Add/edit is available on the employee&apos;s own timesheet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Consolidated view</CardTitle>
                <CardDescription>
                  One row per employee; each cell = total paid hours for that day.
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateWindow(-1)}>
                  ← Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWindow(1)}>
                  Next →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium w-40">Employee</th>
                    {days.map((d) => (
                      <th key={d.toISOString()} className="p-1 text-center font-medium w-12">
                        {d.getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const dayHours = entriesByUserAndDate.get(emp.id);
                    return (
                      <tr key={emp.id} className="border-b">
                        <td className="p-2 font-medium">{emp.name}</td>
                        {days.map((d) => {
                          const dateStr = toDateOnly(d);
                          const hours = dayHours?.get(dateStr) ?? 0;
                          return (
                            <td key={dateStr} className="p-1 text-center text-muted-foreground">
                              {hours > 0 ? `${hours}` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

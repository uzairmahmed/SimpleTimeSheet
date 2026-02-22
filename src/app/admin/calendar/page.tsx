import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTwoWeekWindow } from "@/lib/pay-period";
import {
  getEmployeeOptions,
  getConsolidatedEntriesByRange,
} from "@/app/actions/admin-timesheet";
import { AdminCalendarView } from "@/components/shared/AdminCalendarView";

type Props = { searchParams: { window?: string; employeeId?: string } };

export default async function AdminCalendarPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/unauthorized");

  const windowParam = searchParams.window;
  const employeeId = searchParams.employeeId;

  const twoWeek = getTwoWeekWindow(new Date());
  const windowStart = windowParam
    ? (() => {
        const d = new Date(windowParam);
        return isNaN(d.getTime()) ? twoWeek.start : d;
      })()
    : twoWeek.start;
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowStart.getDate() + 13);
  windowEnd.setHours(23, 59, 59, 999);

  const [employees, entries] = await Promise.all([
    getEmployeeOptions(),
    getConsolidatedEntriesByRange(windowStart, windowEnd, employeeId || undefined),
  ]);

  return (
    <AdminCalendarView
      employees={employees}
      entries={entries}
      windowStart={windowStart}
      filterEmployeeId={employeeId}
    />
  );
}

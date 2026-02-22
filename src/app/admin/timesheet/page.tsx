import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getEmployeeOptions,
  getPayPeriodOptions,
  getConsolidatedEntries,
  ensurePayPeriodsGenerated,
} from "@/app/actions/admin-timesheet";
import { AdminTimesheetView } from "@/components/shared/AdminTimesheetView";

type Props = { searchParams: { employeeId?: string; periodId?: string } };

export default async function AdminTimesheetPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/unauthorized");

  const [employees, periods, entries] = await Promise.all([
    getEmployeeOptions(),
    getPayPeriodOptions(),
    getConsolidatedEntries(searchParams.employeeId, searchParams.periodId),
  ]);

  return (
    <AdminTimesheetView
      employees={employees}
      periods={periods}
      entries={entries}
      filterEmployeeId={searchParams.employeeId}
      filterPeriodId={searchParams.periodId}
    />
  );
}

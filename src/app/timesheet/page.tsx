import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TimesheetContent } from "@/components/shared/TimesheetContent";
import {
  getCurrentPayPeriod,
  getMyEntriesForPeriod,
  getPayPeriodHistory,
  getPayPeriodById,
} from "@/app/actions/timesheet";

type Props = {
  searchParams: { period?: string };
};

export default async function TimesheetPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/timesheet");
  }
  if (session.user.role !== "EMPLOYEE" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const periodId = searchParams.period;

  const current = await getCurrentPayPeriod();
  const periodHistory = await getPayPeriodHistory();

  let entries: Awaited<ReturnType<typeof getMyEntriesForPeriod>>;
  let currentPeriod: { start: Date; end: Date; isLocked: boolean };

  if (periodId) {
    const period = await getPayPeriodById(periodId);
    if (!period) {
      redirect("/timesheet");
    }
    currentPeriod = {
      start: period.startDate,
      end: period.endDate,
      isLocked: period.isLocked,
    };
    entries = await getMyEntriesForPeriod(period.startDate, period.endDate);
  } else {
    currentPeriod = {
      start: current.start,
      end: current.end,
      isLocked: current.isLocked,
    };
    entries = await getMyEntriesForPeriod(current.start, current.end);
  }

  const isCurrentPeriod =
    !periodId ||
    (current.start.getTime() === currentPeriod.start.getTime() &&
      current.end.getTime() === currentPeriod.end.getTime());

  return (
    <TimesheetContent
      entries={entries}
      currentPeriod={currentPeriod}
      periodHistory={periodHistory}
      showAddForm={isCurrentPeriod}
    />
  );
}

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
import { getTwoWeekWindow } from "@/lib/pay-period";

type Props = {
  searchParams: { period?: string; window?: string };
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
  const windowParam = searchParams.window;

  const current = await getCurrentPayPeriod();
  const periodHistory = await getPayPeriodHistory();

  let entries: Awaited<ReturnType<typeof getMyEntriesForPeriod>>;
  let currentPeriod: { start: Date; end: Date; isLocked: boolean };
  let windowStart: Date | null = null;

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
    const twoWeek = getTwoWeekWindow(new Date());
    windowStart = windowParam
      ? (() => {
          const d = new Date(windowParam);
          return isNaN(d.getTime()) ? twoWeek.start : d;
        })()
      : twoWeek.start;
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowStart.getDate() + 13);
    windowEnd.setHours(23, 59, 59, 999);
    currentPeriod = {
      start: current.start,
      end: current.end,
      isLocked: current.isLocked,
    };
    entries = await getMyEntriesForPeriod(windowStart, windowEnd);
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
      windowStart={windowStart}
    />
  );
}

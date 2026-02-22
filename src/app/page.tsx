import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEmployeeNames } from "@/app/actions/employees";
import { getPayPeriodBoundsForDate, formatPayPeriodLabel } from "@/lib/pay-period";
import { KioskLoginGrid } from "@/components/shared/KioskLoginGrid";

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
      <KioskLoginGrid
        employees={employees}
        currentPeriodLabel={currentPeriodLabel}
      />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPeriodRange, formatPeriodLabel } from "@/lib/timesheetCalc";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const periodStart = searchParams.get("period");

  if (!periodStart || !/^\d{4}-\d{2}-\d{2}$/.test(periodStart)) {
    return new NextResponse("Missing or invalid period parameter", { status: 400 });
  }

  // Compute period end (Saturday = Sunday + 6)
  const startDate = new Date(periodStart + "T12:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const periodEnd = endDate.toISOString().slice(0, 10);

  // Fetch all employees with their entries in this period
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      name: true,
      wageRate: true,
      entries: {
        where: { date: { gte: periodStart, lte: periodEnd } },
        select: { paidHours: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const periodLabel = formatPeriodLabel(periodStart, periodEnd);
  const safeLabel = periodLabel.replace(/[^a-zA-Z0-9 _-]/g, "").replace(/\s+/g, "_");

  // Build CSV rows
  const header = ["Employee Name", "Pay Period", "Total Paid Hours", "Hourly Wage", "Total Pay"];
  const rows = employees
    .filter((e) => e.entries.length > 0)
    .map((e) => {
      const totalHours = e.entries.reduce((sum, entry) => sum + Number(entry.paidHours), 0);
      const wage = Number(e.wageRate);
      const totalPay = totalHours * wage;
      return [
        `"${e.name.replace(/"/g, '""')}"`,
        `"${periodLabel}"`,
        totalHours.toFixed(2),
        wage.toFixed(2),
        totalPay.toFixed(2),
      ];
    });

  if (rows.length === 0) {
    rows.push(['"No entries this period"', `"${periodLabel}"`, "0.00", "0.00", "0.00"]);
  }

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payroll_${safeLabel}.csv"`,
    },
  });
}

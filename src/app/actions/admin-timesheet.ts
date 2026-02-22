"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPayPeriodBoundsForDate } from "@/lib/pay-period";
import { z } from "zod";

export type AdminTimesheetState = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

/** All employees (id, name) for filter dropdown */
export async function getEmployeeOptions() {
  if (!(await requireAdmin())) return [];
  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return users;
}

/** All pay periods for filter dropdown */
export async function getPayPeriodOptions() {
  if (!(await requireAdmin())) return [];
  const periods = await prisma.payPeriod.findMany({
    orderBy: { startDate: "desc" },
    take: 52,
  });
  return periods;
}

/** Consolidated entries: filter by employee and/or period. */
export async function getConsolidatedEntries(employeeId?: string, periodId?: string) {
  if (!(await requireAdmin())) return [];
  const where: { userId?: string; payPeriodId?: string } = {};
  if (employeeId) where.userId = employeeId;
  if (periodId) where.payPeriodId = periodId;
  const entries = await prisma.timesheetEntry.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: [{ user: { name: "asc" } }, { date: "asc" }],
    include: { user: { select: { id: true, name: true } }, payPeriod: true },
  });
  return entries;
}

const paidHoursSchema = z.coerce.number().min(0).max(24);

/** Admin override: set paid hours for an entry. */
export async function updateEntryPaidHoursAdmin(
  entryId: string,
  paidHours: number
): Promise<AdminTimesheetState> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized." };
  const parsed = paidHoursSchema.safeParse(paidHours);
  if (!parsed.success) return { success: false, error: "Invalid paid hours." };

  await prisma.timesheetEntry.update({
    where: { id: entryId },
    data: { paidHours: parsed.data },
  });
  revalidatePath("/admin/timesheet");
  return { success: true };
}

/** Ensure pay periods exist for the next N weeks (from today). */
export async function ensurePayPeriodsGenerated(weeksAhead: number = 12): Promise<AdminTimesheetState> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized." };
  const today = new Date();
  for (let w = 0; w < weeksAhead; w++) {
    const d = new Date(today);
    d.setDate(today.getDate() + w * 7);
    const { start, end } = getPayPeriodBoundsForDate(d);
    await prisma.payPeriod.upsert({
      where: {
        startDate_endDate: { startDate: start, endDate: end },
      },
      create: { startDate: start, endDate: end },
      update: {},
    });
  }
  revalidatePath("/admin/timesheet");
  revalidatePath("/admin");
  return { success: true };
}

/** Set lock state for a pay period. */
export async function setPayPeriodLock(
  periodId: string,
  isLocked: boolean
): Promise<AdminTimesheetState> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized." };
  await prisma.payPeriod.update({
    where: { id: periodId },
    data: { isLocked },
  });
  revalidatePath("/admin/timesheet");
  revalidatePath("/admin");
  return { success: true };
}

/** Payroll report for CSV: Employee Name, Total Paid Hours, Wage, Total Pay for a period. */
export async function getPayrollReport(periodId: string) {
  if (!(await requireAdmin())) return [];
  const period = await prisma.payPeriod.findUnique({
    where: { id: periodId },
    include: {
      timesheetEntries: {
        include: { user: { select: { id: true, name: true, wageRate: true } } },
      },
    },
  });
  if (!period) return [];

  const byUser = new Map<string, { name: string; wageRate: number; totalPaidHours: number }>();
  for (const e of period.timesheetEntries) {
    const u = e.user;
    const existing = byUser.get(u.id);
    const hours = Number(e.paidHours);
    if (existing) {
      existing.totalPaidHours += hours;
    } else {
      byUser.set(u.id, {
        name: u.name,
        wageRate: Number(u.wageRate),
        totalPaidHours: hours,
      });
    }
  }
  return Array.from(byUser.entries()).map(([userId, data]) => ({
    userId,
    employeeName: data.name,
    totalPaidHours: Math.round(data.totalPaidHours * 100) / 100,
    wage: data.wageRate,
    totalPay: Math.round(data.totalPaidHours * data.wageRate * 100) / 100,
  }));
}

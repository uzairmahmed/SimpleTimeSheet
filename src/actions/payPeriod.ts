"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPeriodRange } from "@/lib/timesheetCalc";
import type { ActionResponse } from "@/lib/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function togglePeriodLock(id: string): Promise<ActionResponse> {
  await requireAdmin();

  const period = await prisma.payPeriod.findUnique({ where: { id } });
  if (!period) return { success: false, message: "Pay period not found." };

  await prisma.payPeriod.update({
    where: { id },
    data: { isLocked: !period.isLocked },
  });

  revalidatePath("/admin/pay-periods");
  revalidatePath("/timesheet");
  return {
    success: true,
    message: period.isLocked ? "Period unlocked." : "Period locked.",
  };
}

/** Ensure a PayPeriod record exists for the week containing today. */
export async function ensureCurrentPeriod(): Promise<ActionResponse> {
  await requireAdmin();

  const { start, end } = getPayPeriodRange(new Date());

  await prisma.payPeriod.upsert({
    where: { startDate_endDate: { startDate: start, endDate: end } },
    update: {},
    create: { startDate: start, endDate: end, isLocked: false },
  });

  revalidatePath("/admin/pay-periods");
  return { success: true, message: "Current period ensured." };
}

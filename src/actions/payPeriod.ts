"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function deletePayPeriod(id: string): Promise<ActionResponse> {
  await requireAdmin();

  const period = await prisma.payPeriod.findUnique({ where: { id } });
  if (!period) return { success: false, message: "Pay period not found." };

  await prisma.payPeriod.delete({ where: { id } });

  revalidatePath("/admin/pay-periods");
  revalidatePath("/timesheet");
  return { success: true, message: "Pay period deleted." };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const createSchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .refine(
        (d) => new Date(d + "T12:00:00").getDay() === 0,
        "Start date must be a Sunday"
      ),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  })
  .refine((d) => d.endDate === addDays(d.startDate, 13), {
    message: "End date must be exactly 13 days after start (Saturday)",
    path: ["endDate"],
  });

export async function createPayPeriod(raw: unknown): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { startDate, endDate } = parsed.data;

  // Check 1: another period starts on the exact same date
  const sameStart = await prisma.payPeriod.findFirst({
    where: { startDate },
  });
  if (sameStart) {
    return {
      success: false,
      message: `A pay period already starts on ${startDate}.`,
    };
  }

  // Check 2: selected start date falls inside an existing period
  const engulfs = await prisma.payPeriod.findFirst({
    where: { startDate: { lte: startDate }, endDate: { gte: startDate } },
  });
  if (engulfs) {
    return {
      success: false,
      message: `${startDate} already falls within period ${engulfs.startDate} – ${engulfs.endDate}.`,
    };
  }

  // Check 3: new period would overlap an existing period's start (new period contains another's start)
  const overlap = await prisma.payPeriod.findFirst({
    where: { startDate: { gt: startDate, lte: endDate } },
  });
  if (overlap) {
    return {
      success: false,
      message: `This period would overlap with an existing period starting ${overlap.startDate}.`,
    };
  }

  await prisma.payPeriod.create({
    data: { startDate, endDate, isLocked: false },
  });

  revalidatePath("/admin/pay-periods");
  return { success: true, message: "Pay period created." };
}

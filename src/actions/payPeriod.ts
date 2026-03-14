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

const createSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export async function createPayPeriod(
  raw: unknown
): Promise<ActionResponse> {
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

  // Check for overlap with existing periods
  const overlap = await prisma.payPeriod.findFirst({
    where: {
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (overlap) {
    return {
      success: false,
      message: `Dates overlap with an existing period (${overlap.startDate} – ${overlap.endDate}).`,
    };
  }

  await prisma.payPeriod.create({
    data: { startDate, endDate, isLocked: false },
  });

  revalidatePath("/admin/pay-periods");
  return { success: true, message: "Pay period created." };
}

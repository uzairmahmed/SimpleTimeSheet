"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePaidHours, getPayPeriodRange } from "@/lib/timesheetCalc";
import type { ActionResponse } from "@/lib/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

async function getOrCreatePayPeriod(date: string) {
  const { start, end } = getPayPeriodRange(new Date(date + "T12:00:00"));
  return prisma.payPeriod.upsert({
    where: { startDate_endDate: { startDate: start, endDate: end } },
    update: {},
    create: { startDate: start, endDate: end, isLocked: false },
  });
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

const timeFields = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
    paidHoursOverride: z.number().min(0).optional().nullable(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const addSchema = timeFields.and(z.object({ userId: z.string().min(1, "Required") }));

type AddInput = z.infer<typeof addSchema>;
type UpdateInput = z.infer<typeof timeFields>;

// ─── Actions ───────────────────────────────────────────────────────────────────

export async function adminAddEntry(raw: unknown): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { userId, date, startTime, endTime, paidHoursOverride } = parsed.data;

  const period = await getOrCreatePayPeriod(date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  const existing = await prisma.timesheetEntry.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) {
    return { success: false, message: "An entry already exists for this employee on that date." };
  }

  const calc = calculatePaidHours(startTime, endTime);
  const paidHours = paidHoursOverride ?? calc.paidHours;
  const breakMinutes = paidHoursOverride != null ? 0 : calc.breakMinutes;

  await prisma.timesheetEntry.create({
    data: { userId, date, startTime, endTime, breakMinutes, paidHours },
  });

  revalidatePath("/admin/timesheets");
  return { success: true, message: "Entry added." };
}

export async function adminUpdateEntry(
  id: string,
  raw: unknown
): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = timeFields.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { date, startTime, endTime, paidHoursOverride } = parsed.data;

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry) return { success: false, message: "Entry not found." };

  const period = await getOrCreatePayPeriod(entry.date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  const calc = calculatePaidHours(startTime, endTime);
  const paidHours = paidHoursOverride ?? calc.paidHours;
  const breakMinutes = paidHoursOverride != null ? 0 : calc.breakMinutes;

  await prisma.timesheetEntry.update({
    where: { id },
    data: { date, startTime, endTime, breakMinutes, paidHours },
  });

  revalidatePath("/admin/timesheets");
  return { success: true, message: "Entry updated." };
}

export async function adminDeleteEntry(id: string): Promise<ActionResponse> {
  await requireAdmin();

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry) return { success: false, message: "Entry not found." };

  const period = await getOrCreatePayPeriod(entry.date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  await prisma.timesheetEntry.delete({ where: { id } });

  revalidatePath("/admin/timesheets");
  return { success: true, message: "Entry deleted." };
}

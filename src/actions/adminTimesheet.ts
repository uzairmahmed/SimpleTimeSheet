"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePaidHours } from "@/lib/timesheetCalc";
import type { ActionResponse } from "@/lib/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

/** Find the pay period that contains the given date, or null. */
async function findPeriodForDate(date: string) {
  return prisma.payPeriod.findFirst({
    where: { startDate: { lte: date }, endDate: { gte: date } },
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

const adjustSchema = z
  .object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
    paidHoursOverride: z.number().min(0).optional().nullable(),
    notes: z.string().optional(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type AddInput = z.infer<typeof addSchema>;
type UpdateInput = z.infer<typeof timeFields>;
type AdjustInput = z.infer<typeof adjustSchema>;

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

  const period = await findPeriodForDate(date);
  if (!period) {
    return { success: false, message: "No pay period exists for this date." };
  }
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked. Use Adjust for locked periods." };
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

export async function adminUpdateEntry(id: string, raw: unknown): Promise<ActionResponse> {
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

  const period = await findPeriodForDate(entry.date);
  if (period?.isLocked) {
    return { success: false, message: "This pay period is locked. Use Adjust instead." };
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

  const period = await findPeriodForDate(entry.date);
  if (period?.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  await prisma.timesheetEntry.delete({ where: { id } });

  revalidatePath("/admin/timesheets");
  return { success: true, message: "Entry deleted." };
}

/** Admin-only adjustment for entries in LOCKED periods. Logs all changes for audit. */
export async function adminAdjustEntry(id: string, raw: unknown): Promise<ActionResponse> {
  const session = await requireAdmin();

  const parsed = adjustSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { startTime, endTime, paidHoursOverride, notes } = parsed.data;

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry) return { success: false, message: "Entry not found." };

  const calc = calculatePaidHours(startTime, endTime);
  const newPaidHours = paidHoursOverride ?? calc.paidHours;
  const newBreakMinutes = paidHoursOverride != null ? entry.breakMinutes : calc.breakMinutes;

  await prisma.$transaction([
    prisma.timesheetEntry.update({
      where: { id },
      data: { startTime, endTime, breakMinutes: newBreakMinutes, paidHours: newPaidHours },
    }),
    prisma.adjustmentLog.create({
      data: {
        entryId: id,
        adminId: session.user.id,
        notes: notes || null,
        oldStartTime: entry.startTime,
        newStartTime: startTime,
        oldEndTime: entry.endTime,
        newEndTime: endTime,
        oldPaidHours: entry.paidHours,
        newPaidHours,
      },
    }),
  ]);

  revalidatePath("/admin/timesheets");
  revalidatePath("/timesheet");
  return { success: true, message: "Adjustment saved and logged." };
}

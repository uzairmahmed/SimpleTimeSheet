"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculatePaidHours, getPayPeriodRange } from "@/lib/timesheetCalc";
import type { ActionResponse } from "@/lib/types";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const entrySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type EntryInput = z.infer<typeof entrySchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");
  return session;
}

/** Find or create the PayPeriod record for the week containing `date`. */
async function getOrCreatePayPeriod(date: string) {
  const { start, end } = getPayPeriodRange(new Date(date + "T12:00:00"));
  return prisma.payPeriod.upsert({
    where: { startDate_endDate: { startDate: start, endDate: end } },
    update: {},
    create: { startDate: start, endDate: end, isLocked: false },
  });
}

// ─── Actions ───────────────────────────────────────────────────────────────────

export async function addTimesheetEntry(
  raw: EntryInput
): Promise<ActionResponse> {
  const session = await requireSession();

  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { date, startTime, endTime } = parsed.data;

  // Check period is not locked
  const period = await getOrCreatePayPeriod(date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  // Check for duplicate entry
  const existing = await prisma.timesheetEntry.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });
  if (existing) {
    return {
      success: false,
      message: "An entry already exists for this date.",
    };
  }

  const { breakMinutes, paidHours } = calculatePaidHours(startTime, endTime);

  await prisma.timesheetEntry.create({
    data: {
      userId: session.user.id,
      date,
      startTime,
      endTime,
      breakMinutes,
      paidHours,
    },
  });

  revalidatePath("/timesheet");
  return { success: true, message: "Entry added." };
}

export async function updateTimesheetEntry(
  id: string,
  raw: EntryInput
): Promise<ActionResponse> {
  const session = await requireSession();

  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { date, startTime, endTime } = parsed.data;

  // Verify ownership
  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) {
    return { success: false, message: "Entry not found." };
  }

  // Check lock
  const period = await getOrCreatePayPeriod(entry.date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  const { breakMinutes, paidHours } = calculatePaidHours(startTime, endTime);

  await prisma.timesheetEntry.update({
    where: { id },
    data: { date, startTime, endTime, breakMinutes, paidHours },
  });

  revalidatePath("/timesheet");
  return { success: true, message: "Entry updated." };
}

export async function deleteTimesheetEntry(
  id: string
): Promise<ActionResponse> {
  const session = await requireSession();

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) {
    return { success: false, message: "Entry not found." };
  }

  const period = await getOrCreatePayPeriod(entry.date);
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  await prisma.timesheetEntry.delete({ where: { id } });

  revalidatePath("/timesheet");
  return { success: true, message: "Entry deleted." };
}

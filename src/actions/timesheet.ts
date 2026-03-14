"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculatePaidHours } from "@/lib/timesheetCalc";
import type { ActionResponse } from "@/lib/types";

const entrySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type EntryInput = z.infer<typeof entrySchema>;

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");
  return session;
}

/** Find the pay period that contains the given date, or null. */
async function findPeriodForDate(date: string) {
  return prisma.payPeriod.findFirst({
    where: { startDate: { lte: date }, endDate: { gte: date } },
  });
}

export async function addTimesheetEntry(raw: EntryInput): Promise<ActionResponse> {
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

  const period = await findPeriodForDate(date);
  if (!period) {
    return { success: false, message: "No pay period exists for this date. Ask your administrator to create one." };
  }
  if (period.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  const existing = await prisma.timesheetEntry.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });
  if (existing) {
    return { success: false, message: "An entry already exists for this date." };
  }

  const { breakMinutes, paidHours } = calculatePaidHours(startTime, endTime);

  await prisma.timesheetEntry.create({
    data: { userId: session.user.id, date, startTime, endTime, breakMinutes, paidHours },
  });

  revalidatePath("/timesheet");
  return { success: true, message: "Entry added." };
}

export async function updateTimesheetEntry(id: string, raw: EntryInput): Promise<ActionResponse> {
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

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) {
    return { success: false, message: "Entry not found." };
  }

  const period = await findPeriodForDate(entry.date);
  if (period?.isLocked) {
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

export async function deleteTimesheetEntry(id: string): Promise<ActionResponse> {
  const session = await requireSession();

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) {
    return { success: false, message: "Entry not found." };
  }

  const period = await findPeriodForDate(entry.date);
  if (period?.isLocked) {
    return { success: false, message: "This pay period is locked." };
  }

  await prisma.timesheetEntry.delete({ where: { id } });

  revalidatePath("/timesheet");
  return { success: true, message: "Entry deleted." };
}

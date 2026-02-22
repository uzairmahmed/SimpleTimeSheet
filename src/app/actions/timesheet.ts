"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPayPeriodBoundsForDate } from "@/lib/pay-period";
import {
  computeBreakAndPaidHours,
  roundToNearest15Min,
  timeToMinutes,
} from "@/lib/timesheet-utils";
import { z } from "zod";

const entrySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
    endTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  })
  .refine(
    (data) => {
      const startM = timeToMinutes(data.startTime);
      const endM = timeToMinutes(data.endTime);
      return endM > startM;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

export type TimesheetActionState =
  | { success: true }
  | { success: false; error: string };

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

async function getOrCreatePayPeriodForDate(date: Date) {
  const { start, end } = getPayPeriodBoundsForDate(date);
  let period = await prisma.payPeriod.findUnique({
    where: {
      startDate_endDate: {
        startDate: start,
        endDate: end,
      },
    },
  });
  if (!period) {
    period = await prisma.payPeriod.create({
      data: {
        startDate: start,
        endDate: end,
      },
    });
  }
  return period;
}

export async function createTimesheetEntry(
  _prev: unknown,
  formData: FormData
): Promise<TimesheetActionState> {
  const session = await getSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const raw = {
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
  };
  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Invalid input.";
    return { success: false, error: msg };
  }

  const { date, startTime, endTime } = parsed.data;
  const period = await getOrCreatePayPeriodForDate(new Date(date));
  if (period.isLocked) return { success: false, error: "This pay period is locked." };

  const { breakMinutes, paidHours } = computeBreakAndPaidHours(startTime, endTime);
  const startRounded = roundToNearest15Min(startTime);
  const endRounded = roundToNearest15Min(endTime);

  await prisma.timesheetEntry.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      startTime: startRounded,
      endTime: endRounded,
      breakMinutes,
      paidHours,
      payPeriodId: period.id,
    },
  });

  revalidatePath("/timesheet");
  return { success: true };
}

export async function updateTimesheetEntry(
  entryId: string,
  _prev: unknown,
  formData: FormData
): Promise<TimesheetActionState> {
  const session = await getSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const entry = await prisma.timesheetEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
    include: { payPeriod: true },
  });
  if (!entry) return { success: false, error: "Entry not found." };
  if (entry.payPeriod?.isLocked) return { success: false, error: "This pay period is locked." };

  const raw = {
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
  };
  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Invalid input.";
    return { success: false, error: msg };
  }

  const { date, startTime, endTime } = parsed.data;
  const period = await getOrCreatePayPeriodForDate(new Date(date));
  if (period.isLocked) return { success: false, error: "This pay period is locked." };

  const { breakMinutes, paidHours } = computeBreakAndPaidHours(startTime, endTime);
  const startRounded = roundToNearest15Min(startTime);
  const endRounded = roundToNearest15Min(endTime);

  await prisma.timesheetEntry.update({
    where: { id: entryId },
    data: {
      date: new Date(date),
      startTime: startRounded,
      endTime: endRounded,
      breakMinutes,
      paidHours,
      payPeriodId: period.id,
    },
  });

  revalidatePath("/timesheet");
  return { success: true };
}

export async function deleteTimesheetEntry(entryId: string): Promise<TimesheetActionState> {
  const session = await getSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const entry = await prisma.timesheetEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
    include: { payPeriod: true },
  });
  if (!entry) return { success: false, error: "Entry not found." };
  if (entry.payPeriod?.isLocked) return { success: false, error: "This pay period is locked." };

  await prisma.timesheetEntry.delete({ where: { id: entryId } });
  revalidatePath("/timesheet");
  return { success: true };
}

export async function getMyEntriesForPeriod(start: Date, end: Date) {
  const session = await getSession();
  if (!session) return [];

  const entries = await prisma.timesheetEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
    include: { payPeriod: true },
  });
  return entries;
}

export async function getCurrentPayPeriod() {
  const { start, end } = getPayPeriodBoundsForDate(new Date());
  const period = await prisma.payPeriod.findUnique({
    where: {
      startDate_endDate: {
        startDate: start,
        endDate: end,
      },
    },
  });
  return period
    ? { id: period.id, start, end, isLocked: period.isLocked }
    : { id: null, start, end, isLocked: false };
}

export async function getPayPeriodHistory(limit = 12) {
  const session = await getSession();
  if (!session) return [];

  const periods = await prisma.payPeriod.findMany({
    orderBy: { startDate: "desc" },
    take: limit,
  });
  return periods;
}

export async function getPayPeriodById(periodId: string) {
  const session = await getSession();
  if (!session) return null;

  const period = await prisma.payPeriod.findUnique({
    where: { id: periodId },
  });
  return period;
}

/** Returns date strings (YYYY-MM-DD) in the range that fall in a locked pay period. */
export async function getLockedDatesInRange(start: Date, end: Date): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  const periodLockCache = new Map<string, boolean>();
  const locked: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endTime = new Date(end).getTime();

  while (cursor.getTime() <= endTime) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const { start: periodStart, end: periodEnd } = getPayPeriodBoundsForDate(cursor);
    const cacheKey = `${periodStart.toISOString().slice(0, 10)}`;
    let isLocked = periodLockCache.get(cacheKey);
    if (isLocked === undefined) {
      const period = await prisma.payPeriod.findUnique({
        where: {
          startDate_endDate: { startDate: periodStart, endDate: periodEnd },
        },
      });
      isLocked = period?.isLocked ?? false;
      periodLockCache.set(cacheKey, isLocked);
    }
    if (isLocked) locked.push(dateStr);
    cursor.setDate(cursor.getDate() + 1);
  }
  return locked;
}

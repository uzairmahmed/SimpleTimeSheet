"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { ActionResponse } from "@/lib/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

const baseFields = {
  name: z.string().min(1, "Required"),
  username: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_.-]+$/, "Lowercase letters, numbers, _ . - only"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  wageRate: z.number().min(0, "Cannot be negative"),
};

const createSchema = z.object({
  ...baseFields,
  password: z.string().min(6, "Minimum 6 characters"),
});

const updateSchema = z.object({
  ...baseFields,
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 6, "Minimum 6 characters")
    .optional(),
});

// ─── Actions ───────────────────────────────────────────────────────────────────

export async function createEmployee(raw: unknown): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, username, password, role, wageRate } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return {
      success: false,
      message: "Validation failed.",
      errors: { username: ["Username already taken."] },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, username, passwordHash, role, wageRate } });

  revalidatePath("/admin/employees");
  return { success: true, message: `${name} has been added.` };
}

export async function updateEmployee(id: string, raw: unknown): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, username, password, role, wageRate } = parsed.data;

  const conflict = await prisma.user.findFirst({ where: { username, NOT: { id } } });
  if (conflict) {
    return {
      success: false,
      message: "Validation failed.",
      errors: { username: ["Username already taken."] },
    };
  }

  const data: Parameters<typeof prisma.user.update>[0]["data"] = {
    name,
    username,
    role,
    wageRate,
  };

  if (password && password.length > 0) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/admin/employees");
  return { success: true, message: `${name} has been updated.` };
}

export async function deleteEmployee(id: string): Promise<ActionResponse> {
  const session = await requireAdmin();

  if (id === session.user.id) {
    return { success: false, message: "You cannot delete your own account." };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { success: false, message: "Employee not found." };

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/employees");
  return { success: true, message: `${user.name} has been removed.` };
}

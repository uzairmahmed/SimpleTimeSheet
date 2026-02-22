"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export type AdminEmployeeState = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required").regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscore only"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  wageRate: z.coerce.number().min(0, "Wage must be ≥ 0"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required").regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscore only"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  wageRate: z.coerce.number().min(0, "Wage must be ≥ 0"),
});

export async function getEmployeesForAdmin(search?: string) {
  if (!(await requireAdmin())) return [];

  const where = search?.trim()
    ? {
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" as const } },
          { username: { contains: search.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      wageRate: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
  return users.map((u) => ({
    ...u,
    wageRate: Number(u.wageRate),
  }));
}

export async function createEmployee(
  _prev: unknown,
  formData: FormData
): Promise<AdminEmployeeState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized." };

  const raw = {
    name: formData.get("name") as string,
    username: (formData.get("username") as string)?.trim().toLowerCase(),
    password: formData.get("password") as string,
    role: formData.get("role") as string,
    wageRate: formData.get("wageRate") as string,
  };
  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ");
    return { success: false, error: msg };
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) return { success: false, error: "Username already taken." };

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
      wageRate: parsed.data.wageRate,
    },
  });

  revalidatePath("/admin/employees");
  revalidatePath("/");
  return { success: true };
}

export async function updateEmployee(
  userId: string,
  _prev: unknown,
  formData: FormData
): Promise<AdminEmployeeState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized." };

  const raw = {
    name: formData.get("name") as string,
    username: (formData.get("username") as string)?.trim().toLowerCase(),
    password: formData.get("password") as string,
    role: formData.get("role") as string,
    wageRate: formData.get("wageRate") as string,
  };
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ");
    return { success: false, error: msg };
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { success: false, error: "User not found." };

  const usernameTaken = await prisma.user.findFirst({
    where: { username: parsed.data.username, NOT: { id: userId } },
  });
  if (usernameTaken) return { success: false, error: "Username already taken." };

  const data: { name: string; username: string; role: "ADMIN" | "EMPLOYEE"; wageRate: number; passwordHash?: string } = {
    name: parsed.data.name,
    username: parsed.data.username,
    role: parsed.data.role,
    wageRate: parsed.data.wageRate,
  };
  if (parsed.data.password && parsed.data.password.length >= 6) {
    data.passwordHash = await hash(parsed.data.password, 12);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/admin/employees");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEmployee(userId: string): Promise<AdminEmployeeState> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized." };
  if (session.user.id === userId) return { success: false, error: "You cannot delete your own account." };

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { success: false, error: "User not found." };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/employees");
  revalidatePath("/");
  return { success: true };
}

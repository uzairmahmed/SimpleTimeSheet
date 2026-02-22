"use server";

import { prisma } from "@/lib/db";

/**
 * Public list of employee names for the home page (no sensitive data).
 */
export async function getEmployeeNames() {
  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return users;
}

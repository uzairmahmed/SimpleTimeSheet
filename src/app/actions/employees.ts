"use server";

import { prisma } from "@/lib/db";

/**
 * Public list for home/kiosk (name, username for login prefill — no sensitive data).
 */
export async function getEmployeeNames() {
  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });
  return users;
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeClient } from "./_components/HomeClient";

export default async function KioskHome() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    redirect("/timesheet");
  }

  const [employees, currentPeriod] = await Promise.all([
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: { id: true, name: true, username: true },
      orderBy: { name: "asc" },
    }),
    prisma.payPeriod.findFirst({
      where: {
        startDate: { lte: new Date().toISOString().slice(0, 10) },
        endDate: { gte: new Date().toISOString().slice(0, 10) },
      },
    }),
  ]);

  const periodLabel = currentPeriod
    ? `${currentPeriod.startDate} – ${currentPeriod.endDate}`
    : null;

  return <HomeClient employees={employees} periodLabel={periodLabel} />;
}

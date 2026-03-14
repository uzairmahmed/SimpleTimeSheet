import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateEmployeeDialog, EditEmployeeDialog } from "./_components/EmployeeFormDialog";
import { DeleteEmployeeButton } from "./_components/DeleteEmployeeButton";
import { SearchInput } from "./_components/SearchInput";

type SearchParams = { q?: string };

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  const q = searchParams.q?.trim() ?? "";

  const employees = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      wageRate: true,
      _count: { select: { entries: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage staff accounts, roles, and wages.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Suspense>
          <SearchInput />
        </Suspense>
        <div className="sm:ml-auto">
          <CreateEmployeeDialog />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Wage/hr</TableHead>
              <TableHead className="text-center">Entries</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {q ? `No employees match "${q}".` : "No employees yet — add one above."}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {emp.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.role === "ADMIN" ? "default" : "secondary"}>
                      {emp.role === "ADMIN" ? "Admin" : "Employee"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${Number(emp.wageRate).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {emp._count.entries}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EditEmployeeDialog
                        employee={{
                          id: emp.id,
                          name: emp.name,
                          username: emp.username,
                          role: emp.role,
                          wageRate: Number(emp.wageRate),
                        }}
                      />
                      <DeleteEmployeeButton
                        id={emp.id}
                        name={emp.name}
                        isSelf={emp.id === session.user.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

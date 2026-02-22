import { getEmployeesForAdmin } from "@/app/actions/admin-employees";
import { EmployeeList } from "@/components/shared/EmployeeList";

type Props = { searchParams: { q?: string } };

export default async function AdminEmployeesPage({ searchParams }: Props) {
  const searchQuery = searchParams.q;
  const employees = await getEmployeesForAdmin(searchQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground">
          List, create, edit, and delete employees. Manage wages and roles.
        </p>
      </div>
      <EmployeeList employees={employees} searchQuery={searchQuery} />
    </div>
  );
}

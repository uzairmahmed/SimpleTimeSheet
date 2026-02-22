import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage employees and timesheets. Use the sidebar to navigate.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>
            Manage employees, view consolidated timesheets, and run payroll export.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <a href="/admin/employees" className="text-primary hover:underline">
                Employees
              </a>{" "}
              — List, create, edit, delete; manage wages and roles
            </li>
            <li>
              <a href="/admin/timesheet" className="text-primary hover:underline">
                Timesheet &amp; Payroll
              </a>{" "}
              — Consolidated view, pay period lock/unlock, CSV export
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

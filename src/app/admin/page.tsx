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
            Employee management and timesheet features will be available in
            Phase 4 and 5.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <a href="/admin/employees" className="text-primary hover:underline">
                Employees
              </a>{" "}
              (Phase 4)
            </li>
            <li>Timesheet &amp; Pay Period (Phase 5)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

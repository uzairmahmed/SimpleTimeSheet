import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function TimesheetPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/timesheet");
  }
  if (session.user.role !== "EMPLOYEE" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <p className="text-muted-foreground">
          View and edit your timesheet entries. (Phase 3)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Daily entry form and bi-weekly breakdown will be implemented in
            Phase 3.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

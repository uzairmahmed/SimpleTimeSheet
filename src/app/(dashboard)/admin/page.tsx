import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") redirect("/unauthorized");

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-1">Coming in Phase 4 & 5.</p>
    </div>
  );
}

import { TopNav } from "@/components/shared/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}

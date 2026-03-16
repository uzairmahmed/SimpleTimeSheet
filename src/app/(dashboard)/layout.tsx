import { TopNav } from "@/components/shared/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}

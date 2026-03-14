import { AppSidebar } from "@/components/shared/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:p-6 p-4 pt-[4.5rem] md:pt-6">
        {children}
      </main>
    </div>
  );
}

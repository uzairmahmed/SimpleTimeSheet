import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/shared/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smiline Timesheet",
  description: "Clinic staff timesheet and payroll management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}

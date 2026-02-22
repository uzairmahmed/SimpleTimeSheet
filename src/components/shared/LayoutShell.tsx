"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogIn,
  LogOut,
  Menu,
  CalendarClock,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type NavLink = { href: string; label: string; icon?: LucideIcon };

const publicLinks: NavLink[] = [{ href: "/", label: "Home" }];

const employeeLinks: NavLink[] = [
  { href: "/timesheet", label: "My Timesheet", icon: FileText },
];

const adminLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/timesheet", label: "Timesheet & Payroll", icon: CalendarClock },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployee = session?.user?.role === "EMPLOYEE";

  const navLinks: NavLink[] = [
    ...publicLinks,
    ...(isEmployee ? employeeLinks : []),
    ...(isAdmin ? adminLinks : []),
  ].filter((link) => link.href !== "/" || !session); // show Home when not logged in

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile menu button */}
      <header className="md:hidden flex items-center justify-between p-4 border-b">
        <Link href="/" className="font-semibold">
          Clinic Timesheet
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 border-r bg-card flex-shrink-0 flex flex-col",
          "fixed md:static inset-y-0 left-0 z-40 transform transition-transform ease-in-out md:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <Link href="/" className="font-semibold text-lg">
            Clinic Timesheet
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navLinks.map((link) => {
            const { href, label, icon: Icon } = link;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t space-y-1">
          {status === "loading" ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : session ? (
            <>
              <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                {session.user?.name ?? session.user?.username}
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/login" onClick={() => setSidebarOpen(false)}>
              <Button variant="default" className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  LogOut,
  Menu,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/timesheets", label: "Timesheets", icon: ClipboardList },
  { href: "/admin/pay-periods", label: "Pay Periods", icon: CalendarDays },
];

const employeeLinks = [
  { href: "/timesheet", label: "My Timesheet", icon: ClipboardList },
];

function NavLinks({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-1">
        <Clock className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Smiline Timesheet</span>
      </div>

      <Separator />

      {/* User info */}
      <div className="px-1">
        <p className="text-xs font-medium truncate">{session?.user?.name}</p>
        <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1 text-xs">
          {isAdmin ? "Admin" : "Employee"}
        </Badge>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex-1">
        <NavLinks isAdmin={isAdmin} onNavigate={onNavigate} />
      </div>

      <Separator />

      {/* Sign out */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-3 text-muted-foreground"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 border-b bg-background px-4 h-14">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Smiline Timesheet</span>
        </div>
      </div>
    </>
  );
}

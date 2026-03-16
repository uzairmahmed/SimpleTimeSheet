"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Clock, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/timesheets", label: "Timesheets" },
  { href: "/admin/pay-periods", label: "Pay Periods" },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");
}

export function TopNav() {
  const { data: session } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";
  const isActive = useActive();

  return (
    <header className="h-14 border-b bg-background sticky top-0 z-40 flex items-center px-4 gap-3">
      {/* Mobile hamburger (admin only) */}
      {isAdmin && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 shrink-0">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 pt-10">
            <nav className="flex flex-col gap-1">
              {adminLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      )}

      {/* Logo */}
      <Link
        href={isAdmin ? "/admin" : "/timesheet"}
        className="flex items-center gap-2 shrink-0"
      >
        <Clock className="h-5 w-5 text-primary" />
        <span className="font-bold text-sm">Smiline Timesheet</span>
      </Link>

      {/* Role badge */}
      <Badge
        variant={isAdmin ? "default" : "secondary"}
        className="shrink-0 text-[10px] px-1.5"
      >
        {isAdmin ? "ADMIN" : "EMPLOYEE"}
      </Badge>

      {/* Center — admin nav links (desktop) or page title (employee) */}
      <div className="flex-1 flex items-center justify-center">
        {isAdmin ? (
          <nav className="hidden md:flex items-center gap-0.5">
            {adminLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        ) : (
          <span className="text-sm font-medium">My Timesheet</span>
        )}
      </div>

      {/* Right — name + sign out */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[140px]">
          {session?.user?.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}

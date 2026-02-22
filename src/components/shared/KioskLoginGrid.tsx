"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LayoutDashboard } from "lucide-react";

type Employee = { id: string; name: string; username: string };

export function KioskLoginGrid({
  employees,
  currentPeriodLabel,
}: {
  employees: Employee[];
  currentPeriodLabel: string;
}) {
  const [loginFor, setLoginFor] = useState<Employee | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginFor) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: loginFor.username,
        password,
        redirect: false,
        callbackUrl: "/timesheet",
      });
      if (res?.error) {
        setError("Invalid password.");
        setLoading(false);
        return;
      }
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  function closeDialog() {
    setLoginFor(null);
    setPassword("");
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clinic Timesheet</h1>
        <p className="text-muted-foreground">
          Tap your name to sign in. Pay period:{" "}
          <span className="font-medium text-foreground">{currentPeriodLabel}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {employees.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => setLoginFor(emp)}
            className="flex flex-col items-center justify-center min-h-[100px] rounded-lg border-2 border-border bg-card p-4 text-center font-medium shadow-sm transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="break-words">{emp.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t sm:flex-row sm:items-center">
        <a href="/login?callbackUrl=/timesheet">
          <Button variant="default">Sign in (Timesheet)</Button>
        </a>
        <a href="/login?callbackUrl=/admin">
          <Button variant="outline" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Admin dashboard
          </Button>
        </a>
      </div>

      {loginFor && (
        <>
          <DialogOverlay onClick={closeDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Enter your password for {loginFor.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={loginFor.username} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !password}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </>
      )}
    </div>
  );
}

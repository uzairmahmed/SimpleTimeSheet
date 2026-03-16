"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Employee = { id: string; name: string; username: string };

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginModalForm({
  defaultUsername,
  onSuccess,
}: {
  defaultUsername: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const hasPrefilledUsername = defaultUsername !== "";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: defaultUsername, password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const result = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid username or password.");
      form.setFocus("password");
      return;
    }

    onSuccess();
    router.push("/");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="username"
                  autoComplete="username"
                  disabled={loading || hasPrefilledUsername}
                  autoFocus={!hasPrefilledUsername}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  autoFocus={hasPrefilledUsername}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}

export function HomeClient({
  employees,
  periodLabel,
}: {
  employees: Employee[];
  periodLabel: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedName, setSelectedName] = useState("");

  function openEmployeeLogin(emp: Employee) {
    setSelectedUsername(emp.username);
    setSelectedName(emp.name);
    setModalOpen(true);
  }

  function openAdminLogin() {
    setSelectedUsername("");
    setSelectedName("");
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-background border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Smiline Timesheet</span>
        </div>
        <Button variant="outline" size="sm" onClick={openAdminLogin}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Admin Sign In
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-10 gap-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">User Selection</h1>
          <p className="text-muted-foreground text-sm">
            Tap your name to sign in and log your hours.
          </p>
          {periodLabel && (
            <Badge variant="secondary" className="mt-2">
              Current period: {periodLabel}
            </Badge>
          )}
        </div>

        <Separator className="max-w-sm w-full" />

        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No employees yet — an admin must add them first.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => openEmployeeLogin(emp)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-background p-5 shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {emp.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Login modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedName ? `Sign in as ${selectedName}` : "Admin Sign In"}
            </DialogTitle>
          </DialogHeader>
          {modalOpen && (
            <LoginModalForm
              defaultUsername={selectedUsername}
              onSuccess={() => setModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

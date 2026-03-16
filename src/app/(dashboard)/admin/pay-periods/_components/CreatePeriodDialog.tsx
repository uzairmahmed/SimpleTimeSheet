"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createPayPeriod } from "@/actions/payPeriod";

const schema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Required")
    .refine(
      (d) => new Date(d + "T12:00:00").getDay() === 0,
      "Start date must be a Sunday"
    ),
});

type Values = z.infer<typeof schema>;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Returns the next Sunday on or after the given date string. */
function nextSunday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay(); // 0=Sun
  if (day !== 0) d.setDate(d.getDate() + (7 - day));
  return d.toISOString().slice(0, 10);
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-CA", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

type Props = { lastPeriodEnd?: string };

export function CreatePeriodDialog({ lastPeriodEnd }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  function defaultStart() {
    const base = lastPeriodEnd ? addDays(lastPeriodEnd, 1) : today;
    return nextSunday(base);
  }

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: defaultStart() },
  });

  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate =
    startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      ? addDays(startDate, 13)
      : "—";

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await createPayPeriod({
        startDate: values.startDate,
        endDate: addDays(values.startDate, 13),
      });
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
        if (result.errors) {
          for (const [f, msgs] of Object.entries(result.errors)) {
            form.setError(f as keyof Values, { message: msgs[0] });
          }
        }
      }
    });
  }

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) form.reset({ startDate: defaultStart() });
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Pay Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Pay Period</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (Sunday)</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={pending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted/50 border px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground mb-0.5">End Date (auto — Saturday)</p>
              <p className="font-medium">
                {endDate !== "—" ? formatDisplay(endDate) : "—"}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Periods are always 14 days (Sunday → Saturday). The end date is set automatically.
            </p>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Period
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

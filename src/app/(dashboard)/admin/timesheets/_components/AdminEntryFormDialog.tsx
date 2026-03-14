"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { adminAddEntry, adminUpdateEntry } from "@/actions/adminTimesheet";

// ─── Schemas ───────────────────────────────────────────────────────────────────

const timeBase = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
    paidHoursOverride: z.number().min(0).optional().nullable(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const addSchema = timeBase.and(z.object({ userId: z.string().min(1, "Required") }));
const editSchema = timeBase;

type AddValues = z.infer<typeof addSchema>;
type EditValues = z.infer<typeof editSchema>;

type Employee = { id: string; name: string };

// ─── Add Dialog ────────────────────────────────────────────────────────────────

export function AdminAddEntryDialog({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { userId: "", date: today, startTime: "", endTime: "", paidHoursOverride: null },
  });

  function onSubmit(values: AddValues) {
    startTransition(async () => {
      const result = await adminAddEntry(values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset({ userId: "", date: today, startTime: "", endTime: "", paidHoursOverride: null });
      } else {
        toast.error(result.message);
        if (result.errors) {
          for (const [f, msgs] of Object.entries(result.errors)) {
            form.setError(f as keyof AddValues, { message: msgs[0] });
          }
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timesheet Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TimeFields form={form} pending={pending} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Entry
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ───────────────────────────────────────────────────────────────

type EntryDefaults = {
  id: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  paidHours: number;
};

export function AdminEditEntryDialog({ entry }: { entry: EntryDefaults }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      paidHoursOverride: null,
    },
  });

  function onSubmit(values: EditValues) {
    startTransition(async () => {
      const result = await adminUpdateEntry(entry.id, values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit entry</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Entry — {entry.employeeName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TimeFields form={form} pending={pending} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Shared time fields ────────────────────────────────────────────────────────

function TimeFields({
  form,
  pending,
}: {
  form: ReturnType<typeof useForm<EditValues>> | ReturnType<typeof useForm<AddValues>>;
  pending: boolean;
}) {
  const ctrl = form.control as ReturnType<typeof useForm<EditValues>>["control"];

  return (
    <>
      <FormField
        control={ctrl}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" disabled={pending} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={ctrl}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start</FormLabel>
              <FormControl>
                <Input type="time" disabled={pending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={ctrl}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End</FormLabel>
              <FormControl>
                <Input type="time" disabled={pending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={ctrl}
        name="paidHoursOverride"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Override Paid Hours{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (leave blank to auto-calculate)
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.25"
                min="0"
                placeholder="e.g. 7.5"
                disabled={pending}
                value={field.value == null || isNaN(Number(field.value)) ? "" : field.value}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : e.target.valueAsNumber)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

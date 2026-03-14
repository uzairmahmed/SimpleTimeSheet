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
import { Input } from "@/components/ui/input";
import { addTimesheetEntry, updateTimesheetEntry } from "@/actions/timesheet";

const schema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Required"),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  mode: "add" | "edit";
  entryId?: string;
  defaultValues?: FormValues;
  currentPeriodStart?: string;
  /** Controlled mode — used by CalendarView */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When set, the date field is displayed as text and locked */
  fixedDate?: string;
};

export function EntryFormDialog({
  mode,
  entryId,
  defaultValues,
  currentPeriodStart,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  fixedDate,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      date: fixedDate ?? today,
      startTime: "",
      endTime: "",
    },
  });

  // Sync form date when fixedDate changes (different calendar cell opened)
  const currentFixedDate = fixedDate;

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result =
        mode === "add"
          ? await addTimesheetEntry(values)
          : await updateTimesheetEntry(entryId!, values);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset({ date: fixedDate ?? today, startTime: "", endTime: "" });
      } else {
        toast.error(result.message);
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            form.setError(field as keyof FormValues, { message: messages[0] });
          }
        }
      }
    });
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>
          {mode === "add" ? "Log Hours" : "Edit Entry"}
          {fixedDate && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              — {new Date(fixedDate + "T12:00:00").toLocaleDateString("en-CA", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!fixedDate && (
            <FormField
              control={form.control}
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
          )}
          {/* Hidden date field when fixedDate is set */}
          {fixedDate && (
            <input type="hidden" {...form.register("date")} value={fixedDate} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
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
              control={form.control}
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "Save Entry" : "Save Changes"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit entry</span>
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

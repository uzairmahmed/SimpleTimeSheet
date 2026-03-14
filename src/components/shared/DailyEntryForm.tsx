"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTimesheetEntry } from "@/app/actions/timesheet";
import { computeBreakAndPaidHours, timeToMinutes } from "@/lib/timesheet-utils";
import { Spinner } from "@/components/ui/spinner";

const today = () => new Date().toISOString().slice(0, 10);

function getPreview(start: string, end: string): string | null {
  if (!start || !end) return null;
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);
  if (endM <= startM) return null;
  const { breakMinutes, paidHours } = computeBreakAndPaidHours(start, end);
  if (breakMinutes > 0) {
    return `${paidHours} h paid (30 min break applied)`;
  }
  return `${paidHours} h paid`;
}

export function DailyEntryForm({
  defaultDate,
  disabled,
  onSuccess,
  embedded,
  onCancel,
}: {
  defaultDate?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  /** When true, render without Card for use inside a modal (date disabled and fixed). */
  embedded?: boolean;
  onCancel?: () => void;
}) {
  const [date, setDate] = useState(defaultDate ?? today());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const preview = getPreview(startTime, endTime);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);
    const res = await createTimesheetEntry({ success: true }, formData);
    setIsPending(false);
    if (res.success) {
      onSuccess?.();
      if (!embedded) {
        setDate(today());
        setStartTime("09:00");
        setEndTime("17:00");
      }
    } else {
      setError(res.error);
    }
  }

  const formContent = (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        await handleSubmit(new FormData(form));
      }}
      className="space-y-4"
    >
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {embedded && <input type="hidden" name="date" value={date} />}
      <div className={embedded ? "space-y-4" : "grid gap-4 sm:grid-cols-3"}>
        <div className="space-y-2">
          <label htmlFor="entry-date" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="entry-date"
            name={embedded ? undefined : "date"}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={disabled || embedded}
            required
            className={embedded ? "bg-muted" : undefined}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="entry-start" className="text-sm font-medium">
              Start time
            </label>
            <Input
              id="entry-start"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="entry-end" className="text-sm font-medium">
              End time
            </label>
            <Input
              id="entry-end"
              name="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
        </div>
      </div>
      {preview && (
        <p className="text-sm text-muted-foreground">{preview}</p>
      )}
      {embedded && (
        <>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Close
              </Button>
            )}
            <Button type="submit" disabled={disabled || isPending}>
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Adding…
                </>
              ) : (
                "Add entry"
              )}
            </Button>
          </div>
        </>
      )}
      {!embedded && (
        <Button type="submit" disabled={disabled || isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Adding…
            </>
          ) : (
            "Add entry"
          )}
        </Button>
      )}
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add entry</CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}

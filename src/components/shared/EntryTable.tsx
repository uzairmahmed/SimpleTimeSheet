"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateTimesheetEntry, deleteTimesheetEntry } from "@/app/actions/timesheet";
import { computeBreakAndPaidHours, timeToMinutes } from "@/lib/timesheet-utils";
import { Spinner } from "@/components/ui/spinner";
import { Pencil, Trash2 } from "lucide-react";

type Entry = {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number | { toString(): string };
  payPeriod: { isLocked: boolean } | null;
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function paidHoursNum(paidHours: Entry["paidHours"]): number {
  return typeof paidHours === "number" ? paidHours : Number(paidHours.toString());
}

export function EntryTable({
  entries,
  periodLocked,
  onUpdate,
  initialEditEntryId,
  onClearEditId,
}: {
  entries: Entry[];
  periodLocked: boolean;
  onUpdate: () => void;
  initialEditEntryId?: string | null;
  onClearEditId?: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditDate(new Date(entry.date).toISOString().slice(0, 10));
    setEditStart(entry.startTime);
    setEditEnd(entry.endTime);
    setError(null);
  }

  React.useEffect(() => {
    if (!initialEditEntryId) return;
    const entry = entries.find((e) => e.id === initialEditEntryId);
    if (entry) {
      startEdit(entry);
      onClearEditId?.();
    }
    // Only run when calendar asks to open a specific entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditEntryId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("date", editDate);
    formData.set("startTime", editStart);
    formData.set("endTime", editEnd);
    const res = await updateTimesheetEntry(editingId, { success: true }, formData);
    setPending(false);
    if (res.success) {
      setEditingId(null);
      onUpdate();
    } else {
      setError(res.error);
    }
  }

  async function handleDelete(entryId: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await deleteTimesheetEntry(entryId);
    if (res.success) onUpdate();
    else setError(res.error);
  }

  const preview =
    editingId && editDate && editStart && editEnd
      ? (() => {
          const startM = timeToMinutes(editStart);
          const endM = timeToMinutes(editEnd);
          if (endM <= startM) return null;
          const { paidHours } = computeBreakAndPaidHours(editStart, editEnd);
          return `${paidHours} h paid`;
        })()
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {periodLocked && (
            <p className="mb-4 text-sm text-muted-foreground">
              This period is locked. Editing and adding entries is disabled.
            </p>
          )}
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Date</th>
                    <th className="p-2 text-left font-medium">Start</th>
                    <th className="p-2 text-left font-medium">End</th>
                    <th className="p-2 text-left font-medium">Break</th>
                    <th className="p-2 text-right font-medium">Paid</th>
                    {!periodLocked && <th className="p-2 w-24" />}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr className="border-b">
                        <td className="p-2">{formatDate(entry.date)}</td>
                        <td className="p-2">{entry.startTime}</td>
                        <td className="p-2">{entry.endTime}</td>
                        <td className="p-2">{entry.breakMinutes ? "30 min" : "—"}</td>
                        <td className="p-2 text-right">{paidHoursNum(entry.paidHours)} h</td>
                        {!periodLocked && (
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => startEdit(entry)}
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(entry.id)}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                      {editingId === entry.id && (
                        <tr key={`${entry.id}-edit`} className="border-b bg-muted/30">
                          <td colSpan={periodLocked ? 5 : 6} className="p-4">
                            <form onSubmit={handleUpdate} className="flex flex-wrap items-end gap-4">
                              {error && (
                                <p className="w-full text-sm text-destructive">{error}</p>
                              )}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Date</label>
                                <Input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  required
                                  className="w-40"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Start</label>
                                <Input
                                  type="time"
                                  value={editStart}
                                  onChange={(e) => setEditStart(e.target.value)}
                                  required
                                  className="w-28"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium">End</label>
                                <Input
                                  type="time"
                                  value={editEnd}
                                  onChange={(e) => setEditEnd(e.target.value)}
                                  required
                                  className="w-28"
                                />
                              </div>
                              {preview && (
                                <span className="text-muted-foreground text-xs">{preview}</span>
                              )}
                              <Button type="submit" size="sm" disabled={pending}>
                                {pending ? <><Spinner className="mr-1.5 h-3.5 w-3.5" />Saving…</> : "Save"}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </form>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

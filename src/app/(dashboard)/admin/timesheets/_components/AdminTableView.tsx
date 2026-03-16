import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/timesheetCalc";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number;
  user: { name: string };
};

type Props = {
  entries: Entry[];
  isLocked: boolean;
  totalPaidHours: number;
};

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayLabel(d: string) {
  return DAY[new Date(d + "T12:00:00").getDay()];
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function AdminTableView({ entries, isLocked, totalPaidHours }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-center text-muted-foreground py-8">
                No entries found for this period.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // ─── Build employee list (ordered by name, deduplicated) ───────────────────
  const empMap = new Map<string, string>(); // id → name
  for (const e of entries) {
    // key by name since we don't have userId here, but names are unique enough
    empMap.set(e.user.name, e.user.name);
  }
  const empNames = Array.from(empMap.keys()).sort();

  // ─── Build day list (all 7 days in the period) ─────────────────────────────
  // Derive period start from the earliest entry date's Sunday
  const allDates = Array.from(new Set(entries.map((e) => e.date))).sort();

  // ─── Index: date → name → entry ───────────────────────────────────────────
  type EntryIndex = Map<string, Map<string, Entry>>;
  const index: EntryIndex = new Map();
  for (const e of entries) {
    if (!index.has(e.date)) index.set(e.date, new Map());
    index.get(e.date)!.set(e.user.name, e);
  }

  // ─── Per-employee totals ───────────────────────────────────────────────────
  const empTotals = new Map<string, number>();
  for (const e of entries) {
    empTotals.set(e.user.name, (empTotals.get(e.user.name) ?? 0) + e.paidHours);
  }

  const COLS_PER_EMP = 4; // Start | End | Break | Paid Hrs
  const totalCols = 2 + empNames.length * COLS_PER_EMP; // Day + Date + employee columns

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="text-base">
        <TableHeader>
          {/* Row 1: Employee name headers spanning their columns */}
          <TableRow>
            <TableHead rowSpan={2} className="w-[60px] align-middle border-r sticky left-0 bg-background z-20">
              Day
            </TableHead>
            <TableHead rowSpan={2} className="w-[100px] align-middle border-r sticky left-[60px] bg-background z-20">
              Date
            </TableHead>
            {empNames.map((name, i) => (
              <TableHead
                key={name}
                colSpan={COLS_PER_EMP}
                className={[
                  "text-center font-semibold border-b",
                  i < empNames.length - 1 ? "border-r" : "",
                ].join(" ")}
              >
                {name}
              </TableHead>
            ))}
          </TableRow>
          {/* Row 2: Sub-column headers */}
          <TableRow>
            {empNames.map((name, i) => (
              <React.Fragment key={name}>
                <TableHead className="font-medium">Start</TableHead>
                <TableHead className="font-medium">End</TableHead>
                <TableHead className="font-medium text-center">Break</TableHead>
                <TableHead
                  className={[
                    "font-medium text-right",
                    i < empNames.length - 1 ? "border-r" : "",
                  ].join(" ")}
                >
                  Paid Hrs
                </TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {allDates.map((date) => {
            const dayEntries = index.get(date)!;
            return (
              <TableRow key={date} className="h-16">
                <TableCell className="text-muted-foreground border-r sticky left-0 bg-background z-10">
                  {dayLabel(date)}
                </TableCell>
                <TableCell className="border-r sticky left-[60px] bg-background z-10">{date}</TableCell>
                {empNames.map((name, i) => {
                  const e = dayEntries.get(name);
                  return (
                    <React.Fragment key={name}>
                      <TableCell>
                        {e ? fmtTime(e.startTime) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {e ? fmtTime(e.endTime) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {e ? (
                          e.breakMinutes > 0 ? (
                            <Badge variant="secondary">30 min</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={[
                          "text-right font-mono font-semibold",
                          i < empNames.length - 1 ? "border-r" : "",
                        ].join(" ")}
                      >
                        {e ? formatHours(e.paidHours) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-medium border-r sticky left-0 bg-muted/50 z-10">
              Total
            </TableCell>
            {empNames.map((name, i) => (
              <React.Fragment key={name}>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell
                  className={[
                    "text-right font-mono font-semibold",
                    i < empNames.length - 1 ? "border-r" : "",
                  ].join(" ")}
                >
                  {formatHours(empTotals.get(name) ?? 0)}
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

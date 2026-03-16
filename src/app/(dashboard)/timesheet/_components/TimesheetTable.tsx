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
import { EntryFormDialog } from "./EntryFormDialog";
import { DeleteEntryButton } from "./DeleteEntryButton";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number; // Decimal serialized as number
};

type Props = {
  entries: Entry[];
  isLocked: boolean;
  totalPaidHours: number;
};

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayLabel(dateStr: string) {
  return DAY[new Date(dateStr + "T12:00:00").getDay()];
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function TimesheetTable({
  entries,
  isLocked,
  totalPaidHours,
}: Props) {

  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="text-base">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">Day</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="text-center">Break</TableHead>
            <TableHead className="text-right">Paid Hrs</TableHead>
            {!isLocked && <TableHead className="w-[80px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isLocked ? 6 : 7}
                className="text-center text-muted-foreground py-10"
              >
                No entries this period.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((e) => (
              <TableRow key={e.id} className="h-16">
                <TableCell className="font-medium text-muted-foreground">
                  {dayLabel(e.date)}
                </TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell>{fmtTime(e.startTime)}</TableCell>
                <TableCell>{fmtTime(e.endTime)}</TableCell>
                <TableCell className="text-center">
                  {e.breakMinutes > 0 ? (
                    <Badge variant="secondary">30 min</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatHours(e.paidHours)}
                </TableCell>
                {!isLocked && (
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <EntryFormDialog
                        mode="edit"
                        entryId={e.id}
                        defaultValues={{
                          date: e.date,
                          startTime: e.startTime,
                          endTime: e.endTime,
                        }}
                      />
                      <DeleteEntryButton id={e.id} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        {entries.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={isLocked ? 5 : 6}
                className="text-right font-medium"
              >
                Total
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatHours(totalPaidHours)}
              </TableCell>
              {!isLocked && <TableCell />}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

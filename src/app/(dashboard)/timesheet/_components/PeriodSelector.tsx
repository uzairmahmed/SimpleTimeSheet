"use client";

import { useRouter } from "next/navigation";
import { formatPeriodLabel } from "@/lib/timesheetCalc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Period = { start: string; end: string };

type Props = {
  periods: Period[];
  currentStart: string;
};

export function PeriodSelector({ periods, currentStart }: Props) {
  const router = useRouter();

  return (
    <Select
      value={currentStart}
      onValueChange={(val) => router.push(`/timesheet?period=${val}`)}
    >
      <SelectTrigger className="w-full sm:w-[260px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={p.start} value={p.start}>
            {formatPeriodLabel(p.start, p.end)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

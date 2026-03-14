"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPeriodLabel } from "@/lib/timesheetCalc";

type Period = { start: string; end: string };

type Props = {
  periods: Period[];
  currentStart: string;
};

export function PeriodNav({ periods, currentStart }: Props) {
  const router = useRouter();

  const idx = periods.findIndex((p) => p.start === currentStart);
  const current = periods[idx];

  // periods are sorted desc (newest first), so prev = idx - 1, next = idx + 1
  const prevPeriod = idx > 0 ? periods[idx - 1] : null;
  const nextPeriod = idx < periods.length - 1 ? periods[idx + 1] : null;

  function navigate(start: string) {
    router.push(`?period=${start}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!nextPeriod}
        onClick={() => nextPeriod && navigate(nextPeriod.start)}
        aria-label="Previous period"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium min-w-[200px] text-center">
        {current ? formatPeriodLabel(current.start, current.end) : "—"}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!prevPeriod}
        onClick={() => prevPeriod && navigate(prevPeriod.start)}
        aria-label="Next period"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

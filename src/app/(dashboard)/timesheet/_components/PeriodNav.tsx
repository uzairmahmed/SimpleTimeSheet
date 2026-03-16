"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPeriodLabel } from "@/lib/timesheetCalc";

type Period = { start: string; end: string; isLocked?: boolean };

type Props = {
  periods: Period[];
  currentStart: string;
  isLocked?: boolean;
};

export function PeriodNav({ periods, currentStart, isLocked }: Props) {
  const router = useRouter();

  const idx = periods.findIndex((p) => p.start === currentStart);
  const current = periods[idx];

  // periods sorted desc (newest first): prev = idx - 1 (newer), next = idx + 1 (older)
  const newerPeriod = idx > 0 ? periods[idx - 1] : null;
  const olderPeriod = idx < periods.length - 1 ? periods[idx + 1] : null;

  function navigate(start: string) {
    router.push(`?period=${start}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!olderPeriod}
        onClick={() => olderPeriod && navigate(olderPeriod.start)}
        aria-label="Older period"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 min-w-[200px] justify-center">
        <span className="text-sm font-medium">
          {current ? formatPeriodLabel(current.start, current.end) : "—"}
        </span>
        {isLocked && (
          <Badge variant="destructive" className="gap-1 px-1.5 py-0 text-[10px]">
            <Lock className="h-2.5 w-2.5" />
            Locked
          </Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!newerPeriod}
        onClick={() => newerPeriod && navigate(newerPeriod.start)}
        aria-label="Newer period"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

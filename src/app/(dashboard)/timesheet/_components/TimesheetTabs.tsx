"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalendarView } from "./CalendarView";
import { TimesheetTable } from "./TimesheetTable";
import { PeriodNav } from "./PeriodNav";
import { EntryFormDialog } from "./EntryFormDialog";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number;
};

type Period = { start: string; end: string; isLocked?: boolean };

type Props = {
  entries: Entry[];
  periodStart: string;
  periodEnd: string;
  isLocked: boolean;
  today: string;
  totalPaidHours: number;
  periods: Period[];
  currentStart: string;
  isCurrentPeriod: boolean;
};

export function TimesheetTabs({
  entries,
  periodStart,
  periodEnd,
  isLocked,
  today,
  totalPaidHours,
  periods,
  currentStart,
  isCurrentPeriod,
}: Props) {
  const [tab, setTab] = useState("calendar");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      {/* Unified toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <PeriodNav periods={periods} currentStart={currentStart} isLocked={isLocked} />
        {isCurrentPeriod && !isLocked && (
          <Badge variant="secondary" className="shrink-0">Current Period</Badge>
        )}
        <TabsList className="shrink-0">
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="h-3.5 w-3.5" />
            List
          </TabsTrigger>
        </TabsList>
        {!isLocked && isCurrentPeriod && (
          <div className="ml-auto">
            <EntryFormDialog mode="add" currentPeriodStart={periodStart} />
          </div>
        )}
      </div>

      <TabsContent value="calendar">
        <CalendarView
          entries={entries}
          periodStart={periodStart}
          periodEnd={periodEnd}
          isLocked={isLocked}
          today={today}
        />
      </TabsContent>

      <TabsContent value="list">
        <TimesheetTable
          entries={entries}
          isLocked={isLocked}
          totalPaidHours={totalPaidHours}
        />
      </TabsContent>
    </Tabs>
  );
}

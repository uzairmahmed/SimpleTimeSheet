"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import { CalendarView } from "./CalendarView";
import { TimesheetTable } from "./TimesheetTable";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  paidHours: number;
};

type Props = {
  entries: Entry[];
  periodStart: string;
  periodEnd: string;
  isLocked: boolean;
  today: string;
  totalPaidHours: number;
  wageRate: number;
};

export function TimesheetTabs({
  entries,
  periodStart,
  periodEnd,
  isLocked,
  today,
  totalPaidHours,
  wageRate,
}: Props) {
  return (
    <Tabs defaultValue="calendar">
      <TabsList className="mb-4">
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-1.5">
          <List className="h-3.5 w-3.5" />
          List
        </TabsTrigger>
      </TabsList>

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
          wageRate={wageRate}
        />
      </TabsContent>
    </Tabs>
  );
}

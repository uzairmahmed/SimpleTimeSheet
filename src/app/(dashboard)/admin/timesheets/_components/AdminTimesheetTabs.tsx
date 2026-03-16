"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import { AdminCalendarView } from "./AdminCalendarView";
import { AdminTableView } from "./AdminTableView";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  paidHours: number;
  breakMinutes: number;
  user: { name: string };
};

type Props = {
  entries: Entry[];
  periodStart: string;
  periodEnd: string;
  isLocked: boolean;
  totalPaidHours: number;
  today: string;
};

export function AdminTimesheetTabs({
  entries,
  periodStart,
  periodEnd,
  isLocked,
  totalPaidHours,
  today,
}: Props) {
  return (
    <Tabs defaultValue="calendar">
      <TabsList className="mb-3">
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
        <AdminCalendarView
          entries={entries}
          periodStart={periodStart}
          periodEnd={periodEnd}
          isLocked={isLocked}
          today={today}
        />
      </TabsContent>

      <TabsContent value="list">
        <AdminTableView
          entries={entries}
          isLocked={isLocked}
          totalPaidHours={totalPaidHours}
        />
      </TabsContent>
    </Tabs>
  );
}

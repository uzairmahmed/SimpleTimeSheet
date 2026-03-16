"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminCalendarView } from "./AdminCalendarView";
import { AdminTableView } from "./AdminTableView";
import { AdminAddEntryDialog } from "./AdminEntryFormDialog";
import { EmployeeFilter } from "./EmployeeFilter";
import { PeriodNav } from "@/app/(dashboard)/timesheet/_components/PeriodNav";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  paidHours: number;
  breakMinutes: number;
  user: { name: string };
};

type Period = { start: string; end: string; isLocked?: boolean };

type Employee = { id: string; name: string };

type Props = {
  entries: Entry[];
  periodStart: string;
  periodEnd: string;
  isLocked: boolean;
  totalPaidHours: number;
  today: string;
  employees: Employee[];
  periods: Period[];
  currentStart: string;
};

export function AdminTimesheetTabs({
  entries,
  periodStart,
  periodEnd,
  isLocked,
  totalPaidHours,
  today,
  employees,
  periods,
  currentStart,
}: Props) {
  const [tab, setTab] = useState("calendar");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      {/* Unified toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <EmployeeFilter employees={employees} />
        <PeriodNav periods={periods} currentStart={currentStart} isLocked={isLocked} />
        {isLocked && (
          <Badge variant="destructive" className="gap-1 shrink-0">Locked</Badge>
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
        {!isLocked && (
          <div className="ml-auto">
            <AdminAddEntryDialog employees={employees} />
          </div>
        )}
      </div>

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

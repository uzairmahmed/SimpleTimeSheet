"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPeriodLabel } from "@/lib/timesheetCalc";

type Employee = { id: string; name: string };
type Period = { start: string; end: string };

export function EmployeeFilter({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/admin/timesheets?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select
        value={searchParams.get("employee") ?? "all"}
        onValueChange={(v) => setParam("employee", v)}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="All employees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PeriodFilter({ periods }: { periods: Period[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`/admin/timesheets?${params.toString()}`);
  }

  return (
    <Select
      value={searchParams.get("period") ?? (periods[0]?.start ?? "")}
      onValueChange={(v) => setParam("period", v)}
    >
      <SelectTrigger className="w-full sm:w-64">
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

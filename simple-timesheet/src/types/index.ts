export interface Employee {
  id?: string;
  name: string;
  notes: string;
  pay: number;
}

export interface TimesheetEntry {
  id?: string;
  employee_id: string;
  employee_name: string;
  date: string;
  hours: number;
  notes: string;
}

export interface CurrentTimesheet {
  id?: string;
  start_date: string;
  end_date: string;
}

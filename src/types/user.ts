export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    active: boolean;
    pay: number;
    notes: string;
}

export interface TimesheetEntry {
  id: string;
  name: string;
  start: Date;
  end: Date;
}

export interface TimeSheetEntryNew {
  id: string;
  userId: string;
  date: Date;
  startTime: Date; // "HH:mm" format
  endTime: Date;   // "HH:mm" format
  breakMinutes?: number;
  totalHours?: number;
}
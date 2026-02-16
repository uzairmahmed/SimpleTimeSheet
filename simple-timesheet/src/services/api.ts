import { invoke } from '@tauri-apps/api/core';
import { Employee, TimesheetEntry, CurrentTimesheet } from '@/types';

export const api = {
  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await invoke('get_employees');
  },

  async createEmployee(name: string, notes: string, pay: number): Promise<string> {
    return await invoke('create_employee', { name, notes, pay });
  },

  async updateEmployee(id: string, name: string, notes: string, pay: number): Promise<void> {
    return await invoke('update_employee', { id, name, notes, pay });
  },

  async deleteEmployee(id: string): Promise<void> {
    return await invoke('delete_employee', { id });
  },

  // Timesheet operations
  async getTimesheetEntries(startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    return await invoke('get_timesheet_entries', { start_date: startDate, end_date: endDate });
  },

  async getEmployeeTimesheet(employeeId: string, startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    return await invoke('get_employee_timesheet', { employee_id: employeeId, start_date: startDate, end_date: endDate });
  },

  async saveTimesheetEntry(employeeId: string, employeeName: string, date: string, hours: number, notes: string): Promise<string> {
    return await invoke('save_timesheet_entry', { employee_id: employeeId, employee_name: employeeName, date, hours, notes });
  },

  // Current timesheet operations
  async getCurrentTimesheet(): Promise<CurrentTimesheet | null> {
    return await invoke('get_current_timesheet');
  },

  async setCurrentTimesheet(startDate: string, endDate: string): Promise<void> {
    return await invoke('set_current_timesheet', { start_date: startDate, end_date: endDate });
  },
};

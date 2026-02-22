# Implementation Plan: Clinic Timesheet Management System

## Phase 1: Environment & Schema Setup
- [x] Initialize Next.js project with TypeScript, Tailwind, and ShadCN.
- [x] Set up Docker Compose for a local PostgreSQL instance.
- [x] Configure Prisma schema:
    - `User` (id, name, username, passwordHash, role [ADMIN, EMPLOYEE], wageRate)
    - `TimesheetEntry` (id, userId, date, startTime, endTime, breakMinutes, paidHours)
    - `PayPeriod` (id, startDate, endDate, isLocked)
- [x] Run initial migrations and seed an Admin user.

## Phase 2: Authentication & Layout
- [x] Implement simple JWT or Cookie-based auth (NextAuth or custom).
- [x] Create responsive Layout with navigation sidebar (conditional links for Admin/Employee).
- [x] Build "Unauthorized" and "Loading" states using ShadCN components.

## Phase 3: Employee Features (Timesheet Entry)
- [x] Build Daily Entry Form:
    - Inputs for Date, Start Time, End Time.
    - Logic: Validate End > Start.
    - Logic: Apply 30-min break rule if > 5.5 hours.
- [x] Build "Home" View:
    - View of all employees.
    - Click the employee name to view their timesheet after a login prompt is displayed.
    - Display admin links to the admin dashboard.
    - Display current timesheet period
- [x] Build "My Timesheet" View:
    - Bi-weekly breakdown of the current active period.
    - Edit functionality (disabled if period is locked).
    - History view for past periods.

## Phase 4: Admin Features (Employee Management)
- [x] Employee CRUD Dashboard:
    - List view with search.
    - Create/Edit/Delete modals (Manage wages and roles).

## Phase 5: Admin Features (Timesheet & Payroll)
- [x] Consolidated Timesheet View:
    - Filter by employee or period.
    - Manual adjustment override for admins.
- [x] Pay Period Management:
    - Auto-generation of Sun-Sat periods.
    - Manual lock/unlock toggle.
- [x] CSV Export:
    - Generate payroll report (Employee Name, Total Paid Hours, Wage, Total Pay).

## Phase 6: Enhanced UX & Calendar Interface
- [x] **Kiosk-style Login Grid:**
    - Update the root route `/` to fetch all employees (public fields only: name, username).
    - Display as a responsive grid of cards/blocks.
    - Modal integration: Clicking a card opens a login dialog with the username prefilled.
- [x] **2-Week Calendar View Component:**
    - Create a 14-day grid mapping to the current Pay Period (Sun-Sat x2).
    - Navigation: Implement "Next" and "Previous" period logic.
    - Interaction: 
        - Empty cells: Click to open 'Add Entry' modal for that date.
        - Filled cells: Display duration/status; click to view/edit.
- [x] **Admin Global Calendar:**
    - Implementation of the same calendar component for Admin views.
    - Filter by employee to see their specific 2-week spread.
    - Consolidated view: A vertical list of employees, each having a mini-row version of the calendar.

## Phase 7: Polish & Security
- [x] Add loading indicators to all server actions.
- [x] Ensure Middleware protects `/admin` routes.
- [x] Final UI/UX audit for responsiveness.
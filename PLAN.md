# Implementation Plan: Clinic Timesheet Management System

## Phase 1: Environment & Schema Setup
- [ ] Initialize Next.js project with TypeScript, Tailwind, and ShadCN.
- [ ] Set up Docker Compose for a local PostgreSQL instance.
- [ ] Configure Prisma schema:
    - `User` (id, name, username, passwordHash, role [ADMIN, EMPLOYEE], wageRate)
    - `TimesheetEntry` (id, userId, date, startTime, endTime, breakMinutes, paidHours)
    - `PayPeriod` (id, startDate, endDate, isLocked)
- [ ] Run initial migrations and seed an Admin user.

## Phase 2: Authentication & Layout
- [ ] Implement simple JWT or Cookie-based auth (NextAuth or custom).
- [ ] Create responsive Layout with navigation sidebar (conditional links for Admin/Employee).
- [ ] Build "Unauthorized" and "Loading" states using ShadCN components.

## Phase 3: Employee Features (Timesheet Entry)
- [ ] Build Daily Entry Form:
    - Inputs for Date, Start Time, End Time.
    - Logic: Validate End > Start.
    - Logic: Apply 30-min break rule if > 5.5 hours.
- [ ] Build "Home" View:
    - View of all employees.
    - Click the employee name to view their timesheet after a login prompt is displayed.
    - Display admin links to the admin dashboard.
    - Display current timesheet period
- [ ] Build "My Timesheet" View:
    - Bi-weekly breakdown of the current active period.
    - Edit functionality (disabled if period is locked).
    - History view for past periods.

## Phase 4: Admin Features (Employee Management)
- [ ] Employee CRUD Dashboard:
    - List view with search.
    - Create/Edit/Delete modals (Manage wages and roles).

## Phase 5: Admin Features (Timesheet & Payroll)
- [ ] Consolidated Timesheet View:
    - Filter by employee or period.
    - Manual adjustment override for admins.
- [ ] Pay Period Management:
    - Auto-generation of Sun-Sat periods.
    - Manual lock/unlock toggle.
- [ ] CSV Export:
    - Generate payroll report (Employee Name, Total Paid Hours, Wage, Total Pay).

## Phase 6: Polish & Security
- [ ] Add loading indicators to all server actions.
- [ ] Ensure Middleware protects `/admin` routes.
- [ ] Final UI/UX audit for responsiveness.
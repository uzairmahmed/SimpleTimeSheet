# Implementation Plan: Clinic Timesheet Management System

## Phase 1: Environment & Schema Setup
- [X] Initialize Next.js project with TypeScript, Tailwind, and ShadCN.
- [X] Set up Docker Compose for a local PostgreSQL instance.
- [X] Configure Prisma schema:
    - `User` (id, name, username, passwordHash, role [ADMIN, EMPLOYEE], wageRate)
    - `TimesheetEntry` (id, userId, date, startTime, endTime, breakMinutes, paidHours)
    - `PayPeriod` (id, startDate, endDate, isLocked)
- [X] Run initial migrations and seed an Admin user.

## Phase 2: Authentication & Layout
- [X] Implement simple JWT or Cookie-based auth (NextAuth or custom).
- [X] Create responsive Layout with navigation sidebar (conditional links for Admin/Employee).
- [X] Build "Unauthorized" and "Loading" states using ShadCN components.

## Phase 3: Employee Features (Timesheet Entry)
- [X] Build Daily Entry Form:
    - Inputs for Date, Start Time, End Time.
    - Logic: Validate End > Start.
    - Logic: Apply 30-min break rule if > 5.5 hours.
- [X] Build "Home" View:
    - View of all employees.
    - Click the employee name to view their timesheet after a login prompt is displayed.
    - Display admin links to the admin dashboard.
    - Display current timesheet period
- [X] Build "My Timesheet" View:
    - Bi-weekly breakdown of the current active period.
    - Edit functionality (disabled if period is locked).
    - History view for past periods.

## Phase 4: Admin Features (Employee Management)
- [X] Employee CRUD Dashboard:
    - List view with search.
    - Create/Edit/Delete modals (Manage wages and roles).

## Phase 5: Admin Features (Timesheet & Payroll)
- [X] Consolidated Timesheet View:
    - Filter by employee or period.
    - Manual adjustment override for admins.
- [X] Pay Period Management:
    - Auto-generation of Sun-Sat periods.
    - Manual lock/unlock toggle.
- [X] CSV Export:
    - Generate payroll report (Employee Name, Total Paid Hours, Wage, Total Pay).

## Phase 6: UI Refinement
- [X] Calendar-like interface for timesheet entry.
    - Timesheets should be displayed in a bi-weekly calendar format, allowing users to open entry form by clicking on a specific date.
    - Retain existing list view in a "list-view" tab for users who prefer it.
- [X] Timesheet periods should be visually separated in the calendar view with arrows to navigate between them, with clear indicators for locked periods (grayed out).
- [X] Make use of space and layout more efficient, lots of white space
- [X] Consolidated timesheet view should be a calendar view instead of a table showing employee name with hours worked that day, and total hours on right for each employee.
- [X] Add a "Pay Period Summary" section to the admin dashboard showing total hours and payroll cost for the current period, with a breakdown by employee.
- [X] Employee list view should be as follows: Each row represents a day, 1 column for day, date, Start, end, break, paid hours. Admin consolidated list view will be the same except the start,end,break,paidhrs columns will be repeated, grouped by each employee.

## Phase 7: Pay period management refinement
- [X] Pay periods have to be created manually by admin, with a "Create New Pay Period" button that automatically sets the start date to the next day after the last period's end date, and the end date to 14 days later. Admin can adjust these dates before confirming creation.
- [X] When a pay period is locked, all timesheet entries within that period become read-only for employees, and admins can only make adjustments through a special "Adjustment" interface that logs all changes for audit purposes.
- [X] Add visual indicators in the calendar view for locked periods (e.g., grayed out, lock icon) and tooltips explaining the locked status, employees and admins can still flip back in the calendar to view past periods, but they will be read-only.
- [X] Calendar view must be two weeks at a time, with arrows to navigate between periods. When navigating to a new period, the view should automatically scroll to the current date if it falls within that period.

## Phase 8: Flow:
- [ ] Navigation
    - Homepage is the "who are you" page
    - When a user logs out, the page should redirect to the "who are you page" not LOGIN
- [ ] Follow a top navbar style view only. 
    - in the homepage: show the "Smiline Timesheet" with icon, and Admin sign in button in top right, page title in the middle ("User Selection" or something).
    - in the employee view, get rid of the sidebar, use top nav only. show the "Smiline Timesheet" with icon, EMPLOYEE, "My Timesheet" in the middle, "Firstname Lastname", and a sign out icon button
    - in the admin view, get rid of the sidebar, use top nav only. show the "Smiline Timesheet" with icon, ADMIN, nav links for each page, "Firstname Lastname", and a sign out icon button.
- [ ] Remove the need for separate login page. Just have the login form as a modal that appears.

## Phase 9: Prettyfying & UX Improvements
- [ ] Main page elements should be centered and use the full width of the page more effectively, reducing excessive whitespace.
- [ ] Ensure all buttons and interactive elements have clear hover and active states.
- [ ] Add tooltips or helper text where necessary for better user guidance.
- [ ] Use icons and visual cues to enhance usability (e.g., lock icons for locked periods, edit icons for editable entries).
- [ ] Use the following colors throughout the app for brand consistency:
    - Primary: #143d75 (blue)
    - Secondary: #3f9a91 (teal)
    - Accent: #b2a289 (tan)
    - Background: #f5f4ed (off-white)
    - Text: #143d75 (dark blue)

## Phase 10: Polish & Security
- [ ] Add loading indicators to all server actions.
- [ ] Consistent use of colors, fonts, and spacing across all components.
- [ ] Ensure Middleware protects `/admin` routes.
- [ ] Final UI/UX audit for responsiveness.
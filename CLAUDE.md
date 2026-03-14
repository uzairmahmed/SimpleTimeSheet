# Project: Clinic Timesheet Management System

## 🎯 Project Intent
A specialized payroll and attendance tracking platform designed for medical clinics. The system allows employees (staff/practitioners) to log daily shifts while ensuring admins can manage wages, lock pay periods for accounting integrity, and export payroll data. The primary goal is to automate the "5.5-hour break rule" and ensure 15-minute increment accuracy for provincial labor compliance. It should also follow a dead simple, intuitive UI/UX approach to minimize training for clinic staff.

## ⚖️ Accounting & Logic Rules (STRICT)
- **Break Logic**: If `worked_hours > 5.5`, subtract 30 mins (0.5h) for unpaid break. If ≤ 5.5, break = 0.
- **Pay Period**: Starts Sunday 00:00, Ends Saturday 23:59. 
- **Locking**: Auto-lock periods every Saturday at 11:59 PM. (Prevents retroactive editing).
- **Rounding**: Nearest 15-minute increment (0.25h).
- **Formulas**: `Total Pay = (Sum of daily paid hours) * wageRate`.
- **Formats**: Date: `YYYY-MM-DD`, Time: `HH:mm` (24h).

## 🛠 Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- ShadCN UI, Prisma ORM, PostgreSQL (Docker-based)

## 🏗 Architecture & Guidelines
- **Data Flow**: Use Server Actions for all mutations; strict RBAC checks for `ADMIN` vs `EMPLOYEE`.
- **Validation**: Zod schemas for all inputs; must validate that `endTime` is after `startTime`.
- **UI/UX**: Use `/components/ui` for ShadCN and `/components/shared` for business logic (e.g., TimesheetTable).
- **Type Safety**: No `any`. Explicitly type all Server Action responses.

## 🚀 Key Commands
- Dev: `npm run dev`
- Database: `npx prisma generate` | `npx prisma db push`
- Lint/Build: `npm run lint` | `npm run build`
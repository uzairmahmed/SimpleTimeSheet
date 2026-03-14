# Clinic Timesheet Management System

A payroll and attendance tracking platform for medical clinics. Automates the 5.5-hour break rule, enforces 15-minute increment rounding, and locks pay periods for accounting integrity.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **ORM**: Prisma 7
- **Database**: PostgreSQL 16 (Docker)
- **Runtime Driver**: `@prisma/adapter-pg`

---

## Prerequisites

- Node.js ≥ 18
- Docker & Docker Compose

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env` and update values if needed (defaults work for local Docker):

```
DATABASE_URL="postgresql://timesheet_user:timesheet_pass@localhost:5432/timesheet_db?schema=public"
NEXTAUTH_SECRET="change-me-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Push schema & seed

```bash
npx prisma db push
npm run db:seed
```

This creates all tables and seeds a default admin account:

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |
| Role     | `ADMIN`    |

> **Change the admin password after first login.**

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Commands

| Command                  | Description                           |
|--------------------------|---------------------------------------|
| `npm run dev`            | Start Next.js dev server              |
| `npm run build`          | Production build                      |
| `npm run lint`           | ESLint check                          |
| `npx prisma generate`    | Regenerate Prisma client              |
| `npx prisma db push`     | Sync schema to database (no migration)|
| `npm run db:seed`        | Seed default admin user               |
| `docker compose up -d`   | Start PostgreSQL container            |
| `docker compose down -v` | Stop and remove DB + volumes          |

---

## Database Schema

### `User`
| Column       | Type    | Notes                        |
|--------------|---------|------------------------------|
| id           | String  | CUID primary key             |
| name         | String  |                              |
| username     | String  | Unique                       |
| passwordHash | String  | bcrypt hash                  |
| role         | Role    | `ADMIN` or `EMPLOYEE`        |
| wageRate     | Decimal | Hourly rate (10,2 precision) |

### `TimesheetEntry`
| Column       | Type    | Notes                            |
|--------------|---------|----------------------------------|
| id           | String  | CUID primary key                 |
| userId       | String  | FK → User                        |
| date         | String  | `YYYY-MM-DD`                     |
| startTime    | String  | `HH:mm` (24h)                    |
| endTime      | String  | `HH:mm` (24h)                    |
| breakMinutes | Int     | 0 or 30 (auto-calculated)        |
| paidHours    | Decimal | Rounded to nearest 0.25h        |

One entry per employee per day (`@@unique([userId, date])`).

### `PayPeriod`
| Column    | Type    | Notes                      |
|-----------|---------|----------------------------|
| id        | String  | CUID primary key           |
| startDate | String  | `YYYY-MM-DD` (Sunday)      |
| endDate   | String  | `YYYY-MM-DD` (Saturday)    |
| isLocked  | Boolean | Prevents retroactive edits |

---

## Business Logic Rules

- **Break**: If `worked_hours > 5.5` → deduct 30 min unpaid. Otherwise break = 0.
- **Rounding**: All hours rounded to nearest 15-minute increment (0.25h).
- **Pay Period**: Sunday 00:00 → Saturday 23:59.
- **Auto-lock**: Periods lock every Saturday at 11:59 PM.
- **Total Pay**: `Sum of daily paidHours × wageRate`.

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # ShadCN UI primitives
│   └── shared/       # Business-logic components (TimesheetTable, etc.)
├── lib/
│   ├── prisma.ts     # Prisma singleton client
│   └── utils.ts      # cn() utility
└── generated/
    └── prisma/       # Auto-generated Prisma client (do not edit)

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Admin seed script
```

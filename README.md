# Clinic Timesheet Management System

Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN-style UI, Prisma, PostgreSQL.

## Phase 1 & 2 (Done)

- Next.js + TypeScript + Tailwind + ShadCN-style components
- Docker Compose for PostgreSQL
- Prisma schema: `User`, `TimesheetEntry`, `PayPeriod`
- NextAuth credentials (username/password), JWT session
- Responsive layout with role-based sidebar (Admin / Employee)
- Unauthorized and Loading states

## Setup

### 1. Environment

```bash
cp .env.example .env
# Edit .env and set NEXTAUTH_SECRET (e.g. `openssl rand -base64 32`)
```

### 2. Database

Start PostgreSQL:

```bash
docker compose up -d
```

Apply migrations and seed admin user:

```bash
npm run db:migrate
npm run db:seed
```

Default admin: **username** `admin`, **password** `admin123`. Change in production.

### 3. Run app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as admin to reach `/admin`.

## Scripts

- `npm run dev` – dev server (Turbopack)
- `npm run build` / `npm run start` – production
- `npm run db:generate` – Prisma generate
- `npm run db:push` – push schema (no migrations)
- `npm run db:migrate` – run migrations
- `npm run db:seed` – seed admin user
- `npm run db:studio` – Prisma Studio

## Project rules

See `.cursorrules` for accounting rules (break logic, pay period, rounding) and coding guidelines.

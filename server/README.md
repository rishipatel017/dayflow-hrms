# DayFlow HRMS Backend

This is the Node.js backend for the DayFlow HRMS, built with Express, Prisma, and PostgreSQL.

## Prerequisites
- Node.js (v16+)
- PostgreSQL installed and running

## Setup Instructions

1. **Configure Environment**
   Open `server/.env` and set your `DATABASE_URL`.
   Example: `DATABASE_URL="postgresql://user:password@localhost:5432/dayflow_db?schema=public"`

2. **Run Migrations**
   Generate the database schema and Prisma client:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed Database**
   Populate the database with initial mock data:
   ```bash
   npm run seed
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Setup Admin
- `GET /api/users` - Get all users
- `GET /api/attendance/today/:userId` - Get today's attendance
- `POST /api/attendance/check-in` - Check In
- `POST /api/attendance/check-out` - Check Out
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Request leave
- `GET /api/salaries/:userId` - Get salary structure

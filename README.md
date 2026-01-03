# Dayflow HRMS

Dayflow is a modern, comprehensive Human Resource Management System designed to digitize and streamline core HR operations including employee onboarding, profile management, attendance tracking, leave management, and payroll visibility.

## Project Status

**Current State:** Frontend Complete / Backend Mocked.  
The application is fully functional using a client-side mock database (`services/mockDb.ts`) that simulates asynchronous network latency.

### Completed Features (Frontend & Logic)

Based on the functional requirements:

**1. Authentication & Authorization**
- [x] **Sign Up:** Companies/Admins can register a new organization (Mocked logic).
- [x] **Sign In:** Secure login with error handling.
- [x] **Role-Based Access:** Distinct interfaces and permissions for `ADMIN` and `EMPLOYEE`.

**2. Dashboard**
- [x] **Employee View:** Quick access cards for Profile, Attendance, and Leave balances.
- [x] **Admin View:** Employee directory grid with search functionality and status indicators.

**3. Profile Management**
- [x] **View Profile:** Tabbed interface for Resume, Personal Info, and Bank Details.
- [x] **Salary Visibility:** Employees can view their salary breakdown (Earnings/Deductions).
- [x] **Admin Controls:** Admins can edit salary structures for employees.
- [x] **Security:** Segregation of Duties enforced (Admins cannot edit their own salary).

**4. Attendance Management**
- [x] **Tracking:** "Check In" / "Check Out" functionality with timer logic.
- [x] **Logs:** Daily attendance logs with Work Hours and Extra Hours calculation.
- [x] **Views:** Employees see their own history; Admins see daily records for all staff.

**5. Leave & Time-Off**
- [x] **Application:** Employees can apply for Paid, Sick, or Unpaid leave.
- [x] **Balances:** Visual cards showing available time-off balances (Employee view).
- [x] **Workflow:** Admins can Approve or Reject pending requests.
- [x] **Status:** Immediate UI updates upon status change.

**6. Payroll Management**
- [x] **Structure:** Automated calculation of Basic, HRA, PF, and Prof Tax based on CTC.
- [x] **Privacy:** Read-only for employees; Write-access for admins.

---

### Backend Implementation Roadmap (To Do)

The application currently relies on `localStorage` and `setTimeout` to mimic a backend. To go to production, the backend architecture needs to be built.


| Resource     | Endpoint                         | Method | Description |
|--------------|----------------------------------|--------|-------------|
| **Auth**     | `/auth/login`                    | POST   | Authenticate user and generate JWT |
|              | `/auth/signup`                   | POST   | Register a new user |
| **Users**    | `/users`                         | GET    | Fetch all users |
|              | `/users/:id`                     | GET    | Fetch user by ID |
|              | `/users`                         | POST   | User onboarding / create user |
| **Profiles** | `/profiles/:userId`              | GET    | Get user profile details |
|              | `/profiles/:userId`              | PATCH  | Update user profile |
| **Attendance** | `/attendance/check-in`         | POST   | User check-in |
|              | `/attendance/check-out`          | POST   | User check-out |
|              | `/attendance`                    | GET    | View attendance records |
| **Leaves**   | `/leaves`                        | GET    | Fetch leave requests |
|              | `/leaves`                        | POST   | Create leave request |
|              | `/leaves/:id/status`             | PATCH  | Approve or reject leave |
| **Salary**   | `/salary/:userId`                | GET    | Get salary details |
|              | `/salary/:userId`                | PUT    | Update salary details |

#### 3. Pending Functional Requirements
These features were outlined in the requirements but require real backend/storage integration:
- [ ] **Email Verification:** Send actual emails upon signup.
- [ ] **Document Storage:** Implement file upload (S3/Blob storage) for Profile Documents and Leave Attachments.
- [ ] **Password Hashing:** Currently storing plain strings in mock DB; needs `bcrypt`/`argon2` on backend.

---

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM v7

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   npm install --prefix server
   ```

2. **Start Development Server (Frontend + Backend):**
   ```bash
   npm run dev
   ```
   This single command will start both the Vite frontend (port 5173/3000) and the Express backend (port 5000) concurrently.

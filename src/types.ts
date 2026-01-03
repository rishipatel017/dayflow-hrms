export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
}

export enum LeaveType {
  PAID = 'PAID',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string; // UUID
  employeeId: string; // Custom Format [OI][F2][L2][Year][Serial]
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  joiningDate: string; // ISO Date
  profilePictureUrl: string;
  passwordHash: string; 
}

export interface EmployeeProfile {
  userId: string;
  address: string;
  phone: string;
  jobPosition: string;
  department: string;
  managerId?: string;
  bankAccountNo: string;
  ifsc: string;
  pan: string;
  uan: string;
  maritalStatus?: string;
  nationality?: string;
  personalEmail?: string;
  gender?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO
  checkOutTime?: string; // ISO
  workHours: number;
  status: AttendanceStatus;
  extraHours?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
  attachmentUrl?: string;
  approvalDate?: string;
  approverId?: string;
}

export interface SalaryStructure {
  userId: string;
  totalWage: number; // Monthly CTC
  yearlyWage: number;
  workingDaysPerWeek: number;
  
  // Earnings
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  travelAllowance: number;
  fixedAllowance: number;
  
  // Deductions (Calculated)
  pfEmployee: number;
  pfEmployer: number;
  profTax: number;
}

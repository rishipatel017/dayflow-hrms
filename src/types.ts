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
  isEmailVerified: boolean;
  verificationToken?: string;
  totalWage?: number; // For onboarding transit
  profile?: EmployeeProfile;
  salary?: SalaryStructure;
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
  skills: string[];
  documents?: { name: string; url: string; type?: string }[];
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
  breakTime: number;

  // Configuration
  basicType: 'fixed' | 'percent';
  basicValue: number;
  hraType: 'fixed' | 'percent'; // percent of basic
  hraValue: number;
  stdType: 'fixed' | 'percent';
  stdValue: number;
  bonusType: 'fixed' | 'percent';
  bonusValue: number;
  ltaType: 'fixed' | 'percent';
  ltaValue: number;
  pfRate: number;
  profTax: number;

  // Earnings (Calculated/Stored)
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  travelAllowance: number;
  fixedAllowance: number;

  // Deductions (Calculated/Stored)
  pfEmployee: number;
  pfEmployer: number;
}

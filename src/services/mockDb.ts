import { User, Role, EmployeeProfile, Attendance, AttendanceStatus, LeaveRequest, LeaveStatus, LeaveType, SalaryStructure } from '../types';

// --- LOCAL STORAGE HELPERS (Internal Database) ---
const STORAGE_KEYS = {
  USERS: 'dayflow_users',
  PROFILES: 'dayflow_profiles',
  SALARIES: 'dayflow_salaries',
  LEAVES: 'dayflow_leaves',
  ATTENDANCE: 'dayflow_attendance',
  COMPANY: 'dayflow_company'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadData = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- INITIAL MOCK DATA ---
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    employeeId: 'OIALAD20220001',
    email: 'admin@dayflow.com',
    role: Role.ADMIN,
    firstName: 'Alice',
    lastName: 'Admin',
    joiningDate: '2022-01-01',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=u1',
    passwordHash: 'admin123'
  },
  {
    id: 'u2',
    employeeId: 'OIJODO20230001',
    email: 'john@dayflow.com',
    role: Role.EMPLOYEE,
    firstName: 'John',
    lastName: 'Doe',
    joiningDate: '2023-03-15',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=u2',
    passwordHash: 'user123'
  }
];

const MOCK_PROFILES: EmployeeProfile[] = [
  {
    userId: 'u1', address: '123 Admin St', phone: '9876543210', jobPosition: 'HR Manager', department: 'Human Resources',
    bankAccountNo: '123456789', ifsc: 'HDFC0001', pan: 'ABCDE1234F', uan: '100000001', maritalStatus: 'Single', nationality: 'Indian'
  },
  {
    userId: 'u2', address: '456 User Ln', phone: '9876543211', jobPosition: 'Software Engineer', department: 'Engineering', managerId: 'u1',
    bankAccountNo: '987654321', ifsc: 'SBIN0001', pan: 'FGHIJ5678K', uan: '100000002', maritalStatus: 'Married', nationality: 'Indian'
  }
];

const MOCK_SALARIES: SalaryStructure[] = MOCK_USERS.map(u => ({
    userId: u.id,
    totalWage: u.role === Role.ADMIN ? 80000 : 50000,
    yearlyWage: (u.role === Role.ADMIN ? 80000 : 50000) * 12,
    workingDaysPerWeek: 5,
    basic: (u.role === Role.ADMIN ? 80000 : 50000) * 0.5,
    hra: ((u.role === Role.ADMIN ? 80000 : 50000) * 0.5) * 0.5,
    standardAllowance: 2000,
    performanceBonus: 0,
    travelAllowance: 1500,
    fixedAllowance: 0, // Simplified
    pfEmployee: 1800,
    pfEmployer: 1800,
    profTax: 200
}));

// --- BUSINESS LOGIC HELPERS ---
const generateEmployeeId = (firstName: string, lastName: string, joiningDate: string): string => {
  const companyTag = 'OI';
  const f2 = firstName.substring(0, 2).toUpperCase();
  const l2 = lastName.substring(0, 2).toUpperCase();
  const year = new Date(joiningDate).getFullYear();
  
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  const count = users.filter((u: User) => u.joiningDate.startsWith(year.toString())).length + 1;
  const serial = count.toString().padStart(4, '0');
  
  return `${companyTag}${f2}${l2}${year}${serial}`;
};

// --- ASYNC API CLIENT ---
// This mocks a real backend. All methods return Promises.

export const api = {
  auth: {
    login: async (email: string, pass: string): Promise<User | null> => {
      await delay(500);
      const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
      const user = users.find((u: User) => (u.email === email || u.employeeId === email) && u.passwordHash === pass);
      return user || null;
    },
    
    signup: async (companyName: string, adminData: Partial<User>, phone: string): Promise<User> => {
      await delay(800);
      const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
      const profiles = loadData(STORAGE_KEYS.PROFILES, MOCK_PROFILES);
      const salaries = loadData(STORAGE_KEYS.SALARIES, MOCK_SALARIES);

      // Save Company Info (Mock)
      saveData(STORAGE_KEYS.COMPANY, { name: companyName });

      const newId = `u${Date.now()}`;
      const joiningDate = new Date().toISOString().split('T')[0];
      const employeeId = generateEmployeeId(adminData.firstName!, adminData.lastName!, joiningDate);

      const newUser: User = {
        id: newId,
        employeeId,
        email: adminData.email!,
        passwordHash: adminData.passwordHash!,
        firstName: adminData.firstName!,
        lastName: adminData.lastName!,
        role: Role.ADMIN,
        joiningDate,
        profilePictureUrl: `https://i.pravatar.cc/150?u=${newId}`,
      };

      const newProfile: EmployeeProfile = {
        userId: newId,
        address: '', phone: phone, jobPosition: 'Admin', department: 'Management',
        bankAccountNo: '', ifsc: '', pan: '', uan: ''
      };

      // Basic Salary Structure
      const newSalary: SalaryStructure = {
         userId: newId, totalWage: 0, yearlyWage: 0, workingDaysPerWeek: 5,
         basic: 0, hra: 0, standardAllowance: 0, performanceBonus: 0,
         travelAllowance: 0, fixedAllowance: 0, pfEmployee: 0, pfEmployer: 0, profTax: 0
      };

      users.push(newUser);
      profiles.push(newProfile);
      salaries.push(newSalary);

      saveData(STORAGE_KEYS.USERS, users);
      saveData(STORAGE_KEYS.PROFILES, profiles);
      saveData(STORAGE_KEYS.SALARIES, salaries);

      return newUser;
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      await delay(300);
      return loadData(STORAGE_KEYS.USERS, MOCK_USERS);
    },
    getById: async (id: string): Promise<User | undefined> => {
      await delay(200);
      const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
      return users.find((u: User) => u.id === id);
    },
    create: async (userData: Partial<User>, profileData: Partial<EmployeeProfile>): Promise<User> => {
      await delay(600);
      const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
      const profiles = loadData(STORAGE_KEYS.PROFILES, MOCK_PROFILES);
      const salaries = loadData(STORAGE_KEYS.SALARIES, MOCK_SALARIES);

      const newId = `u${Date.now()}`;
      const employeeId = generateEmployeeId(userData.firstName!, userData.lastName!, userData.joiningDate!);
      
      const newUser: User = {
        id: newId,
        employeeId,
        passwordHash: 'user123', // Default
        role: Role.EMPLOYEE,
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        joiningDate: userData.joiningDate!,
        profilePictureUrl: `https://i.pravatar.cc/150?u=${newId}`,
        ...userData
      } as User;

      const newProfile: EmployeeProfile = {
        userId: newId,
        address: '', phone: '', jobPosition: 'Employee', department: 'General',
        bankAccountNo: '', ifsc: '', pan: '', uan: '',
        ...profileData
      } as EmployeeProfile;

      const newSalary: SalaryStructure = {
         userId: newId, totalWage: 0, yearlyWage: 0, workingDaysPerWeek: 5,
         basic: 0, hra: 0, standardAllowance: 0, performanceBonus: 0,
         travelAllowance: 0, fixedAllowance: 0, pfEmployee: 0, pfEmployer: 0, profTax: 0
      };

      users.push(newUser);
      profiles.push(newProfile);
      salaries.push(newSalary);

      saveData(STORAGE_KEYS.USERS, users);
      saveData(STORAGE_KEYS.PROFILES, profiles);
      saveData(STORAGE_KEYS.SALARIES, salaries);

      return newUser;
    }
  },

  profiles: {
    getAll: async (): Promise<EmployeeProfile[]> => {
      await delay(300);
      return loadData(STORAGE_KEYS.PROFILES, MOCK_PROFILES);
    },
    getByUserId: async (userId: string): Promise<EmployeeProfile | undefined> => {
      await delay(200);
      const profiles = loadData(STORAGE_KEYS.PROFILES, MOCK_PROFILES);
      return profiles.find((p: EmployeeProfile) => p.userId === userId);
    }
  },

  attendance: {
    getAll: async (): Promise<Attendance[]> => {
      await delay(300);
      return loadData(STORAGE_KEYS.ATTENDANCE, []);
    },
    checkIn: async (userId: string): Promise<void> => {
      await delay(400);
      const attendance = loadData(STORAGE_KEYS.ATTENDANCE, []);
      const today = new Date().toISOString().split('T')[0];
      
      if (!attendance.find((a: Attendance) => a.userId === userId && a.date === today)) {
        attendance.push({
          id: `a${Date.now()}`,
          userId,
          date: today,
          checkInTime: new Date().toISOString(),
          status: AttendanceStatus.PRESENT,
          workHours: 0,
          extraHours: 0
        });
        saveData(STORAGE_KEYS.ATTENDANCE, attendance);
      }
    },
    checkOut: async (userId: string): Promise<void> => {
      await delay(400);
      const attendance = loadData(STORAGE_KEYS.ATTENDANCE, []);
      const today = new Date().toISOString().split('T')[0];
      const record = attendance.find((a: Attendance) => a.userId === userId && a.date === today);

      if (record && !record.checkOutTime) {
        const now = new Date();
        record.checkOutTime = now.toISOString();
        const start = new Date(record.checkInTime!);
        const diffMs = now.getTime() - start.getTime();
        const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        record.workHours = hours;
        record.extraHours = hours > 9 ? parseFloat((hours - 9).toFixed(2)) : 0;
        saveData(STORAGE_KEYS.ATTENDANCE, attendance);
      }
    },
    getForUserToday: async (userId: string): Promise<Attendance | undefined> => {
      await delay(200);
      const attendance = loadData(STORAGE_KEYS.ATTENDANCE, []);
      const today = new Date().toISOString().split('T')[0];
      return attendance.find((a: Attendance) => a.userId === userId && a.date === today);
    }
  },

  leaves: {
    getAll: async (): Promise<LeaveRequest[]> => {
      await delay(300);
      return loadData(STORAGE_KEYS.LEAVES, []);
    },
    create: async (request: Partial<LeaveRequest>): Promise<void> => {
      await delay(400);
      const leaves = loadData(STORAGE_KEYS.LEAVES, []);
      leaves.push({
        id: `l${Date.now()}`,
        status: LeaveStatus.PENDING,
        ...request
      });
      saveData(STORAGE_KEYS.LEAVES, leaves);
    },
    updateStatus: async (id: string, approverId: string, status: LeaveStatus): Promise<void> => {
      await delay(300);
      const leaves = loadData(STORAGE_KEYS.LEAVES, []);
      const leave = leaves.find((l: LeaveRequest) => l.id === id);
      if (leave) {
        leave.status = status;
        leave.approverId = approverId;
        leave.approvalDate = new Date().toISOString();
        saveData(STORAGE_KEYS.LEAVES, leaves);
      }
    }
  },

  salaries: {
    getByUserId: async (userId: string): Promise<SalaryStructure | undefined> => {
      await delay(300);
      const salaries = loadData(STORAGE_KEYS.SALARIES, MOCK_SALARIES);
      return salaries.find((s: SalaryStructure) => s.userId === userId);
    },
    update: async (userId: string, totalWage: number): Promise<SalaryStructure> => {
      await delay(500);
      const salaries = loadData(STORAGE_KEYS.SALARIES, MOCK_SALARIES);
      
      const basic = totalWage * 0.50;
      const hra = basic * 0.50;
      const standardAllowance = 2000;
      const pfEmployee = basic * 0.12;
      const pfEmployer = basic * 0.12;
      const profTax = 200;
      const otherComponents = basic + hra + standardAllowance;
      const fixedAllowance = Math.max(0, totalWage - otherComponents);

      const newStructure: SalaryStructure = { 
          userId, 
          totalWage, 
          yearlyWage: totalWage * 12,
          workingDaysPerWeek: 5, 
          basic, 
          hra, 
          standardAllowance,
          fixedAllowance,
          performanceBonus: 0,
          travelAllowance: 0,
          pfEmployee,
          pfEmployer,
          profTax
      };
      
      const index = salaries.findIndex((s: SalaryStructure) => s.userId === userId);
      if (index >= 0) salaries[index] = newStructure;
      else salaries.push(newStructure);
      
      saveData(STORAGE_KEYS.SALARIES, salaries);
      return newStructure;
    }
  }
};

// Kept for backward compat in strict mode if any
export const db = api; 

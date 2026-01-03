import { User, Role, EmployeeProfile, Attendance, AttendanceStatus, LeaveRequest, LeaveStatus, LeaveType, SalaryStructure } from '../types';

const API_Base = 'http://localhost:5000/api';

// --- HELPER FUNCTIONS ---
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUserId');
    // window.location.href = '/login'; // Optional: Redirect to login
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

const mapUser = (data: any): User => ({
  id: data.id,
  employeeId: data.employee_id,
  email: data.email,
  role: data.role as Role,
  firstName: data.first_name,
  lastName: data.last_name,
  joiningDate: data.joining_date ? data.joining_date.split('T')[0] : '', // Handle date format
  profilePictureUrl: data.profile_picture_url,
  passwordHash: '' // Security: Don't expose hash
});

const mapProfile = (data: any): EmployeeProfile => ({
  userId: data.user_id,
  address: data.address,
  phone: data.phone,
  jobPosition: data.job_position,
  department: data.department,
  managerId: data.manager_id,
  bankAccountNo: data.bank_account_no,
  ifsc: data.ifsc,
  pan: data.pan,
  uan: data.uan,
  maritalStatus: data.marital_status,
  nationality: data.nationality,
  personalEmail: data.email, // Using main email as personal for now if not separate
  gender: '' // Not in DB
});

const mapAttendance = (data: any): Attendance => ({
  id: data.id,
  userId: data.user_id,
  date: data.date ? data.date.split('T')[0] : '',
  checkInTime: data.check_in_time,
  checkOutTime: data.check_out_time,
  workHours: data.work_hours ? parseFloat(data.work_hours) : 0,
  status: data.status as AttendanceStatus,
  extraHours: data.extra_hours ? parseFloat(data.extra_hours) : 0
});

const mapLeave = (data: any): LeaveRequest => ({
  id: data.id,
  userId: data.user_id,
  type: data.leave_type as LeaveType,
  startDate: data.start_date ? data.start_date.split('T')[0] : '',
  endDate: data.end_date ? data.end_date.split('T')[0] : '',
  status: data.status as LeaveStatus,
  reason: data.reason,
  approverId: data.approver_id,
  approvalDate: data.approval_date
});

const mapSalary = (data: any): SalaryStructure => ({
  userId: data.user_id,
  totalWage: parseFloat(data.total_wage),
  yearlyWage: parseFloat(data.yearly_wage),
  workingDaysPerWeek: data.working_days_per_week,
  basic: parseFloat(data.basic),
  hra: parseFloat(data.hra),
  standardAllowance: parseFloat(data.standard_allowance),
  performanceBonus: parseFloat(data.performance_bonus),
  travelAllowance: parseFloat(data.travel_allowance),
  fixedAllowance: parseFloat(data.fixed_allowance),
  pfEmployee: parseFloat(data.pf_employee),
  pfEmployer: parseFloat(data.pf_employer),
  profTax: parseFloat(data.prof_tax)
});

// --- API CLIENT ---

export const api = {
  auth: {
    login: async (email: string, pass: string): Promise<User | null> => {
      try {
        const res = await fetch(`${API_Base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
        });
        if (!res.ok) {
          if (res.status === 401) return null;
          throw new Error('Login failed');
        }
        const data = await res.json();
        // Store Token
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        return mapUser(data);
      } catch (e) {
        console.error("Login Error", e);
        return null;
      }
    },

    signup: async (companyName: string, adminData: any, phone: string, file?: File): Promise<User> => {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('adminData', JSON.stringify(adminData));
      formData.append('phone', phone);
      if (file) {
        formData.append('profilePicture', file);
      }

      const res = await fetch(`${API_Base}/auth/signup`, {
        method: 'POST',
        // headers: { 'Content-Type': 'multipart/form-data' }, // Browser sets this automatically with boundary
        body: formData,
      });
      const data = await handleResponse(res);
      // Store Token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      return mapUser(data);
    },

    resetPassword: async (userId: string, newPass: string): Promise<void> => {
      const res = await fetch(`${API_Base}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ userId, newPass })
      });
      await handleResponse(res);
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const res = await fetch(`${API_Base}/users`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(res);
      return data.map(mapUser);
    },
    getById: async (id: string): Promise<User | undefined> => {
      const res = await fetch(`${API_Base}/users/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 404) return undefined;
      const data = await handleResponse(res);
      return mapUser(data);
    },
    create: async (userData: Partial<User>, profileData: Partial<EmployeeProfile>): Promise<User> => {
      const res = await fetch(`${API_Base}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ userData, profileData }),
      });
      const data = await handleResponse(res);
      return mapUser(data);
    },

    update: async (id: string, data: any, file?: File): Promise<void> => {
      let body;
      let headers: any = getAuthHeaders();

      if (file) {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        formData.append('profilePicture', file);
        body = formData;
        // Content-Type header not set for FormData
      } else {
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_Base}/users/${id}`, {
        method: 'PUT',
        headers,
        body
      });
      await handleResponse(res);
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_Base}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleResponse(res);
    }
  },

  profiles: {
    getAll: async (): Promise<EmployeeProfile[]> => {
      const res = await fetch(`${API_Base}/users`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(res);
      return data.map(mapProfile);
    },
    getByUserId: async (userId: string): Promise<EmployeeProfile | undefined> => {
      const res = await fetch(`${API_Base}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return mapProfile(data);
    }
  },

  attendance: {
    getAll: async (): Promise<Attendance[]> => {
      const res = await fetch(`${API_Base}/attendance`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(res);
      return data.map(mapAttendance);
    },
    checkIn: async (userId: string): Promise<void> => {
      await fetch(`${API_Base}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ userId }),
      }).then(handleResponse);
    },
    checkOut: async (userId: string): Promise<void> => {
      await fetch(`${API_Base}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ userId }),
      }).then(handleResponse);
    },
    getForUserToday: async (userId: string): Promise<Attendance | undefined> => {
      const res = await fetch(`${API_Base}/attendance/user/${userId}/today`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data ? mapAttendance(data) : undefined;
    }
  },

  leaves: {
    getAll: async (): Promise<LeaveRequest[]> => {
      const res = await fetch(`${API_Base}/leaves`, {
        headers: getAuthHeaders()
      });
      const data = await handleResponse(res);
      return data.map(mapLeave);
    },
    create: async (request: Partial<LeaveRequest>): Promise<void> => {
      await fetch(`${API_Base}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(request),
      }).then(handleResponse);
    },
    updateStatus: async (id: string, approverId: string, status: LeaveStatus): Promise<void> => {
      await fetch(`${API_Base}/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ approverId, status }),
      }).then(handleResponse);
    }
  },

  salaries: {
    getByUserId: async (userId: string): Promise<SalaryStructure | undefined> => {
      const res = await fetch(`${API_Base}/salaries/user/${userId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data ? mapSalary(data) : undefined;
    },
    update: async (userId: string, totalWage: number): Promise<SalaryStructure> => {
      const res = await fetch(`${API_Base}/salary/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ totalWage })
      });
      const data = await handleResponse(res);
      return {
        id: `s${Date.now()}`,
        userId: userId,
        ...data
      };
    }
  },

  seed: {
    attendance: async (): Promise<void> => {
      await fetch(`${API_Base}/seed/attendance`, { method: 'POST', headers: getAuthHeaders() });
      await fetch(`${API_Base}/seed/leaves`, { method: 'POST', headers: getAuthHeaders() });
    }
  },

  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_Base}/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};

export const db = api;

import axios from 'axios';
import { User, EmployeeProfile, Attendance, LeaveRequest, LeaveStatus, SalaryStructure } from '../types';

const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for tokens if we implement them later
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    auth: {
        login: async (email: string, pass: string): Promise<{ user: User; company: { name: string; logo: string | null } } | null> => {
            try {
                const response = await axiosInstance.post('/auth/login', { email, password: pass });
                localStorage.setItem('dayflow_token', response.data.token);
                return { user: response.data.user, company: response.data.company };
            } catch (error) {
                console.error('Login failed:', error);
                return null;
            }
        },

        signup: async (companyName: string, adminData: Partial<User>, phone: string, logo: File | null): Promise<User> => {
            const formData = new FormData();
            formData.append('companyName', companyName);
            formData.append('firstName', adminData.firstName || '');
            formData.append('lastName', adminData.lastName || '');
            formData.append('email', adminData.email || '');
            formData.append('password', (adminData as any).passwordHash || '');
            formData.append('phone', phone);
            if (logo) formData.append('logo', logo);

            const response = await axiosInstance.post('/auth/signup', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.user;
        },

        verifyEmail: async (token: string): Promise<any> => {
            const response = await axiosInstance.get(`/auth/verify-email/${token}`);
            return response.data;
        }
    },

    users: {
        getAll: async (): Promise<User[]> => {
            const response = await axiosInstance.get('/users');
            return response.data;
        },
        getById: async (id: string): Promise<User | undefined> => {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data;
        },
        create: async (userData: Partial<User>, profileData: Partial<EmployeeProfile>): Promise<User> => {
            const response = await axiosInstance.post('/users', { userData, profileData });
            return response.data;
        },
        updateProfile: async (id: string, userData: Partial<User>, profileData: Partial<EmployeeProfile>): Promise<User> => {
            const response = await axiosInstance.put(`/users/${id}/profile`, { userData, profileData });
            return response.data;
        },
        changePassword: async (userId: string, data: any) => {
            const response = await axiosInstance.post(`/users/${userId}/change-password`, data);
            return response.data;
        },
        uploadDocument: async (userId: string, file: File, name: string, type: string) => {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('name', name);
            formData.append('type', type);
            const response = await axiosInstance.post(`/users/${userId}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        deleteDocument: async (userId: string, url: string) => {
            const response = await axiosInstance.delete(`/users/${userId}/documents`, { data: { url } });
            return response.data;
        },
        delete: async (id: string) => {
            const response = await axiosInstance.delete(`/users/${id}`);
            return response.data;
        }
    },

    profiles: {
        getAll: async (): Promise<EmployeeProfile[]> => {
            // Assuming users/getAll returns users with profiles
            const users = await api.users.getAll();
            return users.map((u: any) => u.profile).filter(Boolean);
        },
        getByUserId: async (userId: string): Promise<EmployeeProfile | undefined> => {
            const user = await api.users.getById(userId) as any;
            return user?.profile;
        },
        uploadImage: async (userId: string, file: File): Promise<{ imageUrl: string }> => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('userId', userId);
            const response = await axiosInstance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
    },

    attendance: {
        getAll: async (): Promise<Attendance[]> => {
            const response = await axiosInstance.get('/attendance');
            return response.data;
        },
        checkIn: async (userId: string): Promise<void> => {
            await axiosInstance.post('/attendance/check-in', { userId });
        },
        checkOut: async (userId: string): Promise<void> => {
            await axiosInstance.post('/attendance/check-out', { userId });
        },
        getForUserToday: async (userId: string): Promise<Attendance | undefined> => {
            const response = await axiosInstance.get(`/attendance/today/${userId}`);
            return response.data;
        }
    },

    leaves: {
        getAll: async (): Promise<LeaveRequest[]> => {
            const response = await axiosInstance.get('/leaves');
            return response.data;
        },
        create: async (request: any, attachment?: File): Promise<void> => {
            const formData = new FormData();
            Object.keys(request).forEach(key => formData.append(key, request[key]));
            if (attachment) formData.append('attachment', attachment);

            await axiosInstance.post('/leaves', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        updateStatus: async (id: string, approverId: string, status: LeaveStatus, approverRemarks?: string): Promise<void> => {
            await axiosInstance.patch(`/leaves/${id}/status`, { approverId, status, approverRemarks });
        }
    },

    salaries: {
        getByUserId: async (userId: string): Promise<SalaryStructure | undefined> => {
            const response = await axiosInstance.get(`/salaries/${userId}`);
            return response.data;
        },
        update: async (userId: string, salaryData: Partial<SalaryStructure>): Promise<SalaryStructure> => {
            const response = await axiosInstance.put(`/salaries/${userId}`, salaryData);
            return response.data;
        }
    }
};

export const db = api;

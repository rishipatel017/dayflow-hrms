import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  company: { name: string; logo: string | null } | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (companyName: string, adminData: Partial<User>, phone: string, logo: File | null) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [company, setCompany] = useState<{ name: string; logo: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dayflow_token');
      if (token) {
        try {
          const storedUser = localStorage.getItem('dayflow_user');
          const storedCompany = localStorage.getItem('dayflow_company');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
          if (storedCompany) {
            setCompany(JSON.parse(storedCompany));
          }
        } catch (e) {
          console.error("Failed to restore session", e);
          localStorage.removeItem('dayflow_token');
          localStorage.removeItem('dayflow_user');
          localStorage.removeItem('dayflow_company');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(email, pass);
      if (response && response.user) {
        setCurrentUser(response.user);
        setCompany(response.company || { name: 'Dayflow', logo: null });
        localStorage.setItem('dayflow_user', JSON.stringify(response.user));
        localStorage.setItem('dayflow_company', JSON.stringify(response.company));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const signup = async (companyName: string, adminData: Partial<User>, phone: string, logo: File | null): Promise<boolean> => {
    try {
      const user = await api.auth.signup(companyName, adminData, phone, logo);
      if (user) {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCompany(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    localStorage.removeItem('dayflow_company');
  };

  return (
    <AuthContext.Provider value={{ currentUser, company, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

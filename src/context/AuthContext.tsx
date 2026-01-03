import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/mockDb';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (companyName: string, adminData: Partial<User>, phone: string, file?: File) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (useEffect remains same) ...
  useEffect(() => {
    const initAuth = async () => {
      const storedId = localStorage.getItem('currentUserId');
      if (storedId) {
        try {
          const user = await api.users.getById(storedId);
          if (user) setCurrentUser(user);
        } catch (e) {
          console.error("Failed to restore session", e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const user = await api.auth.login(email, pass);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.id);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const signup = async (companyName: string, adminData: Partial<User>, phone: string, file?: File): Promise<boolean> => {
    try {
      const user = await api.auth.signup(companyName, adminData, phone, file);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.id);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

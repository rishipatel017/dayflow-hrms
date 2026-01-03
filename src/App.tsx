import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AttendancePage } from './pages/Attendance';
import { Leaves } from './pages/Leaves';
import { Profile } from './pages/Profile';
import { Employees } from './pages/Employees';
import { Payroll } from './pages/Payroll';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading App...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;

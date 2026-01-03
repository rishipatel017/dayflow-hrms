import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockDb';
import { Role, User } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Plus, Search, Users, Briefcase, DollarSign, Clock, Calendar, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (currentUser?.role === Role.ADMIN) {
        const [allUsers, dashboardStats] = await Promise.all([
          api.users.getAll(),
          api.dashboard.getStats()
        ]);
        setUsers(allUsers);
        setStats(dashboardStats);
      } else {
        // Basic fetch just to ensure we have something if needed, mainly reusing existing logic
        const allUsers = await api.users.getAll();
        setUsers(allUsers);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Employee Dashboard (Quick Actions)
  if (currentUser?.role === Role.EMPLOYEE) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Hello, {currentUser.firstName}</h1>
            <p className="text-slate-500 mt-2">Welcome to your employee dashboard.</p>
          </div>
          <img src={currentUser.profilePictureUrl || `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}`} className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm object-cover" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={`/profile/${currentUser.id}`} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">My Profile</h3>
            <p className="text-sm text-slate-500 mt-1">View personal details</p>
          </Link>

          <Link to="/attendance" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">Attendance</h3>
            <p className="text-sm text-slate-500 mt-1">Check logs & hours</p>
          </Link>

          <Link to="/leaves" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 transition-transform">
              <Plane />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Time Off</h3>
            <p className="text-sm text-slate-500 mt-1">Apply for leave</p>
          </Link>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/attendance')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-blue-700">
              <Clock size={24} />
              <span className="font-medium text-sm">Attendance</span>
            </button>
            <button onClick={() => navigate('/leaves')} className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-emerald-700">
              <Calendar size={24} />
              <span className="font-medium text-sm">Apply Leave</span>
            </button>
            <button onClick={() => navigate(`/profile/${currentUser.id}`)} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-purple-700">
              <Users size={24} /> {/* Changed from User to Users to match existing icon style */}
              <span className="font-medium text-sm">My Profile</span>
            </button>
            {/* Seed Data Button for Demo */}
            <button onClick={async () => {
              if (confirm("Generate random attendance and leaves for the last 30 days?")) {
                await api.seed.attendance();
                alert("Data seeded!");
                window.location.reload();
              }
            }} className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-amber-700">
              <Database size={24} />
              <span className="font-medium text-sm">Seed Data</span>
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Present Today</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats?.attendanceStats?.present || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">On Leave</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats?.attendanceStats?.onLeave || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Plane size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Payroll</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{(stats?.totalPayroll || 0).toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Department Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.departmentStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.departmentStats || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {(stats?.departmentStats || []).map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Overview (Today)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Present', value: stats?.attendanceStats?.present || 0 },
                  { name: 'Absent', value: stats?.attendanceStats?.absent || 0 },
                  { name: 'On Leave', value: stats?.attendanceStats?.onLeave || 0 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40}>
                  {
                    [
                      { name: 'Present', color: '#10B981' },
                      { name: 'Absent', color: '#EF4444' },
                      { name: 'On Leave', color: '#F59E0B' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <button
          onClick={() => navigate('/employees')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><span className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => navigate(`/profile/${user.id}`)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all relative group"
            >
              <div className="flex flex-col items-center text-center pt-2">
                <div className="relative">
                  <img src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} className="w-20 h-20 rounded-full object-cover bg-slate-100 border-2 border-white shadow-md mb-3 group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-bold text-slate-800 truncate w-full">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-slate-500 mb-4 font-mono bg-slate-50 px-2 py-1 rounded">{user.employeeId}</p>
                <div className="w-full border-t border-slate-100 pt-3 flex justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">{user.role === Role.ADMIN ? 'Administrator' : 'Employee'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

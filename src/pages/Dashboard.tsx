import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockDb';
import { Role, User } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Plus, Search } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const allUsers = await api.users.getAll();
        setUsers(allUsers);

        // Calculate Statuses
        const map: Record<string, string> = {};
        await Promise.all(allUsers.map(async (u) => {
            const status = 'absent'; 
            map[u.id] = 'absent'; // Default
        }));
        
        setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  // Employee Dashboard (Quick Actions)
  if (currentUser?.role === Role.EMPLOYEE) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold text-slate-800">Hello, {currentUser.firstName}</h1>
             <p className="text-slate-500 mt-2">Welcome to your employee dashboard.</p>
           </div>
           <img src={currentUser.profilePictureUrl} className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm object-cover" />
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

  // Admin Dashboard (Employee Grid)
  return (
    <div className="space-y-6">
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
                {/* Simplified Status Indicator (Mock) */}
                <div className="absolute top-4 right-4" title="Status">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div> 
                </div>

                <div className="flex flex-col items-center text-center pt-2">
                    <div className="relative">
                    <img src={user.profilePictureUrl} className="w-20 h-20 rounded-full object-cover bg-slate-100 border-2 border-white shadow-md mb-3 group-hover:scale-105 transition-transform" />
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

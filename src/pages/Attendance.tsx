import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Attendance, Role, User } from '../types';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [allUsers, allAtt] = await Promise.all([
        api.users.getAll(),
        api.attendance.getAll()
      ]);

      // Filter out Admin/HR users - attendance is for employee management only
      const employeeUsers = allUsers.filter(u => u.role === Role.EMPLOYEE);
      setUsers(employeeUsers);

      if (currentUser?.role === Role.ADMIN) {
        // Show only employee attendance (exclude Admin/HR)
        const employeeAtt = allAtt.filter(a => {
          const user = allUsers.find(u => u.id === a.userId);
          return user?.role === Role.EMPLOYEE;
        });
        // Match standard YYYY-MM-DD format
        setAttendanceData(employeeAtt.filter(a => a.date.substring(0, 10) === selectedDate));
      } else {
        // Employee view - show their own attendance
        setAttendanceData(allAtt.filter(a => a.userId === currentUser?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setLoading(false);
    };
    fetch();
  }, [currentUser, selectedDate]);

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Attendance Log</h2>

        {currentUser?.role === Role.ADMIN && (
          <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={16} /></button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-mono text-slate-700 px-2 cursor-pointer"
            />
            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      {/* Stats Summary (Employee Only) */}
      {currentUser?.role !== Role.ADMIN && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{attendanceData.length}</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Days Present</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {attendanceData.reduce((acc, curr) => acc + curr.workHours, 0).toFixed(0)}
            </div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Total Hours</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">0</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Absences</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading data...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs tracking-wider font-semibold">
                <tr>
                  {currentUser?.role === Role.ADMIN ? (
                    <th className="px-6 py-4 border-r border-slate-100 w-1/3">Employee</th>
                  ) : (
                    <th className="px-6 py-4 border-r border-slate-100">Date</th>
                  )}
                  <th className="px-6 py-4 border-r border-slate-100">Check In</th>
                  <th className="px-6 py-4 border-r border-slate-100">Check Out</th>
                  <th className="px-6 py-4 border-r border-slate-100 text-center">Work Hours</th>
                  <th className="px-6 py-4 text-center">Extra Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentUser?.role === Role.ADMIN ? (
                  // ADMIN VIEW - Show today's attendance
                  users.map(user => {
                    const record = attendanceData.find(a => a.userId === user.id && a.date.substring(0, 10) === selectedDate);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">
                          <div className="flex items-center gap-3">
                            {user.profilePictureUrl ? (
                              <img src={user.profilePictureUrl} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(`${user.firstName} ${user.lastName}`)}`}>
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                            )}
                            <span>{user.firstName} {user.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 font-mono text-slate-700">
                          {record?.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '--:--'}
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 font-mono text-slate-700">
                          {record?.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '--:--'}
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100 font-mono text-center font-medium">
                          {record?.workHours ? record.workHours.toFixed(2) : '0.00'}
                        </td>
                        <td className={`px-6 py-4 font-mono text-center font-medium ${record?.extraHours ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {record?.extraHours ? `+${record.extraHours}` : '-'}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  // EMPLOYEE VIEW
                  attendanceData.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">
                        {format(new Date(record.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100 font-mono">{record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '--:--'}</td>
                      <td className="px-6 py-4 border-r border-slate-100 font-mono">{record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '--:--'}</td>
                      <td className="px-6 py-4 border-r border-slate-100 font-mono text-center text-slate-900 font-medium">{record.workHours.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-center text-slate-500">{record.extraHours ? `+${record.extraHours}` : '-'}</td>
                    </tr>
                  ))
                )}
                {attendanceData.length === 0 && currentUser?.role !== Role.ADMIN && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No attendance history found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

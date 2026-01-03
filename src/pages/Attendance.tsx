import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockDb';
import { Attendance as AttendanceType, Role, User } from '../types';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [userToday, setUserToday] = useState<AttendanceType | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    const [allUsers, allAtt] = await Promise.all([
      api.users.getAll(),
      api.attendance.getAll()
    ]);
    setUsers(allUsers);

    if (currentUser?.role === Role.ADMIN) {
      // Filter by selected date for admin consolidated view
      setAttendanceData(allAtt.filter(a => a.date === selectedDate));
    } else {
      // Show all my attendance for employee view
      setAttendanceData(allAtt.filter(a => a.userId === currentUser?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    // Get Today's status for the current user (regardless of role)
    if (currentUser) {
      const todayRecord = await api.attendance.getForUserToday(currentUser.id);
      setUserToday(todayRecord);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, selectedDate]);

  const handleCheckIn = async () => {
    if (!currentUser) return;
    await api.attendance.checkIn(currentUser.id);
    await fetchData();
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    await api.attendance.checkOut(currentUser.id);
    await fetchData();
  };

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  }

  // Calculate chart data for user
  const chartData = attendanceData.slice(0, 7).reverse().map(a => ({
    date: format(new Date(a.date), 'dd/MM'),
    hours: a.workHours
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Check-In/Out */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Log</h2>
          <p className="text-slate-500">
            {currentUser?.role === Role.ADMIN ? 'Manage consolidated attendance records' : 'Track your daily work hours'}
          </p>
        </div>

        {/* Check In/Out Action Area */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Current Status</div>
            <div className={`text-lg font-bold ${userToday?.checkInTime && !userToday.checkOutTime ? 'text-emerald-600' : 'text-slate-700'}`}>
              {userToday?.checkInTime && !userToday.checkOutTime ? 'Checked In' : 'Checked Out'}
            </div>
          </div>

          {!userToday ? (
            <button
              onClick={handleCheckIn}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Clock size={20} /> Check In
            </button>
          ) : !userToday.checkOutTime ? (
            <button
              onClick={handleCheckOut}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle size={20} /> Check Out
            </button>
          ) : (
            <div className="px-6 py-3 rounded-lg bg-slate-100 text-slate-500 font-medium flex items-center gap-2 cursor-not-allowed">
              <CheckCircle size={20} /> Completed Today
            </div>
          )}
        </div>
      </div>

      {/* Admin Date Control */}
      {currentUser?.role === Role.ADMIN && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Viewing Records For:</span>
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-slate-50 rounded transition-all"><ChevronLeft size={16} /></button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-mono text-slate-700 px-2 cursor-pointer"
            />
            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-slate-50 rounded transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Stats & Charts */}
      {currentUser?.role !== Role.ADMIN && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">Work Hours Trend (Last 7 Days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{attendanceData.length}</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Days Present</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600"><CheckCircle size={20} /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceData.reduce((acc, curr) => acc + curr.workHours, 0).toFixed(0)}
                </div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Total Hours</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Clock size={20} /></div>
            </div>
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
                  // ADMIN VIEW
                  users.map(user => {
                    const record = attendanceData.find(a => a.userId === user.id);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                              {user.firstName.charAt(0)}
                            </div>
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
                      <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">{record.date}</td>
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

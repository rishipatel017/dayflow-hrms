import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Role, User, Attendance, LeaveRequest } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Plus, Search, Clock, Activity, ArrowRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, userId: string, userName: string }>({ isOpen: false, userId: '', userName: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await api.users.getAll();
      setUsers(allUsers);

      // Fetch recent attendance for activity feed
      const allAttendance = await api.attendance.getAll();
      setRecentAttendance(allAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10));

      // Fetch recent leave requests for activity feed
      const allLeaves = await api.leaves.getAll();
      setRecentLeaves(allLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 10));
    } catch (e) {
      console.error("Fetch data error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;
    const loadingToast = toast.loading('Deleting employee...');
    try {
      await api.users.delete(deleteModal.userId);
      toast.success('Employee deleted successfully', { id: loadingToast });
      setDeleteModal({ isOpen: false, userId: '', userName: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete employee', { id: loadingToast });
    }
  };

  // Create unified activity timeline
  const getActivityFeed = () => {
    const activities: Array<{ type: string; user: User | undefined; time: Date; data: any }> = [];

    // Add check-ins
    recentAttendance.forEach(att => {
      if (att.checkInTime) {
        activities.push({
          type: 'check-in',
          user: users.find(u => u.id === att.userId),
          time: new Date(att.checkInTime),
          data: att
        });
      }
      // Add check-outs
      if (att.checkOutTime) {
        activities.push({
          type: 'check-out',
          user: users.find(u => u.id === att.userId),
          time: new Date(att.checkOutTime),
          data: att
        });
      }
    });

    // Add leave applications
    recentLeaves.forEach(leave => {
      activities.push({
        type: 'leave-applied',
        user: users.find(u => u.id === leave.userId),
        time: new Date(leave.startDate),
        data: leave
      });
    });

    // Sort by time (most recent first) and limit to 10
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 10);
  };

  if (currentUser?.role === Role.EMPLOYEE) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Hello, {currentUser.firstName}</h1>
            <p className="text-slate-500 mt-2">Welcome to your employee dashboard. Have a great day!</p>
          </div>
          {currentUser.profilePictureUrl ? (
            <img src={currentUser.profilePictureUrl} className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm object-cover" />
          ) : (
            <div className={`w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm flex items-center justify-center text-white font-bold text-2xl ${getAvatarColor(`${currentUser.firstName} ${currentUser.lastName}`)}`}>
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard to={`/profile/${currentUser.id}`} icon={<Clock />} color="bg-slate-100 text-slate-600" title="My Profile" desc="View personal details" />
          <DashboardCard to="/attendance" icon={<Clock />} color="bg-emerald-100 text-emerald-600" title="Attendance" desc="Check logs & hours" />
          <DashboardCard to="/leaves" icon={<Plane />} color="bg-sky-100 text-sky-600" title="Time Off" desc="Apply for leave" />
        </div>

        {/* Recent Activity for Employee */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="p-2">
            {recentAttendance.filter(a => a.userId === currentUser.id).length ? (
              recentAttendance.filter(a => a.userId === currentUser.id).map(a => (
                <ActivityRow key={a.id} title={`Checked in at ${a.checkInTime ? format(new Date(a.checkInTime), 'hh:mm a') : '-'}`} date={a.date} />
              ))
            ) : (
              <p className="p-8 text-center text-slate-400 text-sm italic">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="space-y-8 animate-fadeIn">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: '', userName: '' })}
        onConfirm={handleDeleteUser}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteModal.userName}? This will remove all their data, including history, and cannot be undone.`}
        type="danger"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => navigate('/employees')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
            Employee Directory
          </h2>
          {loading ? (
            <div className="flex justify-center p-12"><span className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></span></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.filter(u => u.role === Role.EMPLOYEE).map(user => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-xl hover:-translate-y-1 transition-all group border-l-4 border-l-transparent hover:border-l-slate-900 flex flex-col relative"
                >
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} className="w-14 h-14 rounded-xl object-cover bg-slate-50" />
                    ) : (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(`${user.firstName} ${user.lastName}`)}`}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-widest">{user.employeeId}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>

                  {/* Delete Button (Only if not self) */}
                  {currentUser?.id !== user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, userId: user.id, userName: `${user.firstName} ${user.lastName}` });
                      }}
                      className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Recent Activity for Admin */}
        <div className="space-y-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
            {getActivityFeed().length ? (
              getActivityFeed().map((activity, idx) => {
                const getActivityDisplay = () => {
                  switch (activity.type) {
                    case 'check-in':
                      return {
                        title: `${activity.user?.firstName || 'User'} checked in`,
                        color: 'bg-emerald-500',
                        time: format(activity.time, 'hh:mm a')
                      };
                    case 'check-out':
                      return {
                        title: `${activity.user?.firstName || 'User'} checked out`,
                        color: 'bg-blue-500',
                        time: format(activity.time, 'hh:mm a')
                      };
                    case 'leave-applied':
                      return {
                        title: `${activity.user?.firstName || 'User'} applied for leave`,
                        color: 'bg-amber-500',
                        time: format(activity.time, 'MMM dd')
                      };
                    default:
                      return { title: 'Activity', color: 'bg-slate-500', time: '' };
                  }
                };
                const display = getActivityDisplay();
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${display.color} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{display.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {format(activity.time, 'MMM dd, yyyy')} • {display.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="p-8 text-center text-slate-400 text-sm italic">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ to: string, icon: React.ReactNode, color: string, title: string, desc: string }> = ({ to, icon, color, title, desc }) => (
  <Link to={to} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500 mt-1">{desc}</p>
  </Link>
);

const ActivityRow: React.FC<{ title: string, date: string, time?: string }> = ({ title, date, time }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
    <div className="flex-1">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{format(new Date(date), 'MMM dd, yyyy')} {time && `• ${time}`}</p>
    </div>
  </div>
);

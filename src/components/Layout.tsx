import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Circle,
  Clock
} from 'lucide-react';
import { Role } from '../types';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, company, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Fetch initial attendance status safely (only for employees)
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      if (currentUser && currentUser.role === Role.EMPLOYEE) {
        try {
          const record = await api.attendance.getForUserToday(currentUser.id);
          if (mounted) {
            setCheckedIn(!!record && !record.checkOutTime);
          }
        } catch (e) {
          console.error("Failed to fetch attendance status", e);
        }
      }
    };
    checkStatus();
    return () => { mounted = false; };
  }, [currentUser]);

  const handleAttendance = async () => {
    if (!currentUser || attendanceLoading) return;
    setAttendanceLoading(true);

    try {
      if (checkedIn) {
        await api.attendance.checkOut(currentUser.id);
        toast.success("Checked out successfully!");
        setCheckedIn(false);
      } else {
        await api.attendance.checkIn(currentUser.id);
        toast.success("Checked in successfully!");
        setCheckedIn(true);
      }
      if (location.pathname === '/attendance') {
        navigate(0);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Attendance action failed";
      toast.error(msg);
      console.error("Attendance action failed", error);

      // Refresh status if we get a conflict error
      if (error.response?.status === 400 || error.response?.status === 404) {
        const record = await api.attendance.getForUserToday(currentUser.id);
        setCheckedIn(!!record && !record.checkOutTime);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const navItems = [
    ...(currentUser?.role === Role.ADMIN ? [
      { label: 'Employees', path: '/' },
      { label: 'Attendance', path: '/attendance' },
      { label: 'Time Off', path: '/leaves' }
    ] : [
      { label: 'Dashboard', path: '/' },
      { label: 'Attendance', path: '/attendance' },
      { label: 'Time Off', path: '/leaves' }
    ])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo Area */}
              <div className="flex-shrink-0 flex items-center pr-6 border-r border-slate-200 mr-6">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="h-8 w-8 rounded-lg object-cover mr-2" />
                ) : (
                  <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                    {company?.name?.charAt(0) || 'D'}
                  </div>
                )}
                <span className="text-xl font-bold text-slate-900">{company?.name || 'Dayflow'}</span>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${location.pathname === item.path
                      ? 'border-slate-800 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Check In/Out Button - Only for Employees */}
              {currentUser?.role === Role.EMPLOYEE && (
                <div className="hidden md:flex items-center">
                  <button
                    onClick={handleAttendance}
                    disabled={attendanceLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${checkedIn
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800 border border-transparent'
                      } ${attendanceLoading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {attendanceLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      checkedIn ? <Circle size={10} className="fill-emerald-500 text-emerald-500 animate-pulse" /> : <Clock size={16} />
                    )}
                    {checkedIn ? 'Check Out' : 'Check In ->'}
                  </button>
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative ml-3">
                <div
                  className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700 leading-none">{currentUser?.firstName} {currentUser?.lastName}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-medium">{currentUser?.role}</p>
                  </div>
                  {currentUser?.profilePictureUrl ? (
                    <img className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm object-cover" src={currentUser.profilePictureUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
                  ) : (
                    <div className={`h-10 w-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(`${currentUser?.firstName} ${currentUser?.lastName}`)}`}>
                      {getInitials(currentUser?.firstName || '', currentUser?.lastName)}
                    </div>
                  )}
                </div>

                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                      <p className="text-sm font-semibold text-slate-800">{currentUser?.firstName}</p>
                      <p className="text-xs text-slate-500">{currentUser?.role}</p>
                    </div>
                    <Link to={`/profile/${currentUser?.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center" onClick={() => setProfileMenuOpen(false)}>
                      <UserIcon size={16} className="mr-3 text-slate-400" /> My Profile
                    </Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                      <LogOut size={16} className="mr-3 text-red-400" /> Log Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700 p-2">
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium ${location.pathname === item.path
                    ? 'bg-slate-50 border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {currentUser?.role === Role.EMPLOYEE && (
                <div className="p-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => { handleAttendance(); setMobileMenuOpen(false); }}
                    disabled={attendanceLoading}
                    className={`w-full text-center py-3 rounded-lg font-medium shadow-sm flex justify-center items-center gap-2 ${checkedIn ? 'bg-white border border-slate-300 text-slate-700' : 'bg-slate-900 text-white'
                      }`}
                  >
                    {attendanceLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                    {checkedIn ? 'Check Out' : 'Check In'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {children}
      </main>
    </div>
  );
};

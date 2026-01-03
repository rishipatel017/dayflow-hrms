import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockDb';
import { LeaveRequest, LeaveStatus, LeaveType, Role, User } from '../types';
import { Check, X, Plus, Calendar, Clock, Filter } from 'lucide-react';

export const Leaves: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: LeaveType.PAID,
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [allUsers, allLeaves] = await Promise.all([
      api.users.getAll(),
      api.leaves.getAll()
    ]);

    setUsers(allUsers);

    if (currentUser?.role === Role.ADMIN) {
      setLeaves(allLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    } else {
      setLeaves(allLeaves.filter(l => l.userId === currentUser?.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await api.leaves.create({
      userId: currentUser.id,
      ...formData
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleAction = async (id: string, approve: boolean) => {
    if (!currentUser) return;
    await api.leaves.updateStatus(id, currentUser.id, approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Time Off</h2>
          <p className="text-slate-500 text-sm">
            {currentUser?.role === Role.ADMIN ? 'Manage employee leave requests' : 'Request and track your time off'}
          </p>
        </div>
        {currentUser?.role === Role.EMPLOYEE && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>NEW REQUEST</span>
          </button>
        )}
      </div>

      {/* Balance Cards - Only Visible to EMPLOYEES */}
      {currentUser?.role === Role.EMPLOYEE && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <h3 className="text-blue-600 font-bold text-lg">Paid Time Off</h3>
              <Clock className="text-blue-100 p-1 bg-blue-50 rounded-full" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">24 <span className="text-sm font-normal text-slate-500">Days</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Available Balance</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-sky-500 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <h3 className="text-sky-600 font-bold text-lg">Sick Time Off</h3>
              <Calendar className="text-sky-100 p-1 bg-sky-50 rounded-full" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">07 <span className="text-sm font-normal text-slate-500">Days</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Available Balance</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Leave Requests</h3>
          <div className="flex gap-2 text-slate-400">
            <Filter size={18} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading requests...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Name</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Start Date</th>
                  <th className="px-6 py-4 font-bold text-slate-700">End Date</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Type</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Status</th>
                  {currentUser?.role === Role.ADMIN && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map(leave => {
                  const user = users.find(u => u.id === leave.userId);
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${user?.id === currentUser?.id ? 'bg-slate-700' : 'bg-slate-400'
                          }`}>
                          {user?.firstName.charAt(0)}
                        </div>
                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-mono">{leave.startDate}</td>
                      <td className="px-6 py-4 font-mono">{leave.endDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${leave.type === LeaveType.PAID ? 'bg-blue-100 text-blue-700' :
                            leave.type === LeaveType.SICK ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {leave.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {leave.status === LeaveStatus.APPROVED && <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase tracking-wide"><Check size={14} /> Approved</span>}
                        {leave.status === LeaveStatus.REJECTED && <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs uppercase tracking-wide"><X size={14} /> Rejected</span>}
                        {leave.status === LeaveStatus.PENDING && <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs uppercase tracking-wide">Pending</span>}
                      </td>
                      {currentUser?.role === Role.ADMIN && (
                        <td className="px-6 py-4 text-right">
                          {leave.status === LeaveStatus.PENDING && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleAction(leave.id, true)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm transition-colors">
                                <Check size={16} />
                              </button>
                              <button onClick={() => handleAction(leave.id, false)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">New Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Off Type</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all bg-white"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as LeaveType })}
                >
                  {Object.values(LeaveType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                  <input type="date" required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all"
                    value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                  <input type="date" required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all"
                    value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all resize-none" rows={3}
                  value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Family vacation..."></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Discard</button>
                <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow-lg shadow-slate-200 transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

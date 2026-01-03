import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaveRequest, LeaveStatus, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText, Send, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

export const LeavesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const [modal, setModal] = useState<{ isOpen: boolean, id: string, status: LeaveStatus | null }>({ isOpen: false, id: '', status: null });
  const [showForm, setShowForm] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: 'PAID',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.leaves.getAll();
      if (currentUser?.role === Role.EMPLOYEE) {
        // Employees see only their own leave requests
        setLeaves(data.filter(l => l.userId === currentUser.id));
      } else {
        // Admin sees all employee leave requests (excluding their own if any)
        setLeaves(data.filter(l => l.userId !== currentUser?.id));
      }
    } catch (e) {
      toast.error("Failed to load leave records");
    }
    setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Submitting leave request...");
    try {
      await api.leaves.create({
        ...formData,
        userId: currentUser!.id,
        status: LeaveStatus.PENDING
      } as any, attachment || undefined);
      toast.success('Leave request submitted!', { id: loadingToast });
      setShowForm(false);
      setAttachment(null);
      fetchLeaves();
    } catch (e) {
      toast.error('Failed to submit leave', { id: loadingToast });
    }
  };

  const handleStatusUpdate = async () => {
    if (!modal.id || !modal.status) return;
    const loadingToast = toast.loading(`Updating leave status...`);
    try {
      await api.leaves.updateStatus(modal.id, currentUser!.id, modal.status, remarks[modal.id] || '');
      toast.success(`Leave ${modal.status.toLowerCase()} successfully!`, { id: loadingToast });
      setModal({ isOpen: false, id: '', status: null });
      fetchLeaves();
    } catch (e) {
      toast.error('Update failed', { id: loadingToast });
    }
  };

  const getStatusStyle = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case LeaveStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, id: '', status: null })}
        onConfirm={handleStatusUpdate}
        title={`${modal.status === LeaveStatus.APPROVED ? 'Approve' : 'Reject'} Leave?`}
        message={`Are you sure you want to ${modal.status?.toLowerCase()} this leave request?`}
        type={modal.status === LeaveStatus.REJECTED ? 'danger' : 'info'}
      />

      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leaves & Time Off</h1>
          <p className="text-slate-500 mt-1">Manage leave requests and track history.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Only employees can apply for leave */}
          {currentUser?.role === Role.EMPLOYEE && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}
            >
              {showForm ? 'Cancel Request' : <><Send size={18} /> Apply for Leave</>}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-slideDown">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> New Leave Request
          </h2>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Leave Type</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="PAID">Paid Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Date</label>
              <input required type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
                value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">End Date</label>
              <input required type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
                value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason</label>
              <textarea required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100" rows={3}
                value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Briefly describe the reason..." />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attachment (Optional)</label>
              <div className="flex items-center gap-4 p-4 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                <Paperclip size={20} className="text-slate-400" />
                <input type="file" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  onChange={e => setAttachment(e.target.files?.[0] || null)} />
                {attachment && <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{attachment.name}</span>}
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dates</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              {currentUser?.role === Role.ADMIN && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions & Feedback</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading records...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No leave requests found.</td></tr>
            ) : leaves.map(leave => (
              <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">{(leave as any).user?.firstName} {(leave as any).user?.lastName}</p>
                  <p className="text-xs text-slate-400">Reason: {leave.reason}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-slate-700 px-2 py-1 bg-slate-100 rounded-md">{leave.type}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    <span className="text-sm font-medium">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(leave.status)}`}>
                      {leave.status}
                    </span>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {leave.attachmentUrl && (
                        <a href={leave.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline">
                          <Paperclip size={10} /> View Doc
                        </a>
                      )}
                      {leave.approverRemarks && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                          <MessageSquare size={10} /> {leave.approverRemarks}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {currentUser?.role === Role.ADMIN && (
                  <td className="px-6 py-5">
                    {leave.status === LeaveStatus.PENDING ? (
                      leave.userId !== currentUser.id ? (
                        <div className="space-y-3">
                          <input
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-slate-400"
                            placeholder="Add a remark..."
                            value={remarks[leave.id] || ''}
                            onChange={e => setRemarks({ ...remarks, [leave.id]: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setModal({ isOpen: true, id: leave.id, status: LeaveStatus.APPROVED })} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button onClick={() => setModal({ isOpen: true, id: leave.id, status: LeaveStatus.REJECTED })} className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-medium">Awaiting approval from another Admin</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Processed on {leave.approvalDate ? format(new Date(leave.approvalDate), 'MMM dd') : '-'}</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/mockDb';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { User } from '../types';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
    department: 'General',
    jobPosition: 'Employee'
  });

  const fetchEmployees = async () => {
    const data = await api.users.getAll();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.users.create(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          joiningDate: formData.joiningDate
        },
        {
          phone: formData.phone,
          department: formData.department,
          jobPosition: formData.jobPosition
        }
      );
      alert('Employee created successfully with generated ID!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', joiningDate: '', department: 'General', jobPosition: 'Employee' });
      fetchEmployees();
    } catch (e) {
      alert('Failed to create employee');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Onboard Employee</h2>
            <p className="text-slate-500 text-sm">Create a new user. The Login ID will be auto-generated.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
              <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option>General</option>
                <option>Engineering</option>
                <option>Human Resources</option>
                <option>Sales</option>
                <option>Design</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Employee Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Employee List with Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">All Employees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-slate-600">{emp.employeeId}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img src={emp.profilePictureUrl || `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}`} className="w-full h-full object-cover" />
                      </div>
                      {emp.firstName} {emp.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{emp.joiningDate}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => navigate(`/profile/${emp.id}`)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 mr-2"
                      title="Edit Profile"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}? This action cannot be undone.`)) {
                          try {
                            await api.users.delete(emp.id);
                            alert('Employee deleted successfully');
                            fetchEmployees();
                          } catch (e) {
                            alert('Failed to delete employee: ' + e);
                          }
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/mockDb';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
    department: 'General',
    jobPosition: 'Employee'
  });

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
        navigate('/');
    } catch (e) {
        alert('Failed to create employee');
    }
    setLoading(false);
  };

  return (
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
               value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
             <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
               value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
             <input required type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
             <input type="tel" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
               value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
             <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
               value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
          </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
             <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
               value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
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
  );
};

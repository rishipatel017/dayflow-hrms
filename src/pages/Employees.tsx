import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, Briefcase, MapPin, CreditCard, UserCheck, AlertCircle } from 'lucide-react';
import { validateIndianPhone, validatePAN, validateUAN, validateIFSC, validateBankAccount, getValidationError } from '../utils/validation';

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
    jobPosition: 'Employee',
    role: 'EMPLOYEE',
    address: '',
    totalWage: '0',
    bankAccountNo: '',
    ifsc: '',
    pan: '',
    uan: '',
    gender: 'Other',
    maritalStatus: 'Single',
    nationality: 'Indian'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors: Record<string, string | null> = {
      phone: getValidationError('phone', formData.phone),
      pan: getValidationError('pan', formData.pan),
      uan: getValidationError('uan', formData.uan),
      ifsc: getValidationError('ifsc', formData.ifsc),
      bankAccountNo: getValidationError('bankAccountNo', formData.bankAccountNo)
    };

    // Check if bank account is provided without IFSC
    if (formData.bankAccountNo && !formData.ifsc) {
      errors.ifsc = 'IFSC code is required when bank account is provided';
    }

    const hasErrors = Object.values(errors).some(err => err !== null);
    if (hasErrors) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);
    try {
      await api.users.create(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          joiningDate: formData.joiningDate,
          role: formData.role,
          totalWage: parseFloat(formData.totalWage)
        },
        {
          phone: formData.phone,
          address: formData.address,
          department: formData.department,
          jobPosition: formData.jobPosition,
          bankAccountNo: formData.bankAccountNo,
          ifsc: formData.ifsc,
          pan: formData.pan,
          uan: formData.uan,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          nationality: formData.nationality
        }
      );
      toast.success('Employee onboarded successfully!');
      navigate('/');
    } catch (e) {
      toast.error('Failed to onboard employee: ' + ((e as any).response?.data?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-8 border-b border-slate-100 pb-4">
          <div className="bg-slate-900 p-2.5 rounded-xl text-white">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Onboard New Employee</h2>
            <p className="text-slate-500 text-sm">Fill in all details to create a complete employee profile & salary structure.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Personal Section */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 border-l-4 border-slate-900 pl-3">
              <UserCheck size={18} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <input required type="email" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone *</label>
                <input
                  required
                  type="tel"
                  pattern="[6-9][0-9]{9}"
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all ${validationErrors.phone ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  value={formData.phone}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    setValidationErrors({ ...validationErrors, phone: getValidationError('phone', e.target.value) });
                  }}
                  placeholder="10 digits starting with 6-9"
                />
                {validationErrors.phone && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" rows={2}
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marital Status</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
              </div>
            </div>
          </section>

          {/* Professional Section */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 border-l-4 border-slate-900 pl-3">
              <Briefcase size={18} /> Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Joining Date</label>
                <input required type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                  <option>General</option>
                  <option>Engineering</option>
                  <option>Human Resources</option>
                  <option>Sales</option>
                  <option>Design</option>
                  <option>Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job Position</label>
                <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" placeholder="e.g. Senior Developer"
                  value={formData.jobPosition} onChange={e => setFormData({ ...formData, jobPosition: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role (System Permission)</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">HR / Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly CTC (INR)</label>
                <input required type="number" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
                  value={formData.totalWage} onChange={e => setFormData({ ...formData, totalWage: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Banking Section */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 border-l-4 border-slate-900 pl-3">
              <CreditCard size={18} /> Banking & Statutory Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Account Number</label>
                <input
                  type="text"
                  pattern="[0-9]{9,18}"
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all font-mono ${validationErrors.bankAccountNo ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  value={formData.bankAccountNo}
                  onChange={e => {
                    setFormData({ ...formData, bankAccountNo: e.target.value });
                    setValidationErrors({ ...validationErrors, bankAccountNo: getValidationError('bankAccountNo', e.target.value) });
                  }}
                  placeholder="9-18 digits"
                />
                {validationErrors.bankAccountNo && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.bankAccountNo}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
                <input
                  type="text"
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all font-mono uppercase ${validationErrors.ifsc ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  value={formData.ifsc}
                  onChange={e => {
                    const upper = e.target.value.toUpperCase();
                    setFormData({ ...formData, ifsc: upper });
                    setValidationErrors({ ...validationErrors, ifsc: getValidationError('ifsc', upper) });
                  }}
                  placeholder="ABCD0123456"
                />
                {validationErrors.ifsc && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.ifsc}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all font-mono uppercase ${validationErrors.pan ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  value={formData.pan}
                  onChange={e => {
                    const upper = e.target.value.toUpperCase();
                    setFormData({ ...formData, pan: upper });
                    setValidationErrors({ ...validationErrors, pan: getValidationError('pan', upper) });
                  }}
                  placeholder="ABCDE1234F"
                />
                {validationErrors.pan && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.pan}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">UAN (PF Number)</label>
                <input
                  type="text"
                  maxLength={12}
                  pattern="[0-9]{12}"
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all font-mono ${validationErrors.uan ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  value={formData.uan}
                  onChange={e => {
                    setFormData({ ...formData, uan: e.target.value });
                    setValidationErrors({ ...validationErrors, uan: getValidationError('uan', e.target.value) });
                  }}
                  placeholder="12 digits"
                />
                {validationErrors.uan && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {validationErrors.uan}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-[2] bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Onboarding...' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

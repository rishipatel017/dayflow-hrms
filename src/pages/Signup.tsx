import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    file: null as File | null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const [firstName, ...rest] = formData.fullName.split(' ');
    const lastName = rest.join(' ') || '';

    const success = await signup(
      formData.companyName,
      {
        firstName,
        lastName,
        email: formData.email,
        passwordHash: formData.password
      },
      formData.phone,
      formData.file || undefined
    );

    if (success) {
      navigate('/');
    } else {
      setError('Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-slate-100 w-full py-3 rounded-lg text-slate-400 font-medium mb-6 text-sm">
            Dayflow HRMS Setup
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Admin Account</h1>
          <p className="text-slate-500 text-sm mt-1">Register your company and start managing employees.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">{error}</div>}

          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo (Optional)</label>
              <div className="relative border border-slate-300 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload size={18} className="text-slate-400" />
                <span className="text-sm text-slate-500">{formData.file ? formData.file.name : 'Choose a file...'}</span>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, file: e.target.files[0] });
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Administrator Name</label>
              <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input required type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-slate-200 mt-6 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

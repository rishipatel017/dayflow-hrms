import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/mockDb';
import { User, EmployeeProfile, SalaryStructure, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, CreditCard, Lock, Calendar, Globe, Briefcase, User as UserIcon, AlertTriangle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [activeTab, setActiveTab] = useState('resume');
  const [editWage, setEditWage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        if (id) {
            setLoading(true);
            const u = await api.users.getById(id);
            setUser(u || null);
            
            const p = await api.profiles.getByUserId(id);
            setProfile(p || null);

            if (currentUser?.role === Role.ADMIN) {
                const s = await api.salaries.getByUserId(id);
                setSalary(s || null);
                if (s) setEditWage(s.totalWage);
            }
            setLoading(false);
        }
    };
    fetch();
  }, [id, currentUser]);

  const handleUpdateSalary = async () => {
    if (user && currentUser?.role === Role.ADMIN) {
      // Double check constraint
      if (currentUser.id === user.id) {
          alert("You cannot update your own salary structure.");
          return;
      }
      const updated = await api.salaries.update(user.id, editWage);
      setSalary(updated);
      alert('Salary structure updated!');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!user || !profile) return <div>User not found</div>;

  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    ...(currentUser?.role === Role.ADMIN ? [{ id: 'salary', label: 'Salary Info' }] : []),
    { id: 'security', label: 'Security' },
  ];

  // Logic to disable editing own salary
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
         <div className="w-32 h-32 rounded-full border-4 border-slate-50 overflow-hidden shadow-sm flex-shrink-0">
            <img src={user.profilePictureUrl} className="w-full h-full object-cover" />
         </div>
         <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{user.firstName} {user.lastName}</h1>
            <p className="text-lg text-slate-600">{profile.jobPosition}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-500 pt-2">
               <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
               <span className="flex items-center gap-1"><Phone size={14}/> {profile.phone || 'N/A'}</span>
               <span className="flex items-center gap-1"><MapPin size={14}/> {profile.address || 'N/A'}</span>
            </div>
         </div>
         <div className="text-right hidden md:block space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Company</div>
            <div className="font-medium text-slate-800">Dayflow</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-2">Department</div>
            <div className="font-medium text-slate-800">{profile.department}</div>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
         <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
         </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 min-h-[400px]">
         {activeTab === 'resume' && (
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <SectionHeader icon={<UserIcon size={18} />} title="About" />
                  <p className="text-slate-600 leading-relaxed text-sm">
                     Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                  </p>
                  
                  <SectionHeader icon={<Briefcase size={18} />} title="Work Information" />
                  <div className="grid grid-cols-2 gap-4">
                     <InfoBox label="Department" value={profile.department} />
                     <InfoBox label="Job Position" value={profile.jobPosition} />
                     <InfoBox label="Manager" value={profile.managerId ? 'Assigned' : 'None'} />
                     <InfoBox label="Work Email" value={user.email} />
                  </div>
               </div>
               <div className="space-y-6">
                  <SectionHeader icon={<CreditCard size={18} />} title="Skills & Certifications" />
                  <div className="border border-slate-200 rounded p-4 h-32 flex items-center justify-center text-slate-400 text-sm">
                     + Add Skills
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'private' && (
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Personal Information</h3>
                  <div className="space-y-4">
                     <Row label="Date of Birth" value="-" />
                     <Row label="Nationality" value={profile.nationality} />
                     <Row label="Gender" value="-" />
                     <Row label="Marital Status" value={profile.maritalStatus} />
                     <Row label="Personal Email" value={user.email} />
                  </div>
               </div>
               <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2">Bank Account</h3>
                  <div className="space-y-4">
                     <Row label="Bank Name" value="HDFC Bank" />
                     <Row label="Account Number" value={profile.bankAccountNo} />
                     <Row label="IFSC Code" value={profile.ifsc} />
                     <Row label="PAN No" value={profile.pan} />
                     <Row label="UAN" value={profile.uan} />
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'salary' && salary && (
            <div className="space-y-8 animate-fadeIn">
               {/* Wage Input Section */}
               <div className="grid md:grid-cols-2 gap-8 items-center border-b border-slate-200 pb-8">
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Wage (CTC)</label>
                        <div className="flex gap-2">
                           <input 
                              type="number" 
                              value={editWage}
                              onChange={(e) => setEditWage(parseFloat(e.target.value))}
                              disabled={isOwnProfile}
                              className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2 ${isOwnProfile ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} 
                           />
                           <button 
                             onClick={handleUpdateSalary} 
                             disabled={isOwnProfile}
                             className={`px-4 py-2 rounded-md text-sm text-white ${isOwnProfile ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
                           >
                             Update
                           </button>
                        </div>
                        {isOwnProfile && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                                <AlertTriangle size={12} />
                                <span>For security, you cannot edit your own salary structure.</span>
                            </div>
                        )}
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Yearly Wage</label>
                        <div className="text-xl font-mono text-slate-800">{salary.yearlyWage.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded text-sm text-slate-500">
                     <p className="mb-2 font-semibold">Note:</p>
                     <ul className="list-disc list-inside space-y-1">
                        <li>Basic Salary is 50% of Wage</li>
                        <li>HRA is 50% of Basic</li>
                        <li>PF is calculated at 12% of Basic</li>
                     </ul>
                  </div>
               </div>

               {/* Detailed Breakdown */}
               <div className="grid md:grid-cols-2 gap-12">
                  <div>
                     <h4 className="font-bold text-slate-800 mb-4 text-lg">Salary Components (Earnings)</h4>
                     <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase border-b border-slate-300">
                           <tr>
                              <th className="text-left py-2">Component</th>
                              <th className="text-right py-2">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           <SalaryRow label="Basic Salary" value={salary.basic} sub="50%" />
                           <SalaryRow label="House Rent Allowance" value={salary.hra} sub="50% of Basic" />
                           <SalaryRow label="Standard Allowance" value={salary.standardAllowance} />
                           <SalaryRow label="Travel Allowance" value={salary.travelAllowance} />
                           <SalaryRow label="Fixed Allowance" value={salary.fixedAllowance} sub="Balance" />
                           <tr className="font-bold bg-slate-50">
                              <td className="py-3 pl-2">Gross Earnings</td>
                              <td className="text-right py-3 pr-2">{salary.totalWage.toFixed(2)}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-800 mb-4 text-lg">Deductions</h4>
                     <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase border-b border-slate-300">
                           <tr>
                              <th className="text-left py-2">Component</th>
                              <th className="text-right py-2">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           <SalaryRow label="Provident Fund (Employee)" value={salary.pfEmployee} sub="12% of Basic" />
                           <SalaryRow label="Professional Tax" value={salary.profTax} />
                           <tr className="font-bold bg-slate-50">
                              <td className="py-3 pl-2">Total Deductions</td>
                              <td className="text-right py-3 pr-2">{(salary.pfEmployee + salary.profTax).toFixed(2)}</td>
                           </tr>
                        </tbody>
                     </table>
                     
                     <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex justify-between items-center">
                           <span className="text-emerald-800 font-bold">Net Salary (In Hand)</span>
                           <span className="text-emerald-800 font-bold text-lg">{(salary.totalWage - salary.pfEmployee - salary.profTax).toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === 'security' && (
             <div className="max-w-md space-y-6">
                <h3 className="flex items-center text-lg font-semibold text-slate-800 border-b pb-2">
                   Login Credentials
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-sm text-slate-500 uppercase tracking-wide font-bold mb-1">Employee ID (Login ID)</p>
                    <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">{user.employeeId}</p>
                  </div>
                  <button className="w-full border border-slate-300 text-slate-600 py-2 rounded-lg hover:bg-slate-50 font-medium">
                    Reset Password
                  </button>
                </div>
             </div>
         )}
      </div>
    </div>
  );
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
   <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
      <span className="text-slate-400">{icon}</span>
      <h3 className="font-semibold text-slate-800">{title}</h3>
   </div>
);

const InfoBox = ({ label, value }: { label: string, value: string }) => (
   <div className="bg-slate-50 p-3 rounded border border-slate-100">
      <div className="text-xs text-slate-500 uppercase font-semibold">{label}</div>
      <div className="text-sm text-slate-800 font-medium mt-1 truncate">{value}</div>
   </div>
);

const Row = ({ label, value }: { label: string, value: string | undefined }) => (
   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-800 font-medium">{value || '—'}</span>
   </div>
);

const SalaryRow = ({ label, value, sub }: { label: string, value: number, sub?: string }) => (
   <tr>
      <td className="py-2 pl-2">
         <div className="text-slate-700 font-medium">{label}</div>
         {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </td>
      <td className="text-right py-2 pr-2 font-mono text-slate-600">{value.toFixed(2)}</td>
   </tr>
);

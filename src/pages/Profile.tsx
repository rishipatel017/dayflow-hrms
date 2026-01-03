import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { User, EmployeeProfile, SalaryStructure, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Mail, Phone, MapPin, CreditCard, Lock, Calendar, Globe, Briefcase, User as UserIcon, AlertTriangle, Edit, Save, X, Plus, Trash2, FileText, Upload } from 'lucide-react';

export const ProfilePage: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const { currentUser } = useAuth();

   const [user, setUser] = useState<User | null>(null);
   const [profile, setProfile] = useState<EmployeeProfile | null>(null);
   const [salary, setSalary] = useState<SalaryStructure | null>(null);
   const [activeTab, setActiveTab] = useState('resume');
   const [editWage, setEditWage] = useState(0);
   const [editWorkingDays, setEditWorkingDays] = useState(5);
   const [editBreakTime, setEditBreakTime] = useState(1.0);

   // Configuration State
   const [basicType, setBasicType] = useState<'fixed' | 'percent'>('percent');
   const [basicValue, setBasicValue] = useState(50);
   const [hraType, setHraType] = useState<'fixed' | 'percent'>('percent');
   const [hraValue, setHraValue] = useState(50);
   const [stdType, setStdType] = useState<'fixed' | 'percent'>('fixed');
   const [stdValue, setStdValue] = useState(4167);
   const [bonusType, setBonusType] = useState<'fixed' | 'percent'>('percent');
   const [bonusValue, setBonusValue] = useState(8.33);
   const [ltaType, setLtaType] = useState<'fixed' | 'percent'>('percent');
   const [ltaValue, setLtaValue] = useState(8.33);
   const [pfRate, setPfRate] = useState(12);
   const [profTax, setProfTax] = useState(200);

   const [loading, setLoading] = useState(true);
   const [isEditing, setIsEditing] = useState(false);

   // Password change state
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

   // Document upload state
   const [uploadingDoc, setUploadingDoc] = useState(false);
   const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, url: string }>({ isOpen: false, url: '' });
   const [namingModal, setNamingModal] = useState<{ isOpen: boolean, file: File | null, name: string }>({ isOpen: false, file: null, name: '' });

   // Edit states
   const [editProfile, setEditProfile] = useState<Partial<EmployeeProfile>>({});
   const [editUser, setEditUser] = useState<Partial<User>>({});
   const [newSkill, setNewSkill] = useState('');

   useEffect(() => {
      const fetch = async () => {
         if (id) {
            setLoading(true);
            try {
               const u = await api.users.getById(id);
               setUser(u || null);
               if (u) {
                  setEditUser({ firstName: u.firstName, lastName: u.lastName });
                  setProfile(u.profile || null);
                  if (u.profile) {
                     setEditProfile({ ...u.profile });
                  }
                  if (u.salary) {
                     setSalary(u.salary);
                     setEditWage(u.salary.totalWage);
                     setEditWorkingDays(u.salary.workingDaysPerWeek);
                     setEditBreakTime(u.salary.breakTime);
                     setBasicType((u.salary as any).basicType || 'percent');
                     setBasicValue((u.salary as any).basicValue ?? 50);
                     setHraType((u.salary as any).hraType || 'percent');
                     setHraValue((u.salary as any).hraValue ?? 50);
                     setStdType((u.salary as any).stdType || 'fixed');
                     setStdValue((u.salary as any).stdValue ?? 4167);
                     setBonusType((u.salary as any).bonusType || 'percent');
                     setBonusValue((u.salary as any).bonusValue ?? 8.33);
                     setLtaType((u.salary as any).ltaType || 'percent');
                     setLtaValue((u.salary as any).ltaValue ?? 8.33);
                     setPfRate((u.salary as any).pfRate ?? 12);
                     setProfTax((u.salary as any).profTax ?? 200);
                  }
               }
            } catch (e) {
               console.error("Fetch profile error", e);
               toast.error("Failed to load profile data");
            }
            setLoading(false);
         }
      };
      fetch();
   }, [id]);

   const handleUpdateSalary = async () => {
      if (user && currentUser?.role === Role.ADMIN) {
         if (currentUser.id === user.id) {
            toast.error("You cannot update your own salary structure.");
            return;
         }
         const loadingToast = toast.loading("Updating salary...");
         try {
            // Calculation Logic
            const basic = Math.round(basicType === 'percent' ? editWage * basicValue / 100 : basicValue);
            const hra = Math.round(hraType === 'percent' ? basic * hraValue / 100 : hraValue);
            const standardAllowance = Math.round(stdType === 'percent' ? editWage * stdValue / 100 : stdValue);
            const performanceBonus = Math.round(bonusType === 'percent' ? editWage * bonusValue / 100 : bonusValue);
            const travelAllowance = Math.round(ltaType === 'percent' ? editWage * ltaValue / 100 : ltaValue);

            const pfEmployer = Math.round(basic * pfRate / 100);
            const pfEmployee = Math.round(basic * pfRate / 100);

            // Fixed Allowance = Total - (Every other component)
            const totalAllocated = basic + hra + standardAllowance + performanceBonus + travelAllowance;
            const fixedAllowance = Math.round((editWage - totalAllocated) * 100) / 100;

            const salaryData = {
               totalWage: editWage,
               yearlyWage: editWage * 12,
               workingDaysPerWeek: editWorkingDays,
               breakTime: editBreakTime,

               basicType, basicValue,
               hraType, hraValue,
               stdType, stdValue,
               bonusType, bonusValue,
               ltaType, ltaValue,
               pfRate, profTax,

               basic,
               hra,
               standardAllowance,
               performanceBonus,
               travelAllowance,
               fixedAllowance,
               pfEmployer,
               pfEmployee
            };

            const updated = await api.salaries.update(user.id, salaryData);
            setSalary(updated);
            toast.success('Salary updated successfully!', { id: loadingToast });
         } catch (e) {
            toast.error("Failed to update salary", { id: loadingToast });
         }
      }
   };

   const handleSaveProfile = async () => {
      if (user && id) {
         const loadingToast = toast.loading("Saving changes...");
         try {
            const updated = await api.users.updateProfile(id, editUser, editProfile);
            setUser(updated);
            setProfile(updated.profile || null);
            setIsEditing(false);
            toast.success('Profile updated successfully!', { id: loadingToast });
         } catch (e) {
            console.error(e);
            toast.error('Failed to update profile', { id: loadingToast });
         }
      }
   };

   const handleAddSkill = () => {
      if (newSkill.trim() && !editProfile.skills?.includes(newSkill.trim())) {
         const updatedSkills = [...(editProfile.skills || []), newSkill.trim()];
         setEditProfile({ ...editProfile, skills: updatedSkills });
         setNewSkill('');
         toast.success("Skill added locally. Don't forget to save!");
      }
   };

   const handleRemoveSkill = (skill: string) => {
      const updatedSkills = (editProfile.skills || []).filter(s => s !== skill);
      setEditProfile({ ...editProfile, skills: updatedSkills });
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
         const loadingToast = toast.loading("Uploading image...");
         try {
            const { imageUrl } = await api.profiles.uploadImage(user.id, file);
            setUser({ ...user, profilePictureUrl: imageUrl });
            toast.success('Profile picture updated!', { id: loadingToast });
         } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to upload image', { id: loadingToast });
         }
      }
   };

   const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && id) {
         setNamingModal({ isOpen: true, file, name: file.name });
      }
      // Reset input
      e.target.value = '';
   };

   const handleNamingSubmit = async () => {
      if (namingModal.file && id) {
         setUploadingDoc(true);
         const loadingToast = toast.loading("Uploading document...");
         try {
            const name = namingModal.name || namingModal.file.name;
            const type = namingModal.file.type.split('/')[1]?.toUpperCase() || 'DOC';
            await api.users.uploadDocument(id, namingModal.file, name, type);
            const u = await api.users.getById(id);
            if (u && u.profile) setProfile(u.profile);
            toast.success('Document uploaded successfully!', { id: loadingToast });
            setNamingModal({ isOpen: false, file: null, name: '' });
         } catch (error) {
            console.error('Doc upload failed', error);
            toast.error('Failed to upload document', { id: loadingToast });
         }
         setUploadingDoc(false);
      }
   };

   const handleDeleteDocument = async () => {
      if (id && deleteModal.url) {
         const loadingToast = toast.loading("Deleting document...");
         try {
            await api.users.deleteDocument(id, deleteModal.url);
            const u = await api.users.getById(id);
            if (u && u.profile) setProfile(u.profile);
            toast.success('Document deleted successfully!', { id: loadingToast });
         } catch (e) {
            toast.error("Failed to delete document", { id: loadingToast });
         }
      }
   };

   const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         toast.error("Passwords do not match");
         return;
      }
      const loadingToast = toast.loading("Changing password...");
      try {
         await api.users.changePassword(id!, {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
         });
         toast.success("Password changed successfully!", { id: loadingToast });
         setShowPasswordModal(false);
         setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (e) {
         toast.error((e as any).response?.data?.message || "Failed to change password", { id: loadingToast });
      }
   };

   if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
   if (!user || !profile) return <div>User not found</div>;

   const isOwnProfile = currentUser?.id === user.id;
   const isAdmin = currentUser?.role === Role.ADMIN;

   // Admin cannot edit their own profile, but can edit others. Employees can edit their own.
   const canEdit = (isOwnProfile && !isAdmin) || (!isOwnProfile && isAdmin);

   // Restrict tabs for Admin on their own profile
   const tabs = (isAdmin && isOwnProfile) ? [
      { id: 'security', label: 'Security' }
   ] : [
      { id: 'resume', label: 'Resume' },
      { id: 'private', label: 'Private Info' },
      ...(isAdmin ? [{ id: 'salary', label: 'Salary Info' }] : []),
      { id: 'security', label: 'Security' },
      { id: 'docs', label: 'Documents' },
   ];

   useEffect(() => {
      // If Admin is viewing own profile, ensure they are on a visible tab (Security)
      if (isAdmin && isOwnProfile && activeTab !== 'security') {
         setActiveTab('security');
      }
   }, [isAdmin, isOwnProfile, activeTab]);

   return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
         <ConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, url: '' })}
            onConfirm={handleDeleteDocument}
            title="Delete Document?"
            message="This action cannot be undone. The file will be permanently removed."
         />

         {namingModal.isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
               <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-100">
                  <button onClick={() => setNamingModal({ isOpen: false, file: null, name: '' })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                  </button>
                  <div className="space-y-6">
                     <div className="text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                           <FileText size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Name your document</h2>
                        <p className="text-slate-500 text-sm mt-1">Give this file a descriptive name for easy tracking.</p>
                     </div>
                     <div>
                        <input
                           autoFocus
                           className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                           value={namingModal.name}
                           onChange={e => setNamingModal({ ...namingModal, name: e.target.value })}
                           onKeyDown={e => e.key === 'Enter' && handleNamingSubmit()}
                        />
                     </div>
                     <button
                        onClick={handleNamingSubmit}
                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                     >
                        Upload Document
                     </button>
                  </div>
               </div>
            </div>
         )}
         {/* Header */}
         <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative">
            <div className="relative group">
               <div className="w-32 h-32 rounded-full border-4 border-slate-50 overflow-hidden shadow-sm flex-shrink-0">
                  {user.profilePictureUrl ? (
                     <img src={user.profilePictureUrl} className="w-full h-full object-cover" />
                  ) : (
                     <div className={`w-full h-full flex items-center justify-center text-white font-bold text-6xl ${getAvatarColor(`${user.firstName} ${user.lastName}`)}`}>
                        {getInitials(user.firstName, user.lastName)}
                     </div>
                  )}
               </div>
               {isOwnProfile && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                     <span className="text-xs font-bold">Change</span>
                     <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
               )}
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
               {isEditing ? (
                  <div className="flex flex-col md:flex-row gap-3">
                     <input className="text-2xl font-bold text-slate-900 border-b border-slate-300 outline-none focus:border-slate-900"
                        value={editUser.firstName} onChange={e => setEditUser({ ...editUser, firstName: e.target.value })} />
                     <input className="text-2xl font-bold text-slate-900 border-b border-slate-300 outline-none focus:border-slate-900"
                        value={editUser.lastName} onChange={e => setEditUser({ ...editUser, lastName: e.target.value })} />
                  </div>
               ) : (
                  <h1 className="text-3xl font-bold text-slate-900">{user.firstName} {user.lastName} <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-500 font-medium ml-2">{user.role}</span></h1>
               )}
               <p className="text-lg text-slate-600">{user.role === Role.ADMIN ? 'Administrator Account' : profile.jobPosition}</p>
               <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-500 pt-2">
                  <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                  {user.role !== Role.ADMIN && (
                     <>
                        <span className="flex items-center gap-1"><Phone size={14} /> {profile.phone || 'N/A'}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {profile.address || 'N/A'}</span>
                     </>
                  )}
               </div>
            </div>

            <div className="flex flex-col items-end gap-3">
               {canEdit && (
                  isEditing ? (
                     <div className="flex gap-2">
                        <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800">
                           <Save size={16} /> Save Changes
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditProfile({ ...profile }); }} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">
                           <X size={16} /> Cancel
                        </button>
                     </div>
                  ) : (
                     <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">
                        <Edit size={16} /> Edit Profile
                     </button>
                  )
               )}
               {user.role !== Role.ADMIN && (
                  <div className="text-right hidden md:block space-y-1 mt-auto">
                     <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Department</div>
                     <div className="font-medium text-slate-800">{profile.department}</div>
                  </div>
               )}
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
                     {isEditing ? (
                        <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-slate-100" rows={4}
                           placeholder="Write a brief professional summary..."
                           value={editProfile.nationality || ''} // Reusing nationality for now or adding bio to schema?
                           onChange={e => setEditProfile({ ...editProfile, nationality: e.target.value })} />
                     ) : (
                        <p className="text-slate-600 leading-relaxed text-sm">
                           {profile.nationality || "Professional passionate about delivering high-quality results and driving innovation within the team."}
                        </p>
                     )}

                     <SectionHeader icon={<Briefcase size={18} />} title="Work Information" />
                     <div className="grid grid-cols-2 gap-4">
                        {isEditing ? (
                           <>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
                                 <input className="w-full border-b border-slate-200 outline-none text-sm py-1" value={editProfile.department} onChange={e => setEditProfile({ ...editProfile, department: e.target.value })} />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Job Position</label>
                                 <input className="w-full border-b border-slate-200 outline-none text-sm py-1" value={editProfile.jobPosition} onChange={e => setEditProfile({ ...editProfile, jobPosition: e.target.value })} />
                              </div>
                           </>
                        ) : (
                           <>
                              <InfoBox label="Department" value={profile.department} />
                              <InfoBox label="Job Position" value={profile.jobPosition} />
                              <InfoBox label="Manager" value={profile.managerId ? 'Assigned' : 'None'} />
                              <InfoBox label="Work Email" value={user.email} />
                           </>
                        )}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <SectionHeader icon={<CreditCard size={18} />} title="Skills & Certifications" />
                     <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {(isEditing ? editProfile.skills : profile.skills)?.map(skill => (
                              <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 group">
                                 {skill}
                                 {isEditing && (
                                    <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-500">
                                       <X size={12} />
                                    </button>
                                 )}
                              </span>
                           )) || <span className="text-slate-400 text-xs italic">No skills added yet</span>}
                        </div>

                        {isEditing && (
                           <div className="flex gap-2">
                              <input
                                 className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-100"
                                 placeholder="Add a new skill..."
                                 value={newSkill}
                                 onChange={e => setNewSkill(e.target.value)}
                                 onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                              />
                              <button onClick={handleAddSkill} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                 <Plus size={14} /> Add
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'private' && (
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <h3 className="font-bold text-slate-800 border-b pb-2">Personal Information</h3>
                     <div className="space-y-4">
                        {isEditing ? (
                           <>
                              <EditRow label="Phone" value={editProfile.phone} onChange={v => setEditProfile({ ...editProfile, phone: v })} />
                              <EditRow label="Address" value={editProfile.address} onChange={v => setEditProfile({ ...editProfile, address: v })} />
                              <EditRow label="Gender" value={editProfile.gender} onChange={v => setEditProfile({ ...editProfile, gender: v })} isSelect options={['Male', 'Female', 'Other']} />
                              <EditRow label="Marital Status" value={editProfile.maritalStatus} onChange={v => setEditProfile({ ...editProfile, maritalStatus: v })} isSelect options={['Single', 'Married', 'Divorced']} />
                           </>
                        ) : (
                           <>
                              <Row label="Date of Birth" value="-" />
                              <Row label="Nationality" value={profile.nationality} />
                              <Row label="Gender" value={profile.gender} />
                              <Row label="Marital Status" value={profile.maritalStatus} />
                              <Row label="Personal Email" value={profile.personalEmail} />
                           </>
                        )}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="font-bold text-slate-800 border-b pb-2">Bank Account</h3>
                     <div className="space-y-4">
                        {isEditing ? (
                           <>
                              <EditRow label="Account Number" value={editProfile.bankAccountNo} onChange={v => setEditProfile({ ...editProfile, bankAccountNo: v })} />
                              <EditRow label="IFSC Code" value={editProfile.ifsc} onChange={v => setEditProfile({ ...editProfile, ifsc: v })} />
                              <EditRow label="PAN Number" value={editProfile.pan} onChange={v => setEditProfile({ ...editProfile, pan: v })} />
                              <EditRow label="UAN" value={editProfile.uan} onChange={v => setEditProfile({ ...editProfile, uan: v })} />
                           </>
                        ) : (
                           <>
                              <Row label="Bank Name" value="HDFC Bank" />
                              <Row label="Account Number" value={profile.bankAccountNo} />
                              <Row label="IFSC Code" value={profile.ifsc} />
                              <Row label="PAN No" value={profile.pan} />
                              <Row label="UAN" value={profile.uan} />
                           </>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'salary' && salary && (
               <div className="space-y-6 animate-fadeIn pb-10">
                  {/* Header Row: Wage & Schedule */}
                  <div className="bg-white border-b border-slate-200 pb-8">
                     <div className="flex items-center gap-2 mb-6 text-slate-900 px-4">
                        <FileText size={18} className="text-slate-400" />
                        <h4 className="text-sm font-bold uppercase tracking-widest">Salary Configuration Info</h4>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4">
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-bold text-slate-700">Month Wage</label>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-64 shadow-inner">
                                    <input
                                       type="number"
                                       value={editWage}
                                       onChange={(e) => setEditWage(parseFloat(e.target.value) || 0)}
                                       disabled={isOwnProfile}
                                       className={`bg-transparent w-full text-xl font-mono font-bold px-3 py-1 outline-none text-right ${isOwnProfile ? 'text-slate-400' : 'text-slate-900'}`}
                                    />
                                    <span className="text-xs font-bold text-slate-400 border-l pl-3 pr-2">/ Month</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-bold text-slate-700">Yearly wage</label>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100 border-dashed w-64">
                                    <div className="w-full text-xl font-mono font-bold px-3 py-1 text-right text-slate-500">
                                       {(editWage * 12).toLocaleString('en-IN')}
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 border-l pl-3 pr-2">/ Yearly</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <label className="text-sm font-bold text-slate-700">No of working days</label>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">in a week:</p>
                              </div>
                              <input
                                 type="number"
                                 value={editWorkingDays}
                                 onChange={(e) => setEditWorkingDays(parseInt(e.target.value) || 0)}
                                 disabled={isOwnProfile}
                                 className="w-32 bg-slate-50 border border-slate-200 rounded-xl text-xl font-mono font-bold px-4 py-2.5 outline-none text-right focus:border-slate-900 transition-all shadow-inner"
                              />
                           </div>
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-bold text-slate-700">Break Time:</label>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-32 shadow-inner">
                                    <input
                                       type="number"
                                       step="0.5"
                                       value={editBreakTime}
                                       onChange={(e) => setEditBreakTime(parseFloat(e.target.value) || 0)}
                                       disabled={isOwnProfile}
                                       className="bg-transparent w-full text-xl font-mono font-bold px-2 py-1 outline-none text-right"
                                    />
                                    <span className="text-xs font-bold text-slate-400 border-l pl-2 pr-1">/hrs</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Body: Two Columns */}
                  {(() => {
                     // Real-time calculations
                     const basic = Math.round(basicType === 'percent' ? editWage * basicValue / 100 : basicValue);
                     const hra = Math.round(hraType === 'percent' ? basic * hraValue / 100 : hraValue);
                     const std = Math.round(stdType === 'percent' ? basic * stdValue / 100 : stdValue);
                     const bonus = Math.round(bonusType === 'percent' ? basic * bonusValue / 100 : bonusValue);
                     const lta = Math.round(ltaType === 'percent' ? basic * ltaValue / 100 : ltaValue);

                     const pfEmpr = Math.round(basic * pfRate / 100);
                     const pfEmpe = Math.round(basic * pfRate / 100);

                     const fixed = Math.round((editWage - (basic + hra + std + bonus + lta)) * 100) / 100;
                     const gross = basic + hra + std + bonus + lta + (fixed > 0 ? fixed : 0);
                     const net = gross - pfEmpe - profTax;

                     return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4">
                           {/* Left Column: Salary Components */}
                           <div className="space-y-4">
                              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-4">
                                 <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">Salary Components</h4>
                              </div>
                              <div className="space-y-1">
                                 <ConfigInput
                                    label="Basic Salary"
                                    typeValue={basicType}
                                    value={basicValue}
                                    onTypeChange={setBasicType}
                                    onValueChange={setBasicValue}
                                    calculatedAmount={basic}
                                    effectivePercent={editWage > 0 ? (basic / editWage * 100) : 0}
                                    description="Define Basic salary from company cost compute it based on monthly Wages"
                                 />
                                 <ConfigInput
                                    label="House Rent Allowance"
                                    typeValue={hraType}
                                    value={hraValue}
                                    onTypeChange={setHraType}
                                    onValueChange={setHraValue}
                                    calculatedAmount={hra}
                                    effectivePercent={basic > 0 ? (hra / basic * 100) : 0}
                                    description="HRA provided to employees 50% of the basic salary"
                                 />
                                 <ConfigInput
                                    label="Standard Allowance"
                                    typeValue={stdType}
                                    value={stdValue}
                                    onTypeChange={setStdType}
                                    onValueChange={setStdValue}
                                    calculatedAmount={std}
                                    effectivePercent={editWage > 0 ? (std / editWage * 100) : 0}
                                    description="A standard allowance is a predetermined, fixed amount provided to employee as part of their salary"
                                 />
                                 <ConfigInput
                                    label="Performance Bonus"
                                    typeValue={bonusType}
                                    value={bonusValue}
                                    onTypeChange={setBonusType}
                                    onValueChange={setBonusValue}
                                    calculatedAmount={bonus}
                                    effectivePercent={editWage > 0 ? (bonus / editWage * 100) : 0}
                                    description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the monthly wage"
                                 />
                                 <ConfigInput
                                    label="Leave Travel Allowance"
                                    typeValue={ltaType}
                                    value={ltaValue}
                                    onTypeChange={setLtaType}
                                    onValueChange={setLtaValue}
                                    calculatedAmount={lta}
                                    effectivePercent={editWage > 0 ? (lta / editWage * 100) : 0}
                                    description="LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the monthly wage"
                                 />
                                 <div className="flex flex-col gap-1.5 py-4 px-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                    <div className="flex items-center justify-between">
                                       <label className="text-sm font-bold text-slate-800 tracking-tight">Fixed Allowance</label>
                                       <div className="flex items-center gap-3">
                                          <div className="w-28 text-right font-mono font-bold text-xs text-slate-900 pr-2">
                                             ₹{fixed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                          </div>
                                          <div className="w-16 text-right font-mono font-bold text-[10px] text-slate-500 pr-2">
                                             {editWage > 0 ? (fixed / editWage * 100).toFixed(2) : '0.00'}%
                                          </div>
                                       </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium italic pl-1">fixed allowance portion of wages is determined after calculating all salary components</p>
                                 </div>
                              </div>

                              <div className="pt-8">
                                 <button
                                    onClick={handleUpdateSalary}
                                    disabled={fixed < -0.01}
                                    className={`w-full font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest ${fixed < -0.01 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'}`}
                                 >
                                    <Save size={20} /> Save Structure Config
                                 </button>
                                 {fixed < -0.01 && (
                                    <p className="text-red-500 text-[10px] font-bold uppercase mt-3 text-center tracking-tighter animate-pulse">
                                       Warning: Components + Employer PF exceed CTC (₹{(-fixed).toLocaleString()})
                                    </p>
                                 )}
                              </div>
                           </div>

                           {/* Right Column: PF & Tax */}
                           <div className="space-y-12">
                              {/* PF Section */}
                              <div className="space-y-6">
                                 <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">Provident Fund (PF) Contribution</h4>
                                 </div>
                                 <div className="space-y-8">
                                    <div className="flex flex-col gap-2">
                                       <div className="flex items-center justify-between">
                                          <label className="text-sm font-bold text-slate-700">Employee</label>
                                          <div className="flex items-center gap-4">
                                             <div className="w-32 text-right font-mono font-bold text-sm text-slate-900 border-b border-slate-900 pb-1">
                                                ₹{pfEmpe.toLocaleString('en-IN')}
                                             </div>
                                             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                <input
                                                   type="number"
                                                   value={pfRate}
                                                   onChange={e => setPfRate(parseFloat(e.target.value) || 0)}
                                                   className="w-16 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold px-2 py-1 outline-none text-right"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 pr-1">%</span>
                                             </div>
                                          </div>
                                       </div>
                                       <p className="text-[11px] text-slate-400 italic">PF is calculated based on the basic salary</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                       <div className="flex items-center justify-between">
                                          <label className="text-sm font-bold text-slate-700">Employe'r</label>
                                          <div className="flex items-center gap-4">
                                             <div className="w-32 text-right font-mono font-bold text-sm text-slate-900 border-b border-slate-900 pb-1">
                                                ₹{pfEmpr.toLocaleString('en-IN')}
                                             </div>
                                             <div className="w-16 text-right font-mono font-bold text-xs text-slate-500 px-2 py-1">
                                                {pfRate.toFixed(2)}%
                                             </div>
                                          </div>
                                       </div>
                                       <p className="text-[11px] text-slate-400 italic">PF is calculated based on the basic salary</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Tax Section */}
                              <div className="space-y-6">
                                 <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">Tax Deductions</h4>
                                 </div>
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                       <label className="text-sm font-bold text-slate-700">Professional Tax</label>
                                       <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                             <input
                                                type="number"
                                                value={profTax}
                                                onChange={e => setProfTax(parseFloat(e.target.value) || 0)}
                                                className="w-24 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold px-2 py-1.5 outline-none text-right"
                                             />
                                             <span className="text-[10px] font-bold text-slate-400 pr-2">₹ / month</span>
                                          </div>
                                       </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic">Professional Tax deducted from the Gross salary</p>
                                 </div>
                              </div>

                              {/* Net Salary Summary Card */}
                              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                 <div className="absolute -top-10 -right-10 opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                                    <CreditCard size={180} className="text-white" />
                                 </div>
                                 <div className="relative z-10 space-y-4">
                                    <div>
                                       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Take Home Pay</p>
                                       <div className="flex items-baseline gap-2">
                                          <span className="text-5xl font-mono font-black text-white tracking-tighter">
                                             ₹{net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                          </span>
                                          <span className="text-slate-400 font-bold text-sm">/ Month</span>
                                       </div>
                                    </div>
                                    <div className="h-px bg-slate-800 w-full my-4"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Annual Take Home</p>
                                          <p className="text-sm font-mono font-bold text-slate-200">₹{(net * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Effective Tax Rate</p>
                                          <p className="text-sm font-mono font-bold text-slate-200">{gross > 0 ? ((gross - net) / gross * 100).toFixed(1) : 0}%</p>
                                       </div>
                                    </div>
                                    <p className="text-[9px] text-slate-500 italic leading-relaxed pt-2 border-t border-slate-800">
                                       * Values are estimates based on standard rules. Final payout may vary due to attendance & variable pay components.
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })()}
               </div>
            )}

            {activeTab === 'security' && (
               <div className="max-w-md space-y-8">
                  <h3 className="flex items-center text-lg font-bold text-slate-800 border-b pb-2">
                     Account Security
                  </h3>
                  <div className="space-y-4">
                     <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Login ID / Employee ID</p>
                        <p className="font-mono font-bold text-slate-900 text-2xl tracking-widest">{user.employeeId}</p>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${user.isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                           <span className="text-sm font-bold text-slate-700">{user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}</span>
                        </div>
                        {!user.isEmailVerified && (
                           <button onClick={() => toast.success("Verification email resent!")} className="text-xs font-bold text-blue-600 hover:underline">Resend Verification</button>
                        )}
                     </div>

                     <button onClick={() => setShowPasswordModal(true)} className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                        <Lock size={18} /> Change Password
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'docs' && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 text-lg">Employee Documents</h3>
                     <label className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all cursor-pointer">
                        <Upload size={16} /> {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                        <input type="file" className="hidden" onChange={handleDocumentUpload} disabled={uploadingDoc} />
                     </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                     {profile.documents?.length ? profile.documents.map((doc: any, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                                 <FileText size={20} />
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{doc.name}</p>
                                 <p className="text-xs text-slate-400 capitalize">{doc.type || 'Document'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 p-2">
                                 <Globe size={16} />
                              </a>
                              <button
                                 onClick={() => setDeleteModal({ isOpen: true, url: doc.url })}
                                 className="text-slate-400 hover:text-red-500 p-2"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                     )) : (
                        <div className="md:col-span-2 py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                           <FileText size={48} className="mb-3 opacity-20" />
                           <p className="text-sm">No documents uploaded yet</p>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Password Modal */}
         {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
               <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                     <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                        <input required type="password"
                           className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                           value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                        <input required type="password"
                           className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                           value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                        <input required type="password"
                           className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                           value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                     </div>
                     <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-2">
                        Update Password
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
   <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
      <span className="text-slate-900">{icon}</span>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
   </div>
);

const InfoBox = ({ label, value }: { label: string, value: string }) => (
   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{label}</div>
      <div className="text-sm text-slate-800 font-bold mt-0.5 truncate">{value}</div>
   </div>
);

const Row = ({ label, value }: { label: string, value: string | undefined }) => (
   <div className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className="text-slate-800 font-bold text-sm">{value || '—'}</span>
   </div>
);

const EditRow = ({ label, value, onChange, isSelect, options }: { label: string, value: any, onChange: (v: any) => void, isSelect?: boolean, options?: string[] }) => (
   <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {isSelect ? (
         <select className="text-sm font-bold text-slate-800 bg-transparent outline-none focus:text-blue-600" value={value || ''} onChange={e => onChange(e.target.value)}>
            {options?.map(o => <option key={o}>{o}</option>)}
         </select>
      ) : (
         <input className="text-sm font-bold text-slate-800 bg-transparent outline-none focus:text-blue-600" value={value || ''} onChange={e => onChange(e.target.value)} />
      )}
   </div>
);

const ConfigInput = ({
   label,
   typeValue,
   value,
   onTypeChange,
   onValueChange,
   calculatedAmount,
   effectivePercent,
   description
}: {
   label: string,
   typeValue: 'fixed' | 'percent',
   value: number,
   onTypeChange: (v: 'fixed' | 'percent') => void,
   onValueChange: (v: number) => void,
   calculatedAmount: number,
   effectivePercent: number,
   description: string
}) => (
   <div className="flex flex-col gap-1.5 py-4 first:pt-0 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors px-2 rounded-lg">
      <div className="flex items-center justify-between">
         <label className="text-sm font-bold text-slate-700 tracking-tight">{label}</label>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
               <input
                  type="number"
                  value={typeValue === 'fixed' ? value : calculatedAmount}
                  onChange={e => {
                     if (typeValue === 'fixed') onValueChange(parseFloat(e.target.value) || 0);
                  }}
                  readOnly={typeValue === 'percent'}
                  className={`w-28 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold px-2 py-1.5 outline-none text-right ${typeValue === 'percent' ? 'text-slate-500 bg-slate-50/50' : 'text-slate-900 focus:border-slate-400'}`}
               />
               <span className="text-[10px] font-bold text-slate-400">₹ / month</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
               <input
                  type="number"
                  value={typeValue === 'percent' ? value : effectivePercent}
                  onChange={e => {
                     if (typeValue === 'percent') onValueChange(parseFloat(e.target.value) || 0);
                  }}
                  readOnly={typeValue === 'fixed'}
                  className={`w-16 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold px-2 py-1.5 outline-none text-right ${typeValue === 'fixed' ? 'text-slate-500 bg-slate-50/50' : 'text-slate-900 focus:border-slate-400'}`}
               />
               <button
                  onClick={() => onTypeChange(typeValue === 'percent' ? 'fixed' : 'percent')}
                  className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all ${typeValue === 'percent' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200'}`}
               >
                  %
               </button>
            </div>
         </div>
      </div>
      <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed pl-0.5">{description}</p>
   </div>
);

const SalaryRow = ({ label, value, sub }: { label: string, value: number, sub?: string }) => (
   <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="py-2.5 px-2">
         <div className="text-slate-700 font-bold text-xs">{label}</div>
         {sub && <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{sub}</div>}
      </td>
      <td className="text-right py-2.5 pr-2 font-mono text-slate-900 font-bold text-sm">
         ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
      </td>
   </tr>
);

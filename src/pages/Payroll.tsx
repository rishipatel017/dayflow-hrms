import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockDb';
import { Role, SalaryStructure, User } from '../types';
import { DollarSign, Search, Save, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export const Payroll: React.FC = () => {
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState<User[]>([]);
    const [salaries, setSalaries] = useState<Record<string, SalaryStructure>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editWage, setEditWage] = useState<number>(0);

    const fetchData = async () => {
        setLoading(true);
        const allUsers = await api.users.getAll();
        const nonAdminUsers = allUsers.filter(u => u.role !== Role.ADMIN);

        const salaryMap: Record<string, SalaryStructure> = {};
        await Promise.all(nonAdminUsers.map(async (u) => {
            const sal = await api.salaries.getByUserId(u.id);
            if (sal) salaryMap[u.id] = sal;
        }));

        setEmployees(nonAdminUsers);
        setSalaries(salaryMap);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const handleEdit = (userId: string, currentWage: number) => {
        setEditingId(userId);
        setEditWage(currentWage);
    };

    const handleSave = async (userId: string) => {
        await api.salaries.update(userId, editWage);
        setEditingId(null);
        fetchData(); // Refresh to get calculated components
    };

    const filteredEmployees = employees.filter(e =>
        e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (currentUser?.role !== Role.ADMIN) {
        return <div className="p-8 text-center text-slate-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Payroll Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading payroll data...</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4 text-right">Monthly CTC</th>
                                    <th className="px-6 py-4 text-right">Basic</th>
                                    <th className="px-6 py-4 text-right">HRA</th>
                                    <th className="px-6 py-4 text-right">Allowances</th>
                                    <th className="px-6 py-4 text-right">Deductions</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => {
                                    const sal = salaries[emp.id];
                                    const isEditing = editingId === emp.id;
                                    const allowances = sal ? (sal.standardAllowance + sal.fixedAllowance + sal.travelAllowance) : 0;
                                    const deductions = sal ? (sal.pfEmployee + sal.profTax) : 0;

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {emp.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div>{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{emp.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editWage}
                                                        onChange={(e) => setEditWage(Number(e.target.value))}
                                                        className="w-24 text-right p-1 border rounded bg-white"
                                                    />
                                                ) : (
                                                    `₹${(sal?.totalWage || 0).toLocaleString()}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">
                                                ₹{(sal?.basic || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">
                                                ₹{(sal?.hra || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-600">
                                                +₹{allowances.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-red-500">
                                                -₹{deductions.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isEditing ? (
                                                    <button onClick={() => handleSave(emp.id)} className="text-emerald-600 hover:text-emerald-700 p-2 bg-emerald-50 rounded-lg">
                                                        <Save size={18} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEdit(emp.id, sal?.totalWage || 0)} className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg">
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

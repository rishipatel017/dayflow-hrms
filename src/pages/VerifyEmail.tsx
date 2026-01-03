import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, XCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your enterprise credentials...');

    useEffect(() => {
        const performVerification = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No security token found.');
                return;
            }

            try {
                const response = await api.auth.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully! Your account is now active.');
                toast.success('Account Verified!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
                toast.error('Verification Failed');
            }
        };

        const timer = setTimeout(performVerification, 1500);
        return () => clearTimeout(timer);
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
            <div className="w-full max-w-md text-center">
                {/* Logo */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 mb-8 transition-transform hover:scale-105">
                    <ShieldCheck size={32} />
                </div>

                <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/60 border border-slate-100 animate-fadeIn">
                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <Loader2 className="w-12 h-12 text-slate-300 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Securing Account</h1>
                            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 animate-slideUp">
                            <div className="flex justify-center">
                                <div className="bg-emerald-50 p-4 rounded-full border border-emerald-100">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Identity Verified</h1>
                            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-4"
                            >
                                Access Dashboard <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 animate-slideUp">
                            <div className="flex justify-center">
                                <div className="bg-red-50 p-4 rounded-full border border-red-100">
                                    <XCircle className="w-12 h-12 text-red-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verification Problem</h1>
                            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
                            <div className="pt-4 flex flex-col gap-3">
                                <Link to="/signup" className="text-slate-900 font-bold hover:underline decoration-2 underline-offset-4 transition-colors">Return to Registration</Link>
                                <Link to="/login" className="text-slate-400 text-xs hover:text-slate-500 transition-colors">Sign In Help</Link>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    Dayflow Secure Authentication
                </p>
            </div>
        </div>
    );
};

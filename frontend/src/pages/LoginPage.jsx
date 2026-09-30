import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) navigate(location.state?.from || '/dashboard', { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    useEffect(() => () => clearError(), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    const errorMessage = error?.detail || (typeof error === 'string' ? error : null);
    const justRegistered = location.state?.justRegistered;

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-8 glass-panel rounded-3xl shadow-xl shadow-purple-500/5 border border-purple-100 bg-white/70"
        >
            <div className="text-center space-y-2 mb-8">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
                <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to your enterprise console</p>
            </div>

            {justRegistered && !errorMessage && (
                <div className="flex items-start space-x-2 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Account created. Sign in to continue.</span>
                </div>
            )}

            {errorMessage && (
                <div className="flex items-start space-x-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-98 mt-2"
            >
                <span>{isLoading ? 'Signing in...' : 'Continue'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700">
                    Create one
                </Link>
            </p>
        </motion.div>
        </div>
    );
}

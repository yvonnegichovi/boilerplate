import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Mail, User, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    orgName: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 glass-panel rounded-3xl shadow-xl shadow-purple-500/5 border border-purple-100 bg-white/70"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
          <p className="text-sm text-slate-500">Get started with your enterprise workspace</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Organization Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="Acme Corp"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-98 mt-4"
          >
            <span>Create Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

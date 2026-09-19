import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Mail, User, Building, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import { orgApi } from '../api/organisations';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    orgName: '',
    password: '',
    passwordConfirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register, logout, error, clearError } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    if (formData.password !== formData.passwordConfirm) {
      setFieldErrors({ password_confirm: ['Passwords do not match.'] });
      return;
    }

    setSubmitting(true);
    const result = await register({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
      password_confirm: formData.passwordConfirm,
    });

    if (!result.success) {
      setFieldErrors(result.error || {});
      setSubmitting(false);
      return;
    }

    // Registration doesn't create an organisation itself - if the user gave
    // one, create it as a follow-up call now while the new access token is
    // still valid.
    if (formData.orgName.trim()) {
      try {
        await orgApi.create({ name: formData.orgName.trim() });
      } catch (_) {
        // Non-fatal: the account was created fine, org creation can be retried
        // from the Organisations page.
      }
    }

    // The register call above authenticates the user automatically, but we
    // want them to land on the login page and sign in deliberately rather
    // than being dropped straight into the dashboard.
    await logout();
    setSubmitting(false);
    navigate('/login', { state: { justRegistered: true } });
  };

  const topLevelError = error?.detail && !error?.email && !error?.password
    ? error.detail
    : null;

  const fieldError = (name) => {
    const err = fieldErrors[name] || error?.[name];
    if (!err) return null;
    return Array.isArray(err) ? err[0] : err;
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

        {topLevelError && (
          <div className="flex items-start space-x-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{topLevelError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Alex"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                />
              </div>
              {fieldError('first_name') && <p className="text-xs text-red-600 mt-1">{fieldError('first_name')}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Morgan"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
              {fieldError('last_name') && <p className="text-xs text-red-600 mt-1">{fieldError('last_name')}</p>}
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
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
            {fieldError('email') && <p className="text-xs text-red-600 mt-1">{fieldError('email')}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Organization Name <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
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
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
            {fieldError('password') && <p className="text-xs text-red-600 mt-1">{fieldError('password')}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
            </div>
            {fieldError('password_confirm') && <p className="text-xs text-red-600 mt-1">{fieldError('password_confirm')}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-98 mt-4"
          >
            <span>{submitting ? 'Creating account...' : 'Create Workspace'}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
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

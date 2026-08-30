import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Sparkles,
  Menu,
  X,
  Moon,
  Sun,
  Home
} from 'lucide-react';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import OrganisationsPage from './pages/OrganisationsPage';
import TasksPage from './pages/TasksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const navItems = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organisations', label: 'Organizations', icon: Building2 },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
];

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Drawer */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                PulseControl
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Navigation</div>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <item.icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="flex items-center space-x-2">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{isDarkMode ? 'Light Mode' : 'Night Mode'}</span>
              </span>
            </button>
          </div>
        </aside>

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  PulseControl
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition hover:bg-slate-100"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-white dark:bg-slate-950">
          <AnimatedRoutes />
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2026 PulseControl SaaS Architecture. All rights reserved.
        </footer>

      </div>
    </Router>
  );
}

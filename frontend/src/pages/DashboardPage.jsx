import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Building2, ArrowRight, Plus, AlertTriangle } from 'lucide-react';

import useAuthStore from '../context/authStore';
import useOrgStore from '../context/orgStore';
import useTaskStore from '../context/Taskstore';
import TaskForm from '../components/tasks/TaskForm';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const STATUS_STYLES = {
    todo: 'bg-slate-100 text-slate-600 border border-slate-200',
    in_progress: 'bg-purple-100 text-purple-700 border border-purple-200',
    done: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const STATUS_LABELS = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
};

export default function DashboardPage() {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const { user } = useAuthStore();
    const { organisations, fetchOrganisations } = useOrgStore();
    const { tasks, stats, isLoading, isLoadingStats, fetchTasks, fetchStats } = useTaskStore();

    useEffect(() => {
        fetchOrganisations();
        fetchStats();
        fetchTasks({ ordering: '-created_at' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTaskFormClose = () => {
         setShowTaskForm(false);
         // The task store already updates its `tasks` array optimistically on
         // create/update, so the recent-tasks list below refreshes on its own.
         // Stats are a separate aggregate, so refetch those explicitly.
         fetchStats();
     };

    const activeCount = stats ? (stats.by_status.todo || 0) + (stats.by_status.in_progress || 0) : null;
    const completedCount = stats ? stats.by_status.done || 0 : null;

    const statCards = [
        { title: 'Active Tasks', value: activeCount, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100/80' },
        { title: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/80' },
        { title: 'Organizations', value: organisations.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100/80' },
    ];

    const recentTasks = tasks.slice(0, 5);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">A quick overview of your tasks and workspaces.</p>
                </div>
                <button
                    onClick={() => setShowTaskForm(true)}
                    className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition-all duration-200 shadow-lg shadow-purple-500/25 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Task</span>
                </button>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                                    {isLoadingStats && stat.value === null ? '—' : stat.value ?? 0}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {stats && stats.overdue > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>
                        You have {stats.overdue} overdue {stats.overdue === 1 ? 'task' : 'tasks'}.{' '}
                        <Link to="/tasks" className="font-semibold underline">Take a look</Link>
                    </span>
                </motion.div>
            )}

            {/* Recent tasks */}
            <motion.div
                variants={itemVariants}
                className="glass-panel rounded-2xl overflow-hidden border border-purple-100 shadow-sm"
            >
                <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-white/50">
                    <h2 className="text-lg font-semibold text-slate-950">Recent Tasks</h2>
                    <Link
                        to="/tasks"
                        className="inline-flex items-center space-x-2 text-xs font-medium text-purple-700 hover:bg-purple-200/60 px-3 py-1.5 rounded-lg border border-purple-200 transition"
                    >
                        <span>View all</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="divide-y divide-purple-100/60 bg-white/40">
                    {isLoading ? (
                        <div className="p-6 text-sm text-slate-500">Loading tasks...</div>
                    ) : recentTasks.length === 0 ? (
                        <div className="p-6 text-sm text-slate-500">
                            No tasks yet. <Link to="/tasks" className="text-purple-600 font-medium">Create your first one</Link>.
                        </div>
                    ) : (
                        recentTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-purple-50/60 transition">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-slate-800 truncate">{task.title}</span>
                                    </div>
                                    <span className="inline-block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                        {task.priority} priority
                                    </span>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
                                    {STATUS_LABELS[task.status] || task.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
            {showTaskForm && <TaskForm onClose={handleTaskFormClose} />}
        </motion.div>
    );
}

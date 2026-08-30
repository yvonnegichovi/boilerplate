import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Users, ArrowRight, Plus, Filter } from 'lucide-react';


const stats = [
    { title: 'Active Tasks', value: '24', change: '+12%', icon: Clock, color: 'text-purple-600', bg:'bg-blue-500' },
    { title: 'Completed', value: '142', change: '+18%', icon: CheckCircle2, color: 'text-emerald-600', bg:'bg-emerald-100/80' },
    { title: 'Team Members', value: '18', change: '+3', icon: Users, color: 'text-indigo-600', bg:'bg-indigo-500' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DashboardPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Executive Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">A quick overview of your system's performance and key metrics.</p>
                </div>
                <button className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition-all duration-200 shadow-lg shadow-purple-500/25 active:scale-95">
                    <Plus className="h-4 w-4" />
                    <span>New Entry</span>
                </button>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                                <div className={`p-2.6 rounded-xl ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className='text-3xl font-bold text-slate-900 tracking-tight'>{stat.value}</span>
                                <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    {stat.change} <ArrowRight className="h-3 w-3 ml-0.5" />
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Dynamic Data Table Card */}
            <motion.div
                variants={itemVariants}
                className="glass-panel rounded-2xl overflow-hidden border border-purple-100 shadow-sm"
            >
                <div className="flex items-center justify-between p-6 border-b border-purple-400 bg-white/50">
                    <h2 className="text-lg font-semibold text-slate-950">Recent System Activities</h2>
                    <button className="inline-flex items-center space-x-2 text-xs font-medium text-purple-700 hover:bg-purple-200/60 px-3 py-1.5 rounded-lg border border-purple-200 transition">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>
                <div className="divide--y divide-purple-100/60 bg-white/40">
                    {[
                        { id: 'TSK-102', title: 'PostgreSQL Connection Pooling Optimization', status: 'In Progress', tag: 'Backend' },
                        { id: 'TSK-103', title: 'JWT Auth Refresh Middleware Implementation', status: 'Completed', tag: 'Auth' },
                        { id: 'TSK-104', title: 'Redis Cache Layer for Task Aggregation', status: 'Review', tag: 'Infrastructure' }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-purple-50/60 transition">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono text-xs text-purple-600 font-bold bg-purple-100 px-2 py-0.5 transition rounded">
                                        {item.id}
                                    </span>
                                    <span className="text-sm font-medium text-slate-800">{item.title}</span>
                                </div>
                                <span className="inline-block text-[10px] uppercase font--bold text-slate-400 tracking-wider">{item.id} • {item.tag}</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                item.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : item.status === 'In Progress'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

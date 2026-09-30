import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  CalendarClock,
  RefreshCw,
  ExternalLink,
  Flower2,
} from 'lucide-react';

import { celeryApi } from '../api/celery';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const STATUS_STYLES = {
  SUCCESS: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  FAILURE: 'bg-red-100 text-red-700 border border-red-200',
  PENDING: 'bg-slate-100 text-slate-600 border border-slate-200',
  STARTED: 'bg-purple-100 text-purple-700 border border-purple-200',
  RETRY: 'bg-amber-100 text-amber-700 border border-amber-200',
  REVOKED: 'bg-slate-200 text-slate-700 border border-slate-300',
};

const FLOWER_URL = import.meta.env.VITE_FLOWER_URL || '/flower/';

const REFRESH_INTERVAL_MS = 15000;

export default function CeleryMonitorPage() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [periodicTasks, setPeriodicTasks] = useState([]);
  const [workers, setWorkers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, tasksRes, periodicRes, workersRes] = await Promise.all([
        celeryApi.stats(),
        celeryApi.tasks(),
        celeryApi.periodicTasks(),
        celeryApi.workers(),
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data.results ?? tasksRes.data);
      setPeriodicTasks(periodicRes.data);
      setWorkers(workersRes.data);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load Celery monitoring data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAll]);

  const openFlower = useCallback(async () => {
    try {
      await celeryApi.startFlowerSession();
    } catch {
      // handled by the redirect above
    }
    window.open(FLOWER_URL, '_blank', 'noopener,noreferrer');
  }, []);

  const successCount = stats?.by_status?.SUCCESS || 0;
  const failureCount = stats?.by_status?.FAILURE || 0;

  const statCards = [
    { title: 'Total Task Runs', value: stats?.total, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100/80' },
    { title: 'Succeeded', value: successCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/80' },
    { title: 'Failed', value: failureCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100/80' },
    {
      title: 'Avg Duration',
      value: stats?.avg_duration_seconds != null ? `${stats.avg_duration_seconds}s` : null,
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100/80',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Celery Performance</h1>
          <p className="text-slate-500 text-sm mt-1">
            Live task/worker health, backed by our own API - refreshes every 15s.
            {lastUpdatedAt && (
              <span className="text-slate-400"> Last updated {lastUpdatedAt.toLocaleTimeString()}.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
              workers?.workers_online
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>
              {workers?.workers_online
                ? `${workers.workers_online} worker${workers.workers_online === 1 ? '' : 's'} online`
                : 'No workers responding'}
            </span>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {isLoading && stat.value == null ? '—' : stat.value ?? 0}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent task results */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-white/50">
            <h2 className="text-lg font-semibold text-slate-950">Recent Task Runs</h2>
          </div>
          <div className="divide-y divide-purple-100/60 bg-white/40 max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500">Loading task results...</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No task results yet. Once a worker picks up a task (e.g. the demo heartbeat, every
                minute), results will show up here.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.task_id} className="flex items-center justify-between gap-4 p-4 sm:p-6 hover:bg-purple-50/60 transition">
                  <div className="space-y-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate block">{task.task_name || 'unknown task'}</span>
                    <span className="text-xs text-slate-400">
                      {task.worker || 'unassigned'}
                      {task.duration_seconds != null ? ` · ${task.duration_seconds}s` : ''}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[task.status] || STATUS_STYLES.PENDING}`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Periodic (Beat) schedule */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
          <div className="flex items-center space-x-2 p-6 border-b border-purple-100 bg-white/50">
            <CalendarClock className="w-4 h-4 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-950">Beat Schedule</h2>
          </div>
          <div className="divide-y divide-purple-100/60 bg-white/40">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500">Loading schedule...</div>
            ) : periodicTasks.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No periodic tasks configured.</div>
            ) : (
              periodicTasks.map((pt) => (
                <div key={pt.name} className="p-4 sm:p-6 space-y-1">
                  <span className="text-sm font-medium text-slate-800 block truncate">{pt.name}</span>
                  <span className="text-xs text-slate-400 block truncate">{pt.task}</span>
                  <span className="text-xs text-purple-600 font-medium">{pt.schedule}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="glass-panel rounded-2xl border border-purple-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 flex-shrink-0">
            <Flower2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Flower</h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-md">
              The standard Celery admin tool - inspect task args/tracebacks, revoke or
              retry tasks, and drill into per-worker pools. Opens in its own tab since it's
              a separate service with its own UI.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openFlower}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-95 flex-shrink-0"
        >
          <span>Open Flower</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

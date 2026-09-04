import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Zap,
  Layers,
  Cpu,
  ShieldCheck,
  Terminal,
  CheckCircle,
  ExternalLink,
  Building2,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const backendSnippet = `class DynamicRateLimiter(BasePermission):
    """Distributed Redis sliding-window rate limiter for multi-tenant routes."""
    def has_permission(self, request, view):
        tenant_id = request.headers.get('X-Tenant-ID')
        cache_key = f"rate:{tenant_id}:{request.user.id}"

        # Atomically increment request count in Redis (100 req/min limit)
        current_reqs = redis_client.incr(cache_key)
        if current_reqs == 1:
            redis_client.expire(cache_key, 60)

        if current_reqs > 100:
            logger.warning(f"Tenant {tenant_id} rate limit exceeded.")
            raise Throttled(detail="Tenant rate limit reached. Retry in 60s.")
        return True`;

const frontendSnippet = `// Custom hook for multi-tenant state orchestration with Optimistic UI updates
export function useTenantTaskQueue(tenantId) {
  const [tasks, setTasks] = useState([]);

  const dispatchAsyncJob = async (jobPayload) => {
    // Optimistic cache mutation
    setTasks(prev => [{ id: 'temp-' + Date.now(), ...jobPayload, status: 'QUEUED' }, ...prev]);

    const response = await api.post(\`/api/v1/tenants/\${tenantId}/tasks/\`, jobPayload, {
      headers: { 'X-Tenant-ID': tenantId }
    });

    // WebSockets listener updates Celery worker execution status
    subscribeToTaskChannel(response.data.task_id, (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });
  };

  return { tasks, dispatchAsyncJob };
}`;

export default function LandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState('backend');
  const [previewTab, setPreviewTab] = useState('dashboard');

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Senior Software Engineer & Distributed Systems Architect</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
        >
          Enterprise Multi-Agency Platform Built with{' '}
          <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900 bg-clip-text text-transparent">
            Django, React & Redis
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Production-grade multi-tenant architecture featuring real-time Celery task queues, Redis sliding-window rate limiting, and modern glassmorphic UI.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-95"
          >
            <span>Explore App Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/yvonnegichovi/boilerplate/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-purple-950 font-semibold text-sm flex items-center justify-center space-x-2 transition"
          >
            <Code2 className="w-4 h-4 text-purple-600" />
            <span>Inspect Technical Codebase</span>
          </a>
        </motion.div>
      </section>

      {/* System Architecture Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Multi-Agency Isolation", desc: "Strict tenant data segregation at DB and cache layer.", icon: Building2 },
          { title: "Asynchronous Workflows", desc: "Celery workers with Redis for background task queues.", icon: Cpu },
          { title: "Sliding Rate Limiting", desc: "Custom throttle policy preventing tenant noisy-neighbor issues.", icon: ShieldCheck },
          { title: "Sub-10ms Cache Layer", desc: "L1/L2 Redis caching strategy for aggregate analytics.", icon: Zap }
        ].map((feat, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-purple-100 bg-white/70">
            <div className="p-2.5 w-fit rounded-xl bg-purple-100/80 text-purple-700 mb-3">
              <feat.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Interactive App Preview Glimpse */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-100 bg-white/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" /> Application Engine Preview
            </h2>
            <p className="text-xs text-slate-500">Live preview of tenant dashboard and isolated task queues</p>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 p-1 rounded-xl border border-purple-100">
            <button
              onClick={() => setPreviewTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                previewTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              Agency Dashboard
            </button>
            <button
              onClick={() => setPreviewTab('queues')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                previewTab === 'queues' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              Celery Monitor
            </button>
          </div>
        </div>

        {/* Mock UI Container */}
        <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 font-sans shadow-inner border border-slate-800">
          {previewTab === 'dashboard' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-purple-400">ACTIVE_TENANT: Acme_Corp_EU</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">CACHE_HIT 99.4%</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400">Active Agencies</div>
                  <div className="text-lg font-bold text-white">42</div>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400">Rate Limit Utilization</div>
                  <div className="text-lg font-bold text-amber-400">24%</div>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400">Queued Async Jobs</div>
                  <div className="text-lg font-bold text-purple-400">1,204</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>WORKER_ID</span>
                <span>TASK_NAME</span>
                <span>STATE</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span className="text-purple-400">celery@node-01</span>
                <span>tasks.aggregate_agency_metrics</span>
                <span className="text-emerald-400">SUCCESS (12ms)</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span className="text-purple-400">celery@node-02</span>
                <span>tasks.dispatch_webhook_notifications</span>
                <span className="text-purple-400 animate-pulse">RUNNING</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Codebase Snippet Section */}
      <section id="codebase" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Engineering Implementation</h2>
            <p className="text-slate-500 text-sm">Clean, modular code built for scalability and performance</p>
          </div>
          <div className="flex space-x-2 bg-purple-100/60 p-1 rounded-xl border border-purple-200 self-start">
            <button
              onClick={() => setActiveCodeTab('backend')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'backend' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              Django / Redis Rate Limiter
            </button>
            <button
              onClick={() => setActiveCodeTab('frontend')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'frontend' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              React / WebSockets Hook
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-900/30 shadow-xl">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              {activeCodeTab === 'backend' ? 'apps/tenants/permissions.py' : 'src/hooks/useTenantTaskQueue.js'}
            </span>
            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
              {activeCodeTab === 'backend' ? 'Python / Django REST' : 'JavaScript / React'}
            </span>
          </div>
          <pre className="p-5 text-xs md:text-sm font-mono text-purple-100 overflow-x-auto leading-relaxed">
            <code>{activeCodeTab === 'backend' ? backendSnippet : frontendSnippet}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

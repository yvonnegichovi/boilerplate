import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Tag, Calendar } from 'lucide-react';

const tasks = [
  { id: '1', title: 'Setup PostgreSQL Read Replica', priority: 'High', date: 'Aug 30', status: 'In Progress' },
  { id: '2', title: 'Implement Celery Task Queue Rate Limiting', priority: 'Medium', date: 'Sep 02', status: 'Pending' },
  { id: '3', title: 'Configure Tailwind Light Lavender System', priority: 'Low', date: 'Aug 29', status: 'Completed' },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Sprint activities and background execution items</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ x: 2 }}
            className="p-4 rounded-xl border border-purple-100 bg-white/90 shadow-sm flex items-center justify-between hover:border-purple-300 transition"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{task.title}</h4>
                <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {task.date}</span>
                  <span className="flex items-center"><Tag className="w-3 h-3 mr-1" /> {task.priority}</span>
                </div>
              </div>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              task.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : task.status === 'In Progress'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {task.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

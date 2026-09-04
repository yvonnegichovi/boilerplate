import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Tag, Calendar, Pencil, Trash2 } from 'lucide-react';

import useTaskStore from '../context/Taskstore';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';

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

export default function TasksPage() {
  const { tasks, count, isLoading, fetchTasks, deleteTask } = useTaskStore();
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    fetchTasks(clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            {count} personal {count === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-slate-500 py-12 text-center">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center glass-card rounded-2xl border border-purple-100">
            <CheckSquare className="w-8 h-8 text-purple-300" />
            <p className="text-slate-500 text-sm">No tasks yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-xs text-white transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first task</span>
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
            return (
              <motion.div
                key={task.id}
                whileHover={{ x: 2 }}
                className="p-4 rounded-xl border border-purple-100 bg-white/90 shadow-sm flex items-center justify-between hover:border-purple-300 transition gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{task.title}</h4>
                    <div className="flex items-center flex-wrap gap-x-3 mt-1 text-xs text-slate-400">
                      {task.due_date && (
                        <span className={`flex items-center ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                          <Calendar className="w-3 h-3 mr-1" /> {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="flex items-center capitalize">
                        <Tag className="w-3 h-3 mr-1" /> {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                    aria-label="Edit task"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {showForm && <TaskForm task={editingTask} onClose={handleCloseForm} />}
    </div>
  );
}

import { CheckSquare, Tag, Calendar, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import useTaskStore from '../../context/Taskstore'

export default function TaskCard({ task, onEdit, slug }) {
    const { deleteTask } = useTaskStore()

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${task.title}"?`)) return
        await deleteTask(task.id, slug)
    }

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

    return (
        <div className="p-4 rounded-xl border border-purple-100 bg-white/90 shadow-sm flex items-center justify-between hover:border-purple-300 transition gap-4">
            <div className="flex items-center space-x-4 min-w-0">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0">
                    <CheckSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{task.title}</h4>
                    {task.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                    )}
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
                <StatusBadge status={task.status} />
                <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                    aria-label="Edit task"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    aria-label="Delete task"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

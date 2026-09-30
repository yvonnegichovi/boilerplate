const selectClass =
    'w-auto px-3 py-2 rounded-xl border border-purple-100 bg-white text-slate-700 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition'

export default function TaskFilters({ filters, onChange }) {
    const handle = (key, value) => onChange({ ...filters, [key]: value })

    return (
        <div className="task-filters flex flex-wrap gap-2">
            <select
                className={selectClass}
                value={filters.status || ''}
                onChange={(e) => handle('status', e.target.value)}
            >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            <select
                className={selectClass}
                value={filters.priority || ''}
                onChange={(e) => handle('priority', e.target.value)}
            >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            <select
                className={selectClass}
                value={filters.ordering || '-created_at'}
                onChange={(e) => handle('ordering', e.target.value)}
            >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="due_date">Due Date (soonest)</option>
                <option value="-due_date">Due Date (latest)</option>
                <option value="priority">Priority</option>
            </select>
        </div>
    )
}

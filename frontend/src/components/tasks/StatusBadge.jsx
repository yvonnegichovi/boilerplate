const STATUS_STYLES = {
    todo: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const STATUS_LABELS = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
}

export default function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}

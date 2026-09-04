const PRIORITY_STYLES = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
}

export default function PriorityBadge({ priority }) {
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {priority}
        </span>
    )
}

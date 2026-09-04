const STATUS_STYLES = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    expired: 'bg-slate-100 text-slate-600 border-slate-200',
    revoked: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABELS = {
    pending: 'Pending',
    accepted: 'Accepted',
    expired: 'Expired',
    revoked: 'Revoked',
}

export default function InviteStatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}

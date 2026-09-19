const ROLE_STYLES = {
    owner: 'bg-amber-100 text-amber-700 border-amber-200',
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    member: 'bg-slate-100 text-slate-600 border-slate-200',
}

const ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
}

export default function RoleBadge({ role }) {
    if (!role) return null
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${ROLE_STYLES[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {ROLE_LABELS[role] || role}
        </span>
    )
}

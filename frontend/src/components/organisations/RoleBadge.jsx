const ROLE_STYLES = {
    owner: 'badge badge-owner',
    admin: 'badge badge-admin',
    member: 'badge badge-member',
}

const ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
}

export default function RoleBadge({ role }) {
    if (!role) return null
    return (
        <span className={ROLE_STYLES[role] || 'badge'}>
            {ROLE_LABELS[role] || role}
        </span>
    )
}

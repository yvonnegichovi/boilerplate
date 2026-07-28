const STATUS_STYLES = {
    pending: 'badge badge-pending',
    accepted: 'badge badge-done',
    expired: 'badge badge-todo',
    revoked: 'badge badge-high',
}

const STATUS_LABELS = {
    pending: 'Pending',
    accepted: 'Accepted',
    expired: 'Expired',
    revoked: 'Revoked',
}

export default function InviteStatusBadge({ status }) {
    return (
        <span className={STATUS_STYLES[status] || 'badge'}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}

const PRIORITY_STYLES = {
    low: 'badge badge-low',
    medium: 'badge badge-medium',
    high: 'badge badge-high',
}

export default function PriorityBadge({ priority }) {
    return (
        <span className={PRIORITY_STYLES[priority] || 'badge'}>
            {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
        </span>
    )
}

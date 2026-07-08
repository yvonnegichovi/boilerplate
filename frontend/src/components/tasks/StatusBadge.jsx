const STATUS_STYLES = {
    todo: 'badge badge-todo',
    in_progess: 'badge badge-progress',
    done: 'badge badge-done',
}

const STATUS_LABELS = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
}

export default function StatusBadge({ status }) {
    return (
        <span className={STATUS_STYLES[status] || 'badge'}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import useTaskStore from '../../context/Taskstore'

export default function TaskCard({ task, onEdit }) {
    const { deleteTask } = useTaskStore()

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${task.title}"?`)) return
        await deleteTask(task.id)
    }

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year:'numeric'}) : '-'

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

    return (
        <div className='task-card'>
            <div className='task-card-header'>
                <h3 className='task-title'>{task.title}</h3>
                <div className='task-badges'>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                </div>
            </div>

            {task.description && (
                <p className='task-description'>{task.description}</p>
            )}

            <div className='task-card-footer'>
                <span className={`task-due ${isOverdue ? 'task-due-overdue' : ''}`}>
                    {isOverdue ? '⚠ ' : '📅 '}
                    {formatDate(task.due_date)}
                </span>
                <div className='task-actions'>
                    <button className='btn-icon btn-edit' onClick={() => onEdit(task)}>Edit</button>
                    <button className='btn-icon btn-delete' onClick={handleDelete}>Delete</button>
                </div>
            </div>
        </div>
    )
}
import { useEffect } from "react"
import { useForm } from 'react-hook-form'
import useTaskStore from "../../context/Taskstore"

export default function TaskForm({ task = null, onClose }) {
    const { createTask, updateTask, isSubmitting } = useTaskStore()
    const isEditing = !!task

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo',
            priority: task?.priority || 'medium',
            due_date: task?.due_date || '',
        },
    })

    useEffect(() => {
        if (task) reset(task)
    }, [task])

    const onSubmit = async (data) => {
        if (!data.due_date) delete data.due_date

        const result = isEditing
            ? await updateTask(task.id, data)
            : await createTask(data)

        if (result.success) onClose()
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Task' : 'New Task'}</h2>
                    <button className="modal-close" onClick={onClose}>X</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field">
                        <label>Title</label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            placeholder="What needs to be done?"
                        />
                        {errors.title && <span className="field-error">{errors.title.message}</span>}
                    </div>

                    <div className="field">
                        <label>Description <span className="field-optional">(optional)</span></label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Status</label>
                            <select {...register('status')}>
                                <option value='todo'>To Do</option>
                                <option value='in_progress'>In Progress</option>
                                <option value='done'>Done</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Priority</label>
                            <select {...register('priority')}>
                                <option value='low'>Low</option>
                                <option value='medium'>Medium</option>
                                <option value='high'>High</option>
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label>Due Date <span className="field-optional">(optional)</span></label>
                        <input type="date" {...register('due_date')} />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

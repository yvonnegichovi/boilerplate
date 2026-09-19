import { useEffect } from "react"
import { useForm } from 'react-hook-form'
import useTaskStore from "../../context/Taskstore"
import Modal from '../common/Modal'
import { labelClass, inputClass, selectClass, cancelButtonClass, submitButtonClass, fieldErrorClass } from '../common/formStyles'

export default function TaskForm({ task = null, onClose, slug }) {
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
            ? await updateTask(task.id, data, slug)
            : await createTask(data, slug)

        if (result.success) onClose()
    }

    return (
        <Modal title={isEditing ? 'Edit Task' : 'New Task'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                    <label className={labelClass}>Title</label>
                    <input
                        {...register('title', { required: 'Title is required' })}
                        placeholder="What needs to be done?"
                        className={inputClass}
                    />
                    {errors.title && <p className={fieldErrorClass}>{errors.title.message}</p>}
                </div>

                <div>
                    <label className={labelClass}>
                        Description <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Add details..."
                        className={`${inputClass} resize-y`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Status</label>
                        <select {...register('status')} className={selectClass}>
                            <option value='todo'>To Do</option>
                            <option value='in_progress'>In Progress</option>
                            <option value='done'>Done</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Priority</label>
                        <select {...register('priority')} className={selectClass}>
                            <option value='low'>Low</option>
                            <option value='medium'>Medium</option>
                            <option value='high'>High</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        Due Date <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </label>
                    <input type="date" {...register('due_date')} className={inputClass} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className={cancelButtonClass} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className={submitButtonClass} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

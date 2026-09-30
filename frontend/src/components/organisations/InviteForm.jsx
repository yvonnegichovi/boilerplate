import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import useOrgStore from '../../context/orgStore'
import Modal from '../common/Modal'
import { labelClass, inputClass, selectClass, cancelButtonClass, submitButtonClass, errorAlertClass, fieldErrorClass } from '../common/formStyles'

export default function InviteForm({ slug, onClose }) {
    const { createInvitation, isSubmitting, error } = useOrgStore()
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: '', role: 'member' },
    })

    const onSubmit = async (data) => {
        const result = await createInvitation(slug, data)
        if (result.success) onClose()
    }

    return (
        <Modal title="Invite a teammate" onClose={onClose}>
            {(error?.email || error?.detail) && (
                <div className={errorAlertClass}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{Array.isArray(error.email) ? error.email[0] : error.email || error.detail}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        placeholder="teammate@company.com"
                        className={inputClass}
                    />
                    {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
                </div>

                <div>
                    <label className={labelClass}>Role</label>
                    <select {...register('role')} className={selectClass}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className={cancelButtonClass} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className={submitButtonClass} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send invite'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

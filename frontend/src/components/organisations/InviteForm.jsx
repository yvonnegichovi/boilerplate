import { useForm } from 'react-hook-form'
import useOrgStore from '../../context/orgStore'

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
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Invite a teammate</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {(error?.email || error?.detail) && (
                    <div className="alert alert-error">
                        {Array.isArray(error.email) ? error.email[0] : error.email || error.detail}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            placeholder="teammate@company.com"
                        />
                        {errors.email && <span className="field-error">{errors.email.message}</span>}
                    </div>

                    <div className="field">
                        <label>Role</label>
                        <select {...register('role')}>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

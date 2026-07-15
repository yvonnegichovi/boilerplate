import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orgApi } from '../api/organisations'
import useAuthStore from '../context/authStore'

export default function InviteAcceptPage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()
    const { register, handleSubmit, formState: { errors } } = useForm()

    const [invite, setInvite] = useState(null)
    const [loadError, setLoadError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    useEffect(() => {
        orgApi.previewInvite(token)
            .then(({ data }) => setInvite(data))
            .catch((err) => setLoadError(err.response?.data?.detail || 'This invitation link is invalid or has expired.'))
            .finally(() => setIsLoading(false))
    }, [token])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            const res = await orgApi.acceptInvite(token, isAuthenticated ? {} : data)
            navigate('/dashboard', { state: { joinedOrg: res.data.organisation } })
        } catch (err) {
            setSubmitError(err.response?.data || { detail: 'Failed to accept invitation.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

    if (isLoading) return <div className="loading">Loading invitation...</div>

    if (loadError) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h1>Invitation not found</h1>
                    <p className="auth-subtitle">{loadError}</p>
                    <Link to="/login" className="btn btn-primary">Back to sign in</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Join {invite.organisation_name}</h1>
                <p className="auth-subtitle">
                    {invite.invited_by_name} invited you to join as <strong>{invite.role}</strong>.
                    This invite expires {formatDate(invite.expires_at)}.
                </p>

                {submitError?.detail && <div className="alert alert-error">{submitError.detail}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {!isAuthenticated && (
                        <>
                            <div className="field-row">
                                <div className="field">
                                    <label>First name</label>
                                    <input {...register('first_name', { required: 'Required' })} />
                                    {errors.first_name && <span className="field-error">{errors.first_name.message}</span>}
                                </div>
                                <div className="field">
                                    <label>Last name</label>
                                    <input {...register('last_name', { required: 'Required' })} />
                                    {errors.last_name && <span className="field-error">{errors.last_name.message}</span>}
                                </div>
                            </div>

                            <div className="field">
                                <label>Email</label>
                                <input value={invite.email} disabled />
                            </div>

                            <div className="field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Minimum 8 characters' },
                                    })}
                                />
                                {errors.password && <span className="field-error">{errors.password.message}</span>}
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Joining...' : `Accept & join ${invite.organisation_name}`}
                    </button>
                </form>

                {!isAuthenticated && (
                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Log in</Link>, then revisit this link.
                    </p>
                )}
            </div>
        </div>
    )
}

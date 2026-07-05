import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated])
  useEffect(() => { return () => clearError() }, [])

  const onSubmit = async (data) => {
    const result = await registerUser(data)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Start building something great</p>

        {error?.detail && <div className="alert alert-error">{error.detail}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
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

          <div className="field">
            <label>Confirm password</label>
            <input
              type="password"
              {...register('password_confirm', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
            {errors.password_confirm && (
              <span className="field-error">{errors.password_confirm.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
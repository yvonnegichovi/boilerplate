import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../context/authStore";

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
    const { register, handleSubmit, formState: { errors } } = useForm()

    useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated])
    useEffect(() => { return () => clearError() }, [])

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password)
        if (result.success) navigate('/dashboard')
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Sign into your account</p>

                {error?.detail && <div className="alert alert-error">{error.detail}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", { required: "Email is required "})}
                        />
                        {errors.email && <span className="field-error">{errors.email.message}</span>}
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                        />
                        {errors.password && <span className="field-error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    No account? <Link to='/register'>Create One</Link>
                </p>
            </div>
        </div>
    )
}
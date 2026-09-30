import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../context/authStore'

export default function ProtectedRoute({ requireStaff = false }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const user = useAuthStore((s) => s.user)

    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (requireStaff) {
        if (user === null) return null
        if (!user.is_staff) return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function DashboardPage() {
    const { user, logout, fetchMe, isLoading } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => { if (!user) fetchMe() }, [])
    
    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    if (isLoading) return <div className='loading'>Loading</div>

    return (
        <div className='dashboard'>
            <header className='dashboard-header'>
                <h1>Dashboard</h1>
                <div className='dashboard-user'>
                    <span>Hello, {user?.first_name || user?.email}</span>
                    <button className='btn btn-outline' onClick={handleLogout}>Sign out</button>
                </div>
            </header>
            <main className='dashboard-body'>
                <div className='card'>
                    <h2>Auth module</h2>
                    <p>You are authenticated. More modules coming next (Tasks, Blog, etc).</p>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
            </main>
        </div>
    )
}

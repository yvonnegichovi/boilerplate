import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
                <div className='dash-grid'>
                    <Link to="/organisations" className="dash-card">
                        <div className='dash-card-icon'>🏢</div>
                        <h2>Organisations</h2>
                        <p>Create organisations, manage members, and send invitations.</p>
                    </Link>
                    <Link to="/tasks" className="dash-card">
                        <div className='dash-card-icon'>✅</div>
                        <h2>Tasks</h2>
                        <p>Create, manage, and track your tasks with priority and due dates.</p>
                    </Link>
                    <div className='dash-card dash-card-soon'>
                        <div className='dash-card-icon'>📝</div>
                        <h2>Blog <span className='coming-soon'>Coming Soon</span></h2>
                        <p>Write and publish posts with categories and tags.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

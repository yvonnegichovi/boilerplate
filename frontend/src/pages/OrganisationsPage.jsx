import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useOrgStore from '../context/orgStore'
import useAuthStore from '../context/authStore'
import OrganisationCard from '../components/organisations/OrganisationCard'
import OrganisationForm from '../components/organisations/OrganisationForm'

export default function OrganisationsPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const { organisations, isLoading, fetchOrganisations } = useOrgStore()
    const [showForm, setShowForm] = useState(false)

    useEffect(() => { fetchOrganisations() }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="org-header-title">
                    <Link to="/dashboard" className="org-back-link">← Dashboard</Link>
                    <h1>Organisations</h1>
                </div>
                <div className="dashboard-user">
                    <span>Hello, {user?.first_name || user?.email}</span>
                    <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="tasks-toolbar">
                    <div className="tasks-count">
                        {organisations.length} {organisations.length === 1 ? 'organisation' : 'organisations'}
                    </div>
                    <button className="btn btn-primary tasks-new-btn" onClick={() => setShowForm(true)}>
                        + New Organisation
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Loading organisations...</div>
                ) : organisations.length === 0 ? (
                    <div className="tasks-empty">
                        <p>You're not part of any organisation yet.</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            Create your first organisation
                        </button>
                    </div>
                ) : (
                    <div className="org-grid">
                        {organisations.map((org) => (
                            <OrganisationCard key={org.id} org={org} />
                        ))}
                    </div>
                )}
            </main>

            {showForm && <OrganisationForm onClose={() => setShowForm(false)} />}
        </div>
    )
}

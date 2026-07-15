import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import useOrgStore from '../context/orgStore'
import useAuthStore from '../context/authStore'
import Avatar from '../components/organisations/Avatar'
import RoleBadge from '../components/organisations/RoleBadge'
import MemberRow from '../components/organisations/MemberRow'
import InvitationRow from '../components/organisations/InvitationRow'
import InviteForm from '../components/organisations/InviteForm'
import OrganisationForm from '../components/organisations/OrganisationForm'

const TABS = ['overview', 'members', 'invitations', 'settings']

export default function OrganisationDetailPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const {
        currentOrg, members, invitations,
        isLoading, isLoadingMembers, isLoadingInvitations,
        fetchOrganisation, fetchMembers, fetchInvitations,
        deleteOrganisation, resetCurrentOrg,
    } = useOrgStore()

    const [tab, setTab] = useState('overview')
    const [showInviteForm, setShowInviteForm] = useState(false)
    const [showSettingsForm, setShowSettingsForm] = useState(false)

    useEffect(() => {
        fetchOrganisation(slug)
        return () => resetCurrentOrg()
    }, [slug])

    useEffect(() => {
        if (tab === 'members') fetchMembers(slug)
        if (tab === 'invitations') fetchInvitations(slug)
    }, [tab, slug])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const canManage = currentOrg?.your_role === 'admin' || currentOrg?.your_role === 'owner'
    const isOwner = currentOrg?.your_role === 'owner'

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${currentOrg.name}"? This cannot be undone.`)) return
        const result = await deleteOrganisation(slug)
        if (result.success) navigate('/organisations')
    }

    if (isLoading && !currentOrg) return <div className="loading">Loading organisation...</div>
    if (!currentOrg) return null

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="org-header-title">
                    <Link to="/organisations" className="org-back-link">← Organisations</Link>
                </div>
                <div className="dashboard-user">
                    <span>Hello, {user?.first_name || user?.email}</span>
                    <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="org-detail-header">
                    <Avatar src={currentOrg.logo} name={currentOrg.name} size={64} />
                    <div>
                        <h1>{currentOrg.name}</h1>
                        <div className="org-detail-meta">
                            <RoleBadge role={currentOrg.your_role} />
                            <span>{currentOrg.member_count} {currentOrg.member_count === 1 ? 'member' : 'members'}</span>
                        </div>
                    </div>
                </div>

                <nav className="org-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            className={`org-tab ${tab === t ? 'org-tab-active' : ''}`}
                            onClick={() => setTab(t)}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </nav>

                {tab === 'overview' && (
                    <div className="org-overview">
                        <div className="stat-card">
                            <span className="stat-value">{currentOrg.member_count}</span>
                            <span className="stat-label">Members</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">
                                {new Date(currentOrg.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </span>
                            <span className="stat-label">Created</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value"><RoleBadge role={currentOrg.your_role} /></span>
                            <span className="stat-label">Your role</span>
                        </div>
                    </div>
                )}

                {tab === 'members' && (
                    <div>
                        <div className="tasks-toolbar">
                            <div className="tasks-count">
                                {members.length} {members.length === 1 ? 'member' : 'members'}
                            </div>
                            {canManage && (
                                <button className="btn btn-primary tasks-new-btn" onClick={() => setShowInviteForm(true)}>
                                    + Invite teammate
                                </button>
                            )}
                        </div>
                        {isLoadingMembers ? (
                            <div className="loading">Loading members...</div>
                        ) : (
                            <div className="member-list">
                                {members.map((m) => (
                                    <MemberRow key={m.id} member={m} slug={slug} canManage={canManage} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'invitations' && (
                    <div>
                        {!canManage ? (
                            <div className="tasks-empty"><p>Only admins and owners can view invitations.</p></div>
                        ) : (
                            <>
                                <div className="tasks-toolbar">
                                    <div className="tasks-count">
                                        {invitations.length} {invitations.length === 1 ? 'invitation' : 'invitations'}
                                    </div>
                                    <button className="btn btn-primary tasks-new-btn" onClick={() => setShowInviteForm(true)}>
                                        + Invite teammate
                                    </button>
                                </div>
                                {isLoadingInvitations ? (
                                    <div className="loading">Loading invitations...</div>
                                ) : invitations.length === 0 ? (
                                    <div className="tasks-empty"><p>No invitations sent yet.</p></div>
                                ) : (
                                    <div className="invitation-list">
                                        {invitations.map((inv) => (
                                            <InvitationRow key={inv.id} invitation={inv} slug={slug} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="org-settings">
                        <div className="settings-section">
                            <h2>General</h2>
                            <p className="settings-description">Update your organisation's name and logo.</p>
                            <button className="btn btn-outline" onClick={() => setShowSettingsForm(true)} disabled={!canManage}>
                                Edit organisation
                            </button>
                        </div>

                        {isOwner && (
                            <div className="settings-section settings-danger">
                                <h2>Danger zone</h2>
                                <p className="settings-description">
                                    Deleting an organisation permanently removes all its data. This cannot be undone.
                                </p>
                                <button className="btn btn-delete-solid" onClick={handleDelete}>
                                    Delete organisation
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {showInviteForm && <InviteForm slug={slug} onClose={() => setShowInviteForm(false)} />}
            {showSettingsForm && (
                <OrganisationForm org={currentOrg} onClose={() => setShowSettingsForm(false)} />
            )}
        </div>
    )
}

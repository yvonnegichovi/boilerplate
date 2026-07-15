import RoleBadge from './RoleBadge'
import InviteStatusBadge from './InviteStatusBadge'
import useOrgStore from '../../context/orgStore'

export default function InvitationRow({ invitation, slug }) {
    const { revokeInvitation } = useOrgStore()

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

    const handleRevoke = async () => {
        if (!window.confirm(`Revoke the invitation sent to ${invitation.email}?`)) return
        await revokeInvitation(slug, invitation.id)
    }

    return (
        <div className="invitation-row">
            <div className="invitation-info">
                <div className="invitation-email">{invitation.email}</div>
                <div className="invitation-meta">
                    Invited by {invitation.invited_by_email} · expires {formatDate(invitation.expires_at)}
                </div>
            </div>
            <div className="invitation-badges">
                <RoleBadge role={invitation.role} />
                <InviteStatusBadge status={invitation.status} />
            </div>
            {invitation.status === 'pending' && (
                <button className="btn-icon btn-delete" onClick={handleRevoke}>Revoke</button>
            )}
        </div>
    )
}

import { X } from 'lucide-react'
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
        <div className="p-4 rounded-xl border border-purple-100 bg-white/90 shadow-sm flex items-center gap-4 hover:border-purple-300 transition">
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{invitation.email}</div>
                <div className="text-xs text-slate-400 truncate">
                    Invited by {invitation.invited_by_email} · expires {formatDate(invitation.expires_at)}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <RoleBadge role={invitation.role} />
                <InviteStatusBadge status={invitation.status} />
            </div>
            {invitation.status === 'pending' && (
                <button
                    type="button"
                    onClick={handleRevoke}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                    aria-label="Revoke invitation"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    )
}

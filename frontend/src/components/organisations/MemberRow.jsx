import { useState } from 'react'
import { X } from 'lucide-react'
import Avatar from './Avatar'
import RoleBadge from './RoleBadge'
import useOrgStore from '../../context/orgStore'
import useAuthStore from '../../context/authStore'
import { selectClass } from '../common/formStyles'

export default function MemberRow({ member, slug, canManage }) {
    const { updateMemberRole, removeMember } = useOrgStore()
    const { user } = useAuthStore()
    const [saving, setSaving] = useState(false)

    const isSelf = user?.email === member.email
    const isOwner = member.role === 'owner'

    const handleRoleChange = async (e) => {
        setSaving(true)
        await updateMemberRole(slug, member.id, e.target.value)
        setSaving(false)
    }

    const handleRemove = async () => {
        if (!window.confirm(`Remove ${member.full_name || member.email} from the organisation?`)) return
        await removeMember(slug, member.id)
    }

    return (
        <div className="p-4 rounded-xl border border-purple-100 bg-white/90 shadow-sm flex items-center gap-4 hover:border-purple-300 transition">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar src={member.avatar} name={member.full_name || member.email} size={40} />
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{member.full_name || member.email}</div>
                    <div className="text-xs text-slate-400 truncate">{member.email}</div>
                </div>
            </div>

            <div className="flex-shrink-0">
                {canManage && !isOwner ? (
                    <select value={member.role} onChange={handleRoleChange} disabled={saving} className={`${selectClass} w-auto py-1.5 text-xs`}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                ) : (
                    <RoleBadge role={member.role} />
                )}
            </div>

            <div className="flex-shrink-0">
                {canManage && !isOwner && !isSelf && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        aria-label="Remove member"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}

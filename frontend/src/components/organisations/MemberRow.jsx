import { useState } from 'react'
import Avatar from './Avatar'
import RoleBadge from './RoleBadge'
import useOrgStore from '../../context/orgStore'
import useAuthStore from '../../context/authStore'

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
        <div className="member-row">
            <div className="member-info">
                <Avatar src={member.avatar} name={member.full_name || member.email} size={40} />
                <div>
                    <div className="member-name">{member.full_name || member.email}</div>
                    <div className="member-email">{member.email}</div>
                </div>
            </div>

            <div className="member-role">
                {canManage && !isOwner ? (
                    <select value={member.role} onChange={handleRoleChange} disabled={saving}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                ) : (
                    <RoleBadge role={member.role} />
                )}
            </div>

            <div className="member-actions">
                {canManage && !isOwner && !isSelf && (
                    <button className="btn-icon btn-delete" onClick={handleRemove}>Remove</button>
                )}
            </div>
        </div>
    )
}

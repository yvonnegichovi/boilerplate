import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import RoleBadge from './RoleBadge'

export default function OrganisationCard({ org }) {
    return (
        <Link to={`/organisations/${org.slug}`} className="org-card">
            <div className="org-card-top">
                <Avatar src={org.logo} name={org.name} size={44} />
                <RoleBadge role={org.your_role} />
            </div>
            <h3 className="org-card-name">{org.name}</h3>
            <p className="org-card-meta">
                {org.member_count} {org.member_count === 1 ? 'member' : 'members'}
            </p>
        </Link>
    )
}

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrganisationCard from './OrganisationCard'

const baseOrg = {
  id: '1',
  slug: 'acme',
  name: 'Acme',
  member_count: 3,
  your_role: 'admin',
  logo: null,
}

function renderCard(org) {
  return render(
    <MemoryRouter>
      <OrganisationCard org={org} />
    </MemoryRouter>
  )
}

describe('OrganisationCard', () => {
  it('renders the org name, member count and role', () => {
    renderCard(baseOrg)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('3 members')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('singularizes the member count label', () => {
    renderCard({ ...baseOrg, member_count: 1 })
    expect(screen.getByText('1 member')).toBeInTheDocument()
  })

  it('links to the organisation detail page by slug', () => {
    renderCard(baseOrg)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/organisations/acme')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoleBadge from './RoleBadge'

describe('RoleBadge', () => {
  it('renders the label for a known role', () => {
    render(<RoleBadge role="owner" />)
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it.each([
    ['admin', 'Admin'],
    ['member', 'Member'],
  ])('renders %s as %s', (role, label) => {
    render(<RoleBadge role={role} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('renders nothing for a falsy role', () => {
    const { container } = render(<RoleBadge role={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('falls back to the raw value for an unknown role', () => {
    render(<RoleBadge role="superadmin" />)
    expect(screen.getByText('superadmin')).toBeInTheDocument()
  })
})

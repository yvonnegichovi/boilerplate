import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InviteStatusBadge from './InviteStatusBadge'

describe('InviteStatusBadge', () => {
  it.each([
    ['pending', 'Pending'],
    ['accepted', 'Accepted'],
    ['expired', 'Expired'],
    ['revoked', 'Revoked'],
  ])('renders %s as %s', (statusValue, label) => {
    render(<InviteStatusBadge status={statusValue} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('falls back to the raw value for an unknown status', () => {
    render(<InviteStatusBadge status="mystery" />)
    expect(screen.getByText('mystery')).toBeInTheDocument()
  })
})

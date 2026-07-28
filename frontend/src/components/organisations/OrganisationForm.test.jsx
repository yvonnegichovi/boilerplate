import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrganisationForm from './OrganisationForm'
import useOrgStore from '../../context/orgStore'

vi.mock('../../context/orgStore')
 
describe('OrganisationForm', () => {
  const createOrganisation = vi.fn()
  const updateOrganisation = vi.fn()
 
  beforeEach(() => {
    vi.clearAllMocks()
    useOrgStore.mockReturnValue({
      createOrganisation,
      updateOrganisation,
      isSubmitting: false,
      error: null,
    })
  })
 
  it('requires a name before submitting', async () => {
    const user = userEvent.setup()
    render(<OrganisationForm onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /create organisation/i }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(createOrganisation).not.toHaveBeenCalled()
  })
 
  it('submits the name and closes on success', async () => {
    const onClose = vi.fn()
    createOrganisation.mockResolvedValue({ success: true, data: { slug: 'acme' } })
    const user = userEvent.setup()
    render(<OrganisationForm onClose={onClose} />)
    await user.type(screen.getByPlaceholderText('Acme Inc.'), 'Acme Inc.')
    await user.click(screen.getByRole('button', { name: /create organisation/i }))
    await waitFor(() => expect(createOrganisation).toHaveBeenCalled())
    expect(createOrganisation.mock.calls[0][0]).toEqual({ name: 'Acme Inc.' })
    expect(onClose).toHaveBeenCalled()
  })
 
  it('stays open when creation fails', async () => {
    const onClose = vi.fn()
    createOrganisation.mockResolvedValue({ success: false, error: { name: ['Taken'] } })
    const user = userEvent.setup()
    render(<OrganisationForm onClose={onClose} />)
    await user.type(screen.getByPlaceholderText('Acme Inc.'), 'Dup')
    await user.click(screen.getByRole('button', { name: /create organisation/i }))
    await waitFor(() => expect(createOrganisation).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
  })
 
  it('shows edit-mode copy and pre-fills the name when given an existing org', () => {
    render(<OrganisationForm org={{ name: 'Acme', slug: 'acme', logo: null }} onClose={() => {}} />)
    expect(screen.getByText('Organisation settings')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
 
  it('calls onClose when the cancel button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<OrganisationForm onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
 
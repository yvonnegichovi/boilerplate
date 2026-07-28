import { describe, it, except, vi, beforeEach, expect } from 'vitest'
import { orgApi } from '../api/organisations'
import useOrgStore from './orgStore'

vi.mock('../api/organisations', () => ({
    orgApi: {
        list: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        listMembers: vi.fn(),
        updateMemberRole: vi.fn(),
        removeMember: vi.fn(),
        listInvitations: vi.fn(),
        createInvitation: vi.fn(),
        revokeInvitation: vi.fn(),
    },
}))

const initialState = useOrgStore.getState()

beforeEach(() => {
    useOrgStore.setState(initialState, true)
    vi.clearAllMocks()
})

describe('useOrgStore', () => {
    describe('fetchOrganisations', () => {
        it('stores paginated results', async () => {
            orgApi.list.mockResolvedValue({ data: { results: [{ id: '1', name: 'Acme' }] } })
            await useOrgStore.getState().fetchOrganisations()
            expect(useOrgStore.getState().organisations).toEqual([{ id: '1', name: 'Acme' }])
            expect(useOrgStore.getState().isLoading).toBe(false)
        })

        it('falls back to a plain array response', async () => {
            orgApi.list.mockResolvedValue({ data: [{ id: '1', name: 'Acme' }] })
            await useOrgStore.getState().fetchOrganisations()
            expect(useOrgStore.getState().organisations).toEqual([{ id: '1', name: 'Acme' }])
        })

        it('records an aerror on failure', async () => {
            orgApi.list.mockRejectedValue({ response: { data: { detail: 'Nope' } } })
            await useOrgStore.getState().fetchOrganisations()
            expect(useOrgStore.getState().error).toEqual({ detail: 'Nope' })
            expect(useOrgStore.getState().isLoading).toBe(false)
        })
    })

    describe('createOrganisation', () => {
        it('appends the created org and reports success', async () => {
            orgApi.create.mockResolvedValue({ data: { id: '2', name: 'New Org' } })
            const result = await useOrgStore.getState().createOrganisation({ name: 'New Org' })
            expect(result).toEqual({ success: true, data: { id: '2', name: 'New Org' } })
            expect(useOrgStore.getState().organisations).toEqual([{ id: '2', name: 'New Org' }])
        })

        it('reports the server validation error on failure', async () => {
            orgApi.create.mockRejectedValue({ response: { data: { name: ['Required'] } } })
            const result = await useOrgStore.getState().createOrganisation({ name: '' })
            expect(result.success).toBe(false)
            expect(result.error).toEqual({ name: ['Required'] })
        })
    })

    describe('updateOrganisation', () => {
        it('updates both currentOrg and the matching list entry', async () => {
            useOrgStore.setState({
                currentOrg: { slug: 'acme', name: 'Acme' },
                organisations: [{ slug: 'acme', name: 'Acme' }]
            })
            orgApi.update.mockResolvedValue({ data: { slug: 'acme', name: 'Acme Renamed' } })
            const result = await useOrgStore.getState().updateOrganisation('acme', { name: 'Acme Rename' })
            expect(result.success).toBe(true)
            expect(useOrgStore.getState().currentOrg.name).toBe('Acme Renamed')
            expect(useOrgStore.getState().organisations[0].name).toBe('Acme Renamed')
        })
    })

    describe('deleteOrganisation', () => {
        it('removes the org and clears currentOrg when it matches', async () => {
            useOrgStore.setState({
                currentOrg: { slug: 'acme' },
                organisations: [{ slug: 'acme' }, { slug: 'other' }],
            })
            orgApi.delete.mockResolvedValue({})
            const result = await useOrgStore.getState().deleteOrganisation('acme')
            expect(result).toEqual({ success: true })
            expect(useOrgStore.getState().organisations).toEqual([{ slug: 'other'}])
            expect(useOrgStore.getState().currentOrg).toBeNull()
        })

        it('leaves currentOrg untouched when a different org is deleted', async () => {
            useOrgStore.setState({
                currentOrg: { slug: 'keep-me' },
                organisations: [{ slug: 'keep-me' }, { slug: 'other' }],
            })
            orgApi.delete.mockResolvedValue({})
            await useOrgStore.getState().deleteOrganisation('other')
            expect(useOrgStore.getState().currentOrg).toEqual({ slug: 'keep-me' })
        })
    })

    describe('updateMemberRole', () => {
        it('replaces the member entry in place', async () => {
            useOrgStore.setState({ members: [{ id: 'm1', role: 'member' }] })
            orgApi.updateMemberRole.mockResolvedValue({ data: { id: 'm1', role: 'admin' } })
            await useOrgStore.getState().updateMemberRole('acme', 'm1', 'admin')
            expect(useOrgStore.getState().members).toEqual([{ id: 'm1', role: 'admin' }])
        })
    })

    describe('removeMember', () => {
        it('removes the member from the list', async () => {
            useOrgStore.setState({ members: [{ id: 'm1' }, { id: 'm2' }] })
            orgApi.removeMember.mockResolvedValue({})
            await useOrgStore.getState().removeMember('acme', 'm1')
            expect(useOrgStore.getState().members).toEqual([{ id: 'm2' }])
        })
    })

    describe('createInvitation', () => {
        it('prepends the new invitation', async () => {
            useOrgStore.setState({ invitations: [{ id: 'i1' }] })
            orgApi.createInvitation.mockResolvedValue({ data: { id: 'i2' } })
            await useOrgStore.getState().createInvitation('acme', { email: 'x@example.com' })
            expect(useOrgStore.getState().invitations).toEqual([{ id: 'i2' }, { id: 'i1' }])
        })
    })

    describe('revokeInvitation', () => {
        it('marks the invitation revoked without removing it', async () => {
            useOrgStore.setState({ invitations: [{ id: 'i1', status: 'pending' }]})
            orgApi.revokeInvitation.mockResolvedValue({})
            await useOrgStore.getState().revokeInvitation('acme', 'i1')
            expect(useOrgStore.getState().invitations).toEqual([{ id: 'i1', status: 'revoked' }])
        })
    })

    describe('resetCurrentOrg', () => {
        it('clears currentOrg, members and invitations', () => {
            useOrgStore.setState({ currentOrg: {}, members: [{}], invitations: [{}] })
            useOrgStore.getState().resetCurrentOrg()
            const state = useOrgStore.getState()
            expect(state.currentOrg).toBeNull()
            expect(state.members).toEqual([])
            expect(state.invitations).toEqual([])
        })
    })
})

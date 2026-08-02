import { create } from 'zustand'
import { orgApi } from '../api/organisations'

const useOrgStore = create((set, get) => ({
    organisations: [],
    currentOrg: null,
    members: [],
    invitations: [],

    isLoading: false,
    isLoadingMembers: false,
    isLoadingInvitations: false,
    isSubmitting: false,
    error: null,

    fetchOrganisations: async () => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await orgApi.list()
            set({ organisations: data.results ?? data, isLoading: false })
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load organisations.' }, isLoading: false })
        }
    },

    createOrganisation: async (payload) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await orgApi.create(payload)
            set((s) => ({ organisations: [...s.organisations, data], isSubmitting: false }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to create organisation.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    fetchOrganisation: async (slug) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await orgApi.get(slug)
            set({ currentOrg: data, isLoading: false })
            return { success: true, data }
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load organisation.' }, isLoading: false, currentOrg: null })
            return { success: false }
        }
    },

    updateOrganisation: async (slug, payload) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await orgApi.update(slug, payload)
            set((s) => ({
                currentOrg: data,
                organisations: s.organisations.map((o) => (o.slug === slug ? data : o)),
                isSubmitting: false,
            }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to update organisation.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    deleteOrganisation: async (slug) => {
        try {
            await orgApi.delete(slug)
            set((s) => ({
                organisations: s.organisations.filter((o) => o.slug !== slug),
                currentOrg: s.currentOrg?.slug === slug ? null : s.currentOrg,
            }))
            return { success: true }
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to delete organisation.' } })
            return { success: false }
        }
    },

    fetchMembers: async (slug) => {
        set({ isLoadingMembers: true, error: null })
        try {
            const { data } = await orgApi.listMembers(slug)
            set({ members: data.results ?? data, isLoadingMembers: false })
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load members.' }, isLoadingMembers: false })
        }
    },

    updateMemberRole: async (slug, memberId, role) => {
        try {
            const { data } = await orgApi.updateMemberRole(slug, memberId, role)
            set((s) => ({ members: s.members.map((m) => (m.id === memberId ? data : m)) }))
            return { success: true }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to update member role.' }
            set({ error })
            return { success: false, error }
        }
    },

    removeMember: async (slug, memberId) => {
        try {
            await orgApi.removeMember(slug, memberId)
            set((s) => ({ members: s.members.filter((m) => m.id !== memberId) }))
            return { success: true }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to remove member.' }
            set({ error })
            return { success: false, error }
        }
    },

    fetchInvitations: async (slug) => {
        set({ isLoadingInvitations: true, error: null })
        try {
            const { data } = await orgApi.listInvitations(slug)
            set({ invitations: data.results ?? data, isLoadingInvitations: false })
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load invitations.' }, isLoadingInvitations: false })
        }
    },

    createInvitation: async (slug, payload) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await orgApi.createInvitation(slug, payload)
            set((s) => ({ invitations: [data, ...s.invitations], isSubmitting: false }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to send invitation.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    revokeInvitation: async (slug, invitationId) => {
        try {
            await orgApi.revokeInvitation(slug, invitationId)
            set((s) => ({
                invitations: s.invitations.map((i) =>
                    i.id === invitationId ? { ...i, status: 'revoked' } : i
                ),
            }))
            return { success: true }
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to revoke invitation.' } })
            return { success: false }
        }
    },

    clearError: () => set({ error: null }),
    resetCurrentOrg: () => set({ currentOrg: null, members: [], invitations: [] }),
}))

export default useOrgStore

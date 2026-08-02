import api from './client'

export const orgApi = {
    list: () => api.get('/organisations/'),
    create: (data) => api.post('/organisations/', data),
    get: (slug) => api.get(`/organisations/${slug}/`),
    update: (slug, data) => api.patch(`/organisations/${slug}/`, data),
    delete: (slug) => api.delete(`/organisations/${slug}/`),

    listMembers: (slug) => api.get(`/organisations/${slug}/members/`),
    updateMemberRole: (slug, memberId, role) =>
        api.patch(`/organisations/${slug}/members/${memberId}/`, { role }),
    removeMember: (slug, memberId) => api.delete(`/organisations/${slug}/members/${memberId}/`),

    listInvitations: (slug) => api.get(`/organisations/${slug}/invitations/`),
    createInvitation: (slug, data) => api.post(`/organisations/${slug}/invitations/`, data),
    revokeInvitation: (slug, invitationId) =>
        api.delete(`/organisations/${slug}/invitations/${invitationId}/`),

    previewInvite: (token) => api.get(`/invitations/preview/${token}/`),
    acceptInvite: (token, data) => api.post(`/invitations/accept/${token}/`, data),
}

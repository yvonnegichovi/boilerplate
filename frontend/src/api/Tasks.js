import api from './client'

// Tasks can be personal (no slug -> /tasks/) or org-scoped
// (slug provided -> /organisations/{slug}/tasks/).
const basePath = (slug) => (slug ? `/organisations/${slug}/tasks` : '/tasks/')

export const taskApi = {
    list: (params, slug) => api.get(basePath(slug), { params }),
    create: (data, slug) => api.post(basePath(slug), data),
    get: (id, slug) => api.get(`${basePath(slug)}${id}/`),
    update: (id, data, slug) => api.patch(`${basePath(slug)}${id}/`, data),
    delete: (id, slug) => api.delete(`${basePath(slug)}${id}/`),
    stats: (slug) => api.get(`${basePath(slug)}stats/`),
}
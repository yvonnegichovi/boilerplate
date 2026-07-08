import api from './client'

export const taskApi = {
    list: (params) => api.get('/tasks/', { params }),
    create: (data) => api.post('/tasks/', data),
    get: (id) => api.get(`/tasks/${id}/`, data),
    update: (id, data) => api.patch(`/tasks/${id}/`),
    delete: (id) => api.delete(`/tasks/${id}`),
}
import api from './client'

export const authApi = {
    register: (data) => api.post('/auth/register/', data),
    login: (email, password) => api.post('/auth/login/', { email, password }),
    logout: (refresh) => api.post('/auth/logout/', { refresh }),
    getMe: () => api.get('/auth/me/'),
    updateProfile: (data) => api.patch('/auth/me/', data),
    changePassword: (data) => api.put('/auth/change-password/', data),
}

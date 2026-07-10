import { create } from 'zustand'
import { authApi } from '../api/auth'

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,

    register: async (FormData) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await authApi.register(formData)
            localStorage.setItem('access_token', data.tokens.access)
            localStorage.setItem('refresh_token', data.token.refresh)
            set({ user: data.user, isAuthenticated: true, isLoading: false })
            return { success: true }
        } catch (err) {
            const error = err.response?.data || { detail: 'Registration failed.' }
            set({ error, isLoading: false })
            return { success: false, error }
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await authApi.login(email, password)
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            set({ user: data.user, isAuthenticated: true, isLoading: false })
            return { success: true }
        } catch (err) {
            const error = err.response?.data || { detail: 'Invalid credentials.' }
            set({ error, isLoading: false })
            return { success: false, error }
        }
    },

    logout: async () => {
        const refresh = localStorage.getItem('refresh_token')
        try { await authApi.logout(refresh) } catch (_) {}
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
    },

    fetchMe: async () => {
        set({ isLoading: true })
        try {
            const { data } = await authApi.getMe()
            set({ user: data, isAuthenticated: true, isLoading: false })
        } catch (_) {
            set({ user: null, isAuthenticated: false, isLoading: false })
        }
    },

    clearError: () => set({ error: null }),
}))

export default useAuthStore

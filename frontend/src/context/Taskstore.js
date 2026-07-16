import { create } from 'zustand'
import { taskApi } from '../api/Tasks'

// Every action takes an optional trailing `slug`. When provided, the store
// operates on that organisation's tasks; when omitted, it operates on the
// current user's personal tasks.
const useTaskStore = create((set, get) => ({
    tasks: [],
    count: 0,
    stats: null,
    isLoading: false,
    isLoadingStats: false,
    isSubmitting: false,
    error: null,

    fetchTasks: async (params = {}, slug) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await taskApi.list(params, slug)
            set({ tasks: data.results, count: data.count, isLoading: false })
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load tasks.' }, isLoading: false })
        }
    },

    fetchStats: async (slug) => {
        set({ isLoadingStats: true })
        try {
            const { data } = await taskApi.stats(slug)
            set({ stats: data, isLoadingStats: false })
        } catch (err) {
            set({ isLoadingStats: false })
        }
    },

    createTask: async (payload, slug) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await taskApi.create(payload, slug)
            set((s) => ({ tasks: [data, ...s.tasks], count: s.count + 1, isSubmitting: false }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to create task.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    updateTask: async (id, payload, slug) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await taskApi.update(id, payload, slug)
            set((s) => ({
                tasks: s.tasks.map((t) => (t.id === id ? data : t)),
                isSubmitting: false,
            }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to update task.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    deleteTask: async (id, slug) => {
        try {
            await taskApi.delete(id, slug)
            set((s) => ({
                tasks: s.tasks.filter((t) => t.id !== id),
                count: s.count -1,
            }))
            return { success: true }
        } catch (err) {
            return { success: false }
        }
    },

    clearError: () => set({ error: null }),
    resetTasks: () => set({ tasks: [], count: 0, stats: null }),
}))


export default useTaskStore
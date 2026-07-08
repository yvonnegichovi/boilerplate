import { create } from 'zustand'
import { taskApi } from '../api/Tasks'

const useTaskStore = create((set, get) => ({
    tasks: [],
    count: 0,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchTasks: async (params = {}) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await taskApi.list(params)
            set({ tasks: data.results, count: data.count, isLoading: false })
        } catch (err) {
            set({ error: err.response?.data || { detail: 'Failed to load tasks.' }, isLoading: false })
        }
    },

    createTask: async (payload) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await taskApi.create(payload)
            set((s) => ({ tasks: [data, ...s.tasks], count: s.count + 1, isSubmitting: false }))
            return { success: true, data }
        } catch (err) {
            const error = err.response?.data || { detail: 'Failed to create task.' }
            set({ error, isSubmitting: false })
            return { success: false, error }
        }
    },

    updateTask: async (id, payload) => {
        set({ isSubmitting: true, error: null })
        try {
            const { data } = await taskApi.update(id, payload)
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

    deleteTask: async (id) => {
        try {
            await taskApi.delete(id)
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
}))


export default useTaskStore
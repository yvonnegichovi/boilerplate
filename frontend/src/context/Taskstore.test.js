import { describe, it, expect, vi, beforeEach } from "vitest"
import { taskApi } from '../api/Tasks'
import useTaskStore from './Taskstore'

vi.mock('../api/Tasks', () => ({
    taskApi: {
        list: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        stats: vi.fn(),
    },
}))

const initialState = useTaskStore.getState()

beforeEach(() => {
    useTaskStore.setState(initialState, true)
    vi.clearAllMocks()
})

describe('useTaskStore', () => {
    it('fetchTasks stores results/count and forwards the org slug', async () => {
        taskApi.list.mockResolvedValue({ data: { results: [{ id: 't1' }], count: 1 } })
        await useTaskStore.getState().fetchTasks({ status: 'todo' }, 'acme')
        expect(taskApi.list).toHaveBeenCalledWith({ status: 'todo' }, 'acme')
        expect(useTaskStore.getState().tasks).toEqual([{ id: 't1' }])
        expect(useTaskStore.getState().count).toBe(1)
    })

    it('fetchTasks works without a slug (personal tasks', async () => {
        taskApi.list.mockResolvedValue({ data: { results: [], count: 0 } })
        await useTaskStore.getState().fetchTasks()
        expect(taskApi.list).toHaveBeenLastCalledWith({}, undefined)
    })

    it('fetchTasks records an error on failure', async () => {
        taskApi.list.mockRejectedValue({ response: { data: { detail: 'Boom' } } })
        await useTaskStore.getState().fetchTasks()
        expect(useTaskStore.getState().error).toEqual({ detail: 'Boom' })
        expect(useTaskStore.getState().isLoading).toBe(false)
    })

    it('fetchStats stores the aggregate payload', async () => {
        const stats = { total: 2, by_status: { todo: 1, in_progress: 0, done: 1 }, by_prioriy: {}, overdue: 0 }
        taskApi.stats.mockResolvedValue({ data: stats })
        await useTaskStore.getState().fetchStats('acme')
        expect(taskApi.stats).toHaveBeenCalledWith('acme')
        expect(useTaskStore.getState().stats).toEqual(stats)
    })

    it('createTask prepends the created task and increments count', async () => {
        taskApi.create.mockResolvedValue({ data: { id: 't2', title: 'New' } })
        const result = await useTaskStore.getState().createTask({ title: 'New' }, 'acme')
        expect(taskApi.create).toHaveBeenCalledWith({ title: 'New' }, 'acme')
        expect(result.success).toBe(true)
        expect(useTaskStore.getState().tasks[0]).toEqual({ id: 't2', title: 'New' })
        expect(useTaskStore.getState().count).toBe(1)
    })

    it('updateTask replaces the matching task in place', async () => {
        useTaskStore.setState({ tasks: [{ id: 't1', status: 'todo' }] })
        taskApi.update.mockResolvedValue({ data: { id: 't1', status: 'done' } })
        await useTaskStore.getState().updateTask('t1', { status: 'done' }, 'acme')
        expect(taskApi.update).toHaveBeenCalledWith('t1', { status: 'done' }, 'acme')
        expect(useTaskStore.getState().tasks).toEqual([{ id: 't1', status: 'done' }])
    })

    it('deleteTask removes the task and decrements count', async () => {
        useTaskStore.setState({ tasks: [{ id: 't1' }, { id: 't2' }], count: 2 })
        taskApi.delete.mockResolvedValue({})
        const result = await useTaskStore.getState().deleteTask('t1', 'acme')
        expect(taskApi.delete).toHaveBeenCalledWith('t1', 'acme')
        expect(result).toEqual({ success: true })
        expect(useTaskStore.getState().tasks).toEqual([{ id: 't2' }])
        expect(useTaskStore.getState().count).toBe(1)
    })
    
    it('resetTasks clears tasks, count and stats', () => {
        useTaskStore.setState({ tasks: [{}], count: 5, stats: { total: 5 } })
        useTaskStore.getState().resetTasks()
        const state = useTaskStore.getState()
        expect(state.tasks).toEqual([])
        expect(state.count).toBe(0)
        expect(state.stats).toBeNull()
    })
})
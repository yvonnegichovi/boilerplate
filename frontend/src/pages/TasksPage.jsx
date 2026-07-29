import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useTaskStore from "../context/Taskstore"
import useAuthStore from "../context/authStore"
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from "../components/tasks/TaskForm"
import TaskFilters from "../components/tasks/TaskFilters"

export default function TasksPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const { tasks, count, isLoading, fetchTasks } = useTaskStore()

    const [showForm, seetShowForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [filters, setFilters] = useState({})

    useEffect(() => {
        const clean = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== '')
        )
        fetchTasks(clean)
    }, [filters])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const handleEdit = (task) => {
        setEditingTask(task)
        seetShowForm(true)
    }

    const handleCloseForm = () => {
        seetShowForm(false)
        setEditingTask(null)
    }

    return (
        <div className="dashboard">
            <header className="dahsboard-header">
                <h1>Tasks</h1>
                <div className="dashboard-user">
                    <span>Hello, {user?.first_name || user?.email}</span>
                    <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="tasks-toolbar">
                    <div className="tasks-count">
                        {count} {count === 1 ? 'task' : 'tasks' }
                    </div>
                    <TaskFilters filters={filters} onChange={setFilters} />
                    <button className="btn btn-primary tasks-new-btn" onClick={() => seetShowForm(true)}>
                        +New Task
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Loading tasks...</div>
                ) : tasks.length === 0? (
                    <div className="tasks-empty">
                        <p>No tasks yet.</p>
                        <button className="btn btn-primary" onClick={() => seetShowForm(true)}>
                            Create your first task
                        </button>
                    </div>
                ) : (
                    <div className="task-list">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                        ))}
                    </div>
                )}
            </main>

            {showForm && (
                <TaskForm task={editingTask} onClose={handleCloseForm} />
            )}
        </div>
    )
}

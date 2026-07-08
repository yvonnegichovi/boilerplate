import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import TaskPage from './pages/TasksPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './styles/main.css'

export default function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tasks" element={<TaskPage />} />
            </Route>

            <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
        </BrowserRouter>
    )
}

import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

let isRefreshing = false
let queue = []

const processQueue = (error, token = null) => {
    queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
    queue = []
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reeject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push({ resolve, reject })
            })
            .then((token) => {
                original.headers.Authorization = `Bearer ${token}`
                return api(original)
            })
            .catch((err) => Promise.reject(err))
        }
        original._retry = true
        isRefreshing = true

        try {
            const refresh = localStorage.getItem('refresh_token')
            const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
            localStorage.setItem('access_token', data.access)
            processQueue(null, data.access)
            original.headers.Authorization = `Bearer ${data.access}`
            return api(original)
        } catch (err) {
            processQueue(err, null)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export default api

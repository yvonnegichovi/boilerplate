import api from './client'

export const celeryApi = {
    stats: () => api.get('/monitoring/stats/'),
    tasks: (params) => api.get('/monitoring/tasks/', { params }),
    periodicTasks: () => api.get('/monitoring/periodic-tasks/'),
    workers: () => api.get('/monitoring/workers/'),
    // Mints the short-lived cookie apps.monitoring.flower_proxy checks -
    // call this (an authenticated XHR, unlike a plain page navigation)
    // right before sending the browser to /flower/.
    startFlowerSession: () => api.get('/monitoring/flower/session/'),
}

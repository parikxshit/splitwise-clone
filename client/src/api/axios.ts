import axios from 'axios'
import { store } from '@/store'
import { setCredentials, clearCredentials } from '@/store/slices/authSlice'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const accessToken = store.getState().auth.accessToken

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (originalRequest.url === '/auth/refresh') {
                localStorage.removeItem('refreshToken')
                store.dispatch(clearCredentials())
                return Promise.reject(error)
            }

            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                store.dispatch(clearCredentials())
                return Promise.reject(error)
            }

            try {
                const response = await api.post('/auth/refresh', { refreshToken })
                const { accessToken, user } = response.data.data

                store.dispatch(setCredentials({ user, accessToken }))

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch {
                localStorage.removeItem('refreshToken')
                store.dispatch(clearCredentials())
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

export default api
// PublicRoute.tsx
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from '@/store'

function PublicRoute() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default PublicRoute
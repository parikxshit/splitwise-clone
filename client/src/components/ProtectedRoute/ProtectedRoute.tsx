// ProtectedRoute.tsx
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from '@/store'

function ProtectedRoute() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute;
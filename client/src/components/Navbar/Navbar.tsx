import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { clearCredentials } from '@/store/slices/authSlice'
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'

function Navbar() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const user = useSelector((state: RootState) => state.auth.user)

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // clear client side regardless
        } finally {
            localStorage.removeItem('refreshToken')
            dispatch(clearCredentials())
            navigate('/login')
        }
    }

    return (
        <nav className="w-full border-b bg-white px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-gray-800">GitPaid</h1>
                    <div className="hidden sm:flex items-center gap-4">
                        <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/groups" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                            Groups
                        </NavLink>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:block">
                        Hey, <span className="font-medium text-gray-800">{user?.name}</span>
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
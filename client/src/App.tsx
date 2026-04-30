import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { setCredentials, clearCredentials } from './store/slices/authSlice';
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import api from './api/axios';
import Layout from './components/Layout';

function App() {

    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const restoreSession = async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                dispatch(clearCredentials());
                return;
            }

            // refresh the token
            try {
                const response = await api.post('/auth/refresh', { refreshToken });
                const { user, accessToken } = response.data.data;

                dispatch(setCredentials({ user, accessToken }));

            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem('refreshToken')
                dispatch(clearCredentials());
            }
        };

        restoreSession();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/:id" element={<GroupDetail />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
